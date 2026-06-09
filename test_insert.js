import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jwffcfjuydjjzqtwjitn.supabase.co', 'sb_publishable_ESKWW6qt0VZL9_GwNEM3Uw_Z8wUMnOM');

async function testInsert() {
  const newId = Math.floor(Math.random() * 9000000000) + 1000000000;
  console.log("Testing insert with id:", newId);
  const { data, error } = await supabase.from('analyses_history').insert([
    {
      id: newId,
      user_email: 'test@example.com',
      role: 'Kullanıcı',
      car_details: 'Test Araç',
      score: 85,
      report_json: { test: "data" }
    }
  ]);
  
  if (error) {
    console.error("Insert failed:", error);
  } else {
    console.log("Insert succeeded:", data);
  }
}

testInsert();
