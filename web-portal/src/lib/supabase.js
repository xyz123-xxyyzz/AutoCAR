import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-supabase-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

// Eğer ortam değişkenleri (API anahtarları) yoksa, sistem çökmesin diye simülasyon modunda çalışır.
export const isSimulationMode = !import.meta.env.VITE_SUPABASE_URL;

export const supabase = createClient(supabaseUrl, supabaseKey);
