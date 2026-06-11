import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jwffcfjuydjjzqtwjitn.supabase.co';
const supabaseAnonKey = 'sb_publishable_ESKWW6qt0VZL9_GwNEM3Uw_Z8wUMnOM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectZeros() {
  const { data, error } = await supabase
    .from('analyses_history')
    .select('report_json')
    .eq('id', '2544551359')
    .single();

  if (data && data.report_json) {
    const report = data.report_json;
    let zeroCount = 0;
    
    console.log("Analyzing zero-score cars...");
    console.log("================================");
    
    report.groups?.forEach(g => {
      g.cars?.forEach(c => {
        if (c.overall_score === 0 || c.overall_score === null || c.overall_score === undefined) {
          zeroCount++;
          if (zeroCount <= 10) {
            console.log(`\nZero Car #${zeroCount}:`);
            console.log("Title:", c.title);
            console.log("Price:", c.price);
            console.log("URL:", c.url);
            console.log("AI Report:", c.ai_report);
          }
        }
      });
    });
    console.log("================================");
    console.log("Total zero cars:", zeroCount);
  }
}

inspectZeros();
