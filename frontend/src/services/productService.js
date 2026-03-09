import { supabase, getImageUrl } from '../lib/supabase';

const BUCKET_NAME = 'product-images';

// Get all products with optional filters
export const getProducts = async (filters = {}) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .in('status', ['active', 'draft'])
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }
  if (filters.categorySlug) {
    query = query.eq('category.slug', filters.categorySlug);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map(transformProduct);
};

// Get products by category name
export const getProductsByCategory = async (categoryName) => {
  // First get the category ID
  const { data: categoryData } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', categoryName)
    .single();

  if (!categoryData) {
    console.log('Category not found:', categoryName);
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq('category_id', categoryData.id)
    .in('status', ['active', 'draft'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  return data.map(transformProduct);
};

// Get single product by ID
export const getProductById = async (id) => {
  console.log('Fetching product with ID:', id);
  
  // First try to get product with reviews
  let { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
  
  console.log('Product data received:', data);
  return transformProduct(data);
};

// Get single product by slug
export const getProductBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      reviews(
        id,
        rating,
        title,
        comment,
        created_at,
        customer:customers(name)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error) throw error;
  return transformProduct(data);
};

// Get featured products (for homepage)
export const getFeaturedProducts = async (limit = 8) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .in('status', ['active', 'draft'])
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.map(transformProduct);
};

// Get new arrivals (for homepage)
export const getNewArrivals = async (limit = 8) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .in('status', ['active', 'draft'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.map(transformProduct);
};

// Get all categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

// Search products
export const searchProducts = async (query) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .in('status', ['active', 'draft'])
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(transformProduct);
};

// Transform product data for frontend use
const transformProduct = (product) => {
  if (!product) return null;
  
  // Handle image URL - could be stored as 'image_url', 'thumbnail', or in images array
  let imageUrl = null;
  if (product.image_url) {
    // If it's already a full URL, use it; otherwise construct from bucket
    if (product.image_url.startsWith('http')) {
      imageUrl = product.image_url;
    } else {
      imageUrl = getImageUrl(BUCKET_NAME, product.image_url);
    }
  } else if (product.thumbnail) {
    if (product.thumbnail.startsWith('http')) {
      imageUrl = product.thumbnail;
    } else {
      imageUrl = getImageUrl(BUCKET_NAME, product.thumbnail);
    }
  } else if (product.images && product.images.length > 0) {
    // Use first image from images array
    const firstImage = product.images[0];
    if (firstImage && firstImage.startsWith('http')) {
      imageUrl = firstImage;
    } else if (firstImage) {
      imageUrl = getImageUrl(BUCKET_NAME, firstImage);
    }
  }
  
  return {
    ...product,
    // Map database fields to frontend expected fields
    image_url: imageUrl,
    image: imageUrl,
    images: product.images?.map(img => 
      img && img.startsWith('http') ? img : getImageUrl(BUCKET_NAME, img)
    ).filter(Boolean) || [],
    price: product.price,
    originalPrice: product.compare_at_price,
    original_price: product.compare_at_price,
    discount: product.compare_at_price 
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : 0,
    rating: product.average_rating || product.rating || 0,
    reviewCount: product.review_count || 0,
    review_count: product.review_count || 0,
    inStock: product.stock_quantity > 0 || product.stock > 0,
    stock: product.stock_quantity || product.stock || 0,
    category_name: product.category?.name || product.category_name || 'Uncategorized',
    category_slug: product.category?.slug || 'jewelry',
    // Reviews transformation
    reviews: product.reviews?.map(review => ({
      ...review,
      customer_name: review.customer?.name || 'Anonymous',
      customerName: review.customer?.name || 'Anonymous',
      date: new Date(review.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    })) || []
  };
};

export default {
  getProducts,
  getProductsByCategory,
  getProductById,
  getProductBySlug,
  getFeaturedProducts,
  getNewArrivals,
  getCategories,
  searchProducts
};
