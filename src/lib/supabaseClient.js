import { createClient } from '@supabase/supabase-js'

// Kedua nilai ini diambil dari file .env (lihat .env.example)
// JANGAN pernah menaruh kunci rahasia (service_role key) di sini —
// hanya "anon public key" yang boleh dipakai di frontend.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[IMPROVEHUB] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diset. ' +
    'Salin .env.example menjadi .env dan isi dengan kredensial project Supabase Anda.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
