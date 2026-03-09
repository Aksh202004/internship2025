import { supabase, getImageUrl } from '../lib/supabase';
import { incrementCouponUsage } from './couponService';

const BUCKET_NAME = 'product-images';

/**
 * Generate a unique order number
 */
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${year}-${random}`;
};

/**
 * Create or get customer by email
 */
const getOrCreateCustomer = async (customerData) => {
  // First check if customer exists
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('email', customerData.email)
    .single();

  if (existing) {
    // Update customer info
    const { data, error } = await supabase
      .from('customers')
      .update({
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        phone: customerData.phone,
      })
      .eq('id', existing.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Create new customer
  const { data, error } = await supabase
    .from('customers')
    .insert({
      email: customerData.email,
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      phone: customerData.phone,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create a new order
 */
export const createOrder = async ({ 
  cartItems, 
  shippingAddress, 
  billingAddress,
  customerEmail,
  subtotal,
  shippingCost,
  tax,
  discount,
  total,
  coupon,
  notes 
}) => {
  try {
    // Get or create customer
    const customer = await getOrCreateCustomer({
      email: customerEmail,
      firstName: shippingAddress.firstName,
      lastName: shippingAddress.lastName,
      phone: shippingAddress.phone,
    });

    // Create order
    const orderData = {
      order_number: generateOrderNumber(),
      customer_id: customer.id,
      customer_email: customerEmail,
      status: 'pending',
      payment_status: 'pending',
      subtotal,
      shipping_cost: shippingCost,
      tax,
      discount: discount || 0,
      total,
      coupon_code: coupon?.code || null,
      coupon_id: coupon?.id || null,
      shipping_address: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address: shippingAddress.address,
        apartment: shippingAddress.apartment,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        phone: shippingAddress.phone,
      },
      billing_address: billingAddress || shippingAddress,
      notes: notes || null,
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_sku: item.sku || `${item.id}-SKU`,
      product_image: item.image,
      quantity: item.quantity,
      price: parseFloat(item.price.replace(/[₹$,]/g, '')),
      metal_type: item.metalType || null,
      size: item.size || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Increment coupon usage if a coupon was applied
    if (coupon?.id) {
      await incrementCouponUsage(coupon.id).catch(console.error);
    }

    return {
      success: true,
      order: {
        ...order,
        items: orderItems,
      },
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: error.message || 'Failed to create order',
    };
  }
};

/**
 * Get orders for a customer
 */
export const getCustomerOrders = async (customerEmail) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('customer_email', customerEmail)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map(order => ({
    ...order,
    items: order.items.map(item => ({
      ...item,
      image_url: item.product_image?.startsWith('http') 
        ? item.product_image 
        : getImageUrl(BUCKET_NAME, item.product_image)
    }))
  }));
};

/**
 * Get single order by ID
 */
export const getOrderById = async (orderId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', orderId)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    items: data.items.map(item => ({
      ...item,
      image_url: item.product_image?.startsWith('http') 
        ? item.product_image 
        : getImageUrl(BUCKET_NAME, item.product_image)
    }))
  };
};

/**
 * Get order by order number
 */
export const getOrderByNumber = async (orderNumber) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('order_number', orderNumber)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update order payment status (after Razorpay callback)
 */
export const updateOrderPayment = async (orderId, paymentData) => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      payment_status: paymentData.status,
      payment_id: paymentData.paymentId,
      payment_method: paymentData.method || 'razorpay',
      status: paymentData.status === 'paid' ? 'confirmed' : 'pending',
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
