import { supabase, uploadImage, deleteImage, getImageUrl } from '../../lib/supabase';

const BUCKET_NAME = 'product-images';

// ==================== PRODUCTS API ====================

export const productsApi = {
  // Get all products with optional filters
  async getAll(filters = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .order('created_at', { ascending: false });

    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Add image URLs
    return data.map(product => ({
      ...product,
      thumbnail_url: product.thumbnail ? getImageUrl(BUCKET_NAME, product.thumbnail) : null,
      image_urls: product.images?.map(img => getImageUrl(BUCKET_NAME, img)) || []
    }));
  },

  // Get single product by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      thumbnail_url: data.thumbnail ? getImageUrl(BUCKET_NAME, data.thumbnail) : null,
      image_urls: data.images?.map(img => getImageUrl(BUCKET_NAME, img)) || []
    };
  },

  // Create new product
  async create(productData, imageFiles = []) {
    // Upload images first
    const imagePaths = [];
    let thumbnailPath = null;

    for (let i = 0; i < imageFiles.length; i++) {
      const path = await uploadImage(BUCKET_NAME, imageFiles[i], 'products/');
      imagePaths.push(path);
      if (i === 0) thumbnailPath = path; // First image as thumbnail
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        images: imagePaths,
        thumbnail: thumbnailPath
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update product
  async update(id, productData, newImageFiles = [], imagesToDelete = []) {
    // Delete old images
    for (const path of imagesToDelete) {
      await deleteImage(BUCKET_NAME, path).catch(console.error);
    }

    // Upload new images
    const newPaths = [];
    for (const file of newImageFiles) {
      const path = await uploadImage(BUCKET_NAME, file, 'products/');
      newPaths.push(path);
    }

    // Merge with existing images (excluding deleted ones)
    const existingImages = productData.images?.filter(img => !imagesToDelete.includes(img)) || [];
    const allImages = [...existingImages, ...newPaths];

    const { data, error } = await supabase
      .from('products')
      .update({
        ...productData,
        images: allImages,
        thumbnail: allImages[0] || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete product
  async delete(id) {
    // Get product to delete images
    const product = await this.getById(id);
    
    // Delete images from storage
    if (product.images?.length) {
      for (const path of product.images) {
        await deleteImage(BUCKET_NAME, path).catch(console.error);
      }
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Bulk delete
  async bulkDelete(ids) {
    for (const id of ids) {
      await this.delete(id);
    }
  },

  // Update stock
  async updateStock(id, newStock) {
    const { data, error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update product status
  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('products')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get low stock products
  async getLowStock() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lt('stock', supabase.raw('low_stock_threshold'))
      .order('stock', { ascending: true });

    if (error) throw error;
    return data;
  }
};

// ==================== CATEGORIES API ====================

export const categoriesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ==================== ORDERS API ====================

export const ordersApi = {
  async getAll(filters = {}) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers(id, first_name, last_name, email),
        items:order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }
    if (filters.search) {
      query = query.or(`order_number.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`);
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        items:order_items(
          *,
          product:products(id, name, sku, thumbnail)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(id, status) {
    const updates = { status };
    
    // Auto-set timestamps based on status
    if (status === 'shipped') {
      updates.shipped_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePaymentStatus(id, payment_status, payment_id = null) {
    const updates = { payment_status };
    if (payment_id) updates.payment_id = payment_id;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addTrackingNumber(id, tracking_number) {
    const { data, error } = await supabase
      .from('orders')
      .update({ tracking_number })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addAdminNotes(id, admin_notes) {
    const { data, error } = await supabase
      .from('orders')
      .update({ admin_notes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get order statistics
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: allOrders } = await supabase
      .from('orders')
      .select('total, status, created_at');

    const stats = {
      totalOrders: allOrders?.length || 0,
      totalRevenue: allOrders?.reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0,
      pendingOrders: allOrders?.filter(o => o.status === 'pending').length || 0,
      todayOrders: allOrders?.filter(o => new Date(o.created_at) >= today).length || 0
    };

    return stats;
  }
};

// ==================== CUSTOMERS API ====================

export const customersApi = {
  async getAll(filters = {}) {
    let query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        orders:orders(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, customerData) {
    const { data, error } = await supabase
      .from('customers')
      .update(customerData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleActive(id, is_active) {
    const { data, error } = await supabase
      .from('customers')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ==================== COUPONS API ====================

export const couponsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByCode(code) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) throw error;
    return data;
  },

  async create(couponData) {
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        ...couponData,
        code: couponData.code.toUpperCase()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, couponData) {
    const { data, error } = await supabase
      .from('coupons')
      .update({
        ...couponData,
        code: couponData.code?.toUpperCase()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleActive(id, is_active) {
    const { data, error } = await supabase
      .from('coupons')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Validate coupon for checkout
  async validate(code, cartTotal) {
    const coupon = await this.getByCode(code);
    
    if (!coupon) {
      throw new Error('Invalid coupon code');
    }
    if (!coupon.is_active) {
      throw new Error('This coupon is no longer active');
    }
    if (coupon.end_date && new Date(coupon.end_date) < new Date()) {
      throw new Error('This coupon has expired');
    }
    if (coupon.start_date && new Date(coupon.start_date) > new Date()) {
      throw new Error('This coupon is not yet valid');
    }
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      throw new Error('This coupon has reached its usage limit');
    }
    if (coupon.minimum_purchase && cartTotal < coupon.minimum_purchase) {
      throw new Error(`Minimum purchase of ₹${coupon.minimum_purchase} required`);
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (cartTotal * coupon.discount_value) / 100;
      if (coupon.maximum_discount) {
        discount = Math.min(discount, coupon.maximum_discount);
      }
    } else {
      discount = coupon.discount_value;
    }

    return {
      valid: true,
      coupon,
      discount: Math.round(discount)
    };
  },

  // Increment usage count
  async incrementUsage(id) {
    const { data, error } = await supabase.rpc('increment_coupon_usage', { coupon_id: id });
    if (error) throw error;
    return data;
  }
};

// ==================== REVIEWS API ====================

export const reviewsApi = {
  async getAll(filters = {}) {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        product:products(id, name, sku, thumbnail),
        customer:customers(id, first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.product_id) {
      query = query.eq('product_id', filters.product_id);
    }
    if (filters.rating) {
      query = query.eq('rating', filters.rating);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addResponse(id, admin_response) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ 
        admin_response,
        responded_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get reviews for a product (public)
  async getForProduct(productId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        customer:customers(first_name, last_name)
      `)
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// ==================== DASHBOARD STATS API ====================

export const dashboardApi = {
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get orders data
    const { data: orders } = await supabase
      .from('orders')
      .select('total, status, payment_status, created_at');

    // Get products data
    const { data: products } = await supabase
      .from('products')
      .select('id, stock, low_stock_threshold, status');

    // Get customers data
    const { data: customers } = await supabase
      .from('customers')
      .select('id, created_at');

    // Calculate stats
    const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0;
    const todayOrders = orders?.filter(o => new Date(o.created_at) >= today) || [];
    const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
    const lowStockProducts = products?.filter(p => p.stock <= (p.low_stock_threshold || 5) && p.status === 'active') || [];
    const newCustomers = customers?.filter(c => new Date(c.created_at) >= thirtyDaysAgo) || [];

    return {
      totalSales: totalRevenue,
      ordersToday: todayOrders.length,
      pendingOrders: pendingOrders.length,
      lowStockItems: lowStockProducts.length,
      totalProducts: products?.filter(p => p.status === 'active').length || 0,
      totalCustomers: customers?.length || 0,
      newCustomersThisMonth: newCustomers.length
    };
  },

  async getRecentOrders(limit = 5) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, total, status, created_at,
        customer:customers(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getLowStockProducts(limit = 5) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock, thumbnail')
      .eq('status', 'active')
      .lt('stock', 5)
      .order('stock', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data?.map(p => ({
      ...p,
      thumbnail_url: p.thumbnail ? getImageUrl(BUCKET_NAME, p.thumbnail) : null
    }));
  }
};
