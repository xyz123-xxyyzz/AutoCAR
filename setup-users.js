import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jwffcfjuydjjzqtwjitn.supabase.co', 'sb_publishable_ESKWW6qt0VZL9_GwNEM3Uw_Z8wUMnOM');

async function setup() {
  console.log("Inserting into vip_users...");
  const { data: insertData, error: insertError } = await supabase.from('vip_users').insert([
    { email: 'kagulle31@gmail.com', role: 'sahip' }
  ]);
  console.log('Insert:', insertError ? insertError.message : 'Success');
}

setup();
