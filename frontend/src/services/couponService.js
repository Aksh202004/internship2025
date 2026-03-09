import { supabase } from '../lib/supabase';

/**
 * Get coupon by code
 */
export const getCouponByCode = async (code) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Invalid coupon code');
    }
    throw error;
  }
  return data;
};

/**
 * Validate coupon and calculate discount
 */
export const validateCoupon = async (code, cartTotal) => {
  try {
    const coupon = await getCouponByCode(code);

    // Check if coupon is active
    if (!coupon.is_active) {
      return { valid: false, error: 'This coupon is no longer active' };
    }

    // Check if coupon has expired
    if (coupon.end_date && new Date(coupon.end_date) < new Date()) {
      return { valid: false, error: 'This coupon has expired' };
    }

    // Check if coupon is not yet valid
    if (coupon.start_date && new Date(coupon.start_date) > new Date()) {
      return { valid: false, error: 'This coupon is not yet valid' };
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return { valid: false, error: 'This coupon has reached its usage limit' };
    }

    // Check minimum purchase
    if (coupon.minimum_purchase && cartTotal < coupon.minimum_purchase) {
      return { 
        valid: false, 
        error: `Minimum purchase of ₹${coupon.minimum_purchase.toLocaleString()} required` 
      };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (cartTotal * coupon.discount_value) / 100;
      // Apply maximum discount cap if set
      if (coupon.maximum_discount && discount > coupon.maximum_discount) {
        discount = coupon.maximum_discount;
      }
    } else {
      // Fixed amount discount
      discount = Math.min(coupon.discount_value, cartTotal);
    }

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        maximum_discount: coupon.maximum_discount,
        description: coupon.description
      },
      discount: Math.round(discount),
      message: coupon.discount_type === 'percentage' 
        ? `${coupon.discount_value}% off applied!`
        : `₹${coupon.discount_value} off applied!`
    };
  } catch (error) {
    return { valid: false, error: error.message || 'Invalid coupon code' };
  }
};

/**
 * Increment coupon usage after successful order
 */
export const incrementCouponUsage = async (couponId) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('usage_count')
    .eq('id', couponId)
    .single();

  if (error) throw error;

  const { error: updateError } = await supabase
    .from('coupons')
    .update({ usage_count: (data.usage_count || 0) + 1 })
    .eq('id', couponId);

  if (updateError) throw updateError;
};
