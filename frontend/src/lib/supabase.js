import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseDirectUrl = process.env.REACT_APP_SUPABASE_DIRECT_URL;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get public URL for images (routed through proxy)
export const getImageUrl = (bucket, path) => {
  if (!path) return null;
  
  // Get the public URL from Supabase
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  
  // If using proxy, the URL is already correct
  // If it still points to direct Supabase URL, route through proxy
  if (supabaseDirectUrl && data.publicUrl.includes(supabaseDirectUrl)) {
    return data.publicUrl.replace(supabaseDirectUrl, supabaseUrl);
  }
  
  return data.publicUrl;
};

// Upload image to storage
export const uploadImage = async (bucket, file, folder = '') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;
  return data.path;
};

// Delete image from storage
export const deleteImage = async (bucket, path) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) throw error;
};

export default supabase;
