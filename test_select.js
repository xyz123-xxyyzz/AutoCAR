import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jwffcfjuydjjzqtwjitn.supabase.co', 'sb_publishable_ESKWW6qt0VZL9_GwNEM3Uw_Z8wUMnOM');

async function testSelect() {
  console.log("Testing select...");
  const { data, error } = await supabase.from('analyses_history').select('*').limit(1);
  
  if (error) {
    console.error("Select failed:", error);
  } else {
    console.log("Select succeeded. Found records:", data ? data.length : 0);
  }
}

testSelect();
