// AutoCAR Master AI - Background Script

const CONFIG = {
  PORTAL_URL: "https://auto-car-gold.vercel.app/analiz",
  SUPABASE_URL: "https://jwffcfjuydjjzqtwjitn.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_ESKWW6qt0VZL9_GwNEM3Uw_Z8wUMnOM"
};

let trackedTabs = [];
let isAnalyzing = false;
let analysisProgress = 0;
let aiStatusText = "";
let finalReport = null;
let aiError = false;
let collectedVehicles = [];
let isCollecting = false;
let isAnalysisCancelled = false;

// Initialize state
chrome.storage.local.get([
  'trackedTabs', 'isAnalyzing', 'analysisProgress', 'aiStatusText', 
  'finalReport', 'aiError', 'collectedVehicles', 'isCollecting',
  'activeBatchId', 'batchFlatCars', 'batchConfig', 'deviceId'
], async (res) => {
  if (res.trackedTabs) trackedTabs = res.trackedTabs;
  if (res.isAnalyzing !== undefined) isAnalyzing = res.isAnalyzing;
  if (res.analysisProgress !== undefined) analysisProgress = res.analysisProgress;
  if (res.aiStatusText) aiStatusText = res.aiStatusText;
  if (res.finalReport) finalReport = res.finalReport;
  if (res.aiError !== undefined) aiError = res.aiError;
  if (res.collectedVehicles) collectedVehicles = res.collectedVehicles;
  if (res.isCollecting !== undefined) isCollecting = res.isCollecting;

  if (res.activeBatchId && res.isAnalyzing && res.deviceId) {
    let sessionApiKey = '';
    try {
      const keyRes = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/get_session_api_key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ p_device_id: res.deviceId })
      });
      if (keyRes.ok) {
        const keyData = await keyRes.json();
        if (keyData && keyData.api_key) sessionApiKey = keyData.api_key;
      }
    } catch(e) {
      console.error("Auto-resume API Key retrieval failed:", e);
    }
    if (sessionApiKey) {
      console.log("Resuming OpenAI Batch Polling for:", res.activeBatchId);
      resumeBatchPolling(res.activeBatchId, res.batchFlatCars, res.batchConfig, sessionApiKey);
    }
  }
});

const DEFAULT_ANALYZE_PROMPT = `You are a highly realistic, strictly objective, and deeply analytical Automotive Expert AI.
Your goal is to find the ABSOLUTE TRUTH about the car data provided (specs, price, damage history, mileage).
You must calculate all scores using a strict, systematic mathematical formula with weighted criteria. Do not make subjective guesses. Follow these rules:

1. CONDITION SCORE (Base 100):
   Start with 100 points. Deduct penalties:
   - Model Year Penalty: (Current Year 2026 - Model Year) * 2. Max deduction: 25 points.
   - Mileage Penalty: (Kilometer / 15000) * 2. Max deduction: 30 points.
   - Damage Penalty:
     * Changed parts (Değişen): -4 points per part.
     * Painted parts (Boyalı): -2 points per part.
     * Locally painted parts (Lokal Boyalı): -1 point per part.
     * Tramer damage record ratio (Tramer Record / Price): ratio <= 5%: -3 points; 5% < ratio <= 15%: -8 points; ratio > 15%: -15 points.
     * Severe Damage/Salvage Title (Ağır Hasarlı/Pert): -30 points (this penalty is cumulative with other paint/changed penalties, do not lock score to 20).
   - Warranty/Maintenance Bonus: +5 points for cars with active warranty or full dealer service history.
   Formula: Condition Score = Max(0, Min(100, 100 - Model Year Penalty - Mileage Penalty - Damage Penalty + Warranty/Maintenance Bonus))

2. FAIR PRICE SCORE (Base 100):
   Compare listing price against typical market averages for similar cars.
   Calculate the deviation percentage: Deviation = ((Market Average - Listing Price) / Market Average) * 100
   - If listing price is exactly equal to the market average (Deviation = 0): 50 points.
   - If cheaper than average (Deviation > 0): Score = Min(100, 50 + Deviation * 2.5) (Scale from 51 to 100).
   - If more expensive than average (Deviation < 0): Score = Max(0, 50 - Abs(Deviation) * 2.5) (Scale from 0 to 49).
   Formula: Fair Price Score = Calculated Score based on the linear deviation above.

3. MARKET SPEED SCORE (Base 100):
   Calculate based on how common/popular the model is in the Turkish used car market (market presence / listing volume in Turkey, not strictly by segment name) and price/damage adjustments:
   - Base Popularity:
     * Extremely common / highly popular models (e.g., Golf, Passat, Megane, Jetta, Egea, Clio, Focus, Corolla, Polo, Astra): 90 points.
     * Common models / SUV & D segment (e.g., Superb, Tucson, Qashqai, Civic, C-Elysee, Symbol, Fluence, 301, Corsa, Fiesta): 80 points.
     * Rare, niche, or premium special models (e.g., Alfa Romeo, Jaguar, Subaru, Volvo S60, sports cars): 65 points.
   - Price adjustment:
     * If cheap (Fair Price Score >= 55), add 10 points (Max 100).
     * If expensive (Fair Price Score <= 45 and > 30), deduct 20 points.
     * If overpriced / fahiş (Fair Price Score <= 30), deduct 40 points.
   - Damage adjustment:
     * If Severe Damage/Salvage Title (Ağır Hasarlı/Pert), deduct 15 points.
   Formula: Market Speed Score = Max(0, Min(100, Base Popularity + Price Adjustment - Damage Adjustment))

4. PRICE/PERFORMANCE SCORE (Base 100):
   Evaluate whether the car offers good features/trim value and condition relative to its price:
   - Trim Value Score (Package Features):
     * Fully loaded / High-end trims (Highline, Elite, Icon, Titanium, plus premium features like Sunroof/Panoramic Roof, Heated Seats, Leather, LED headlights, ADAS lane keep, etc.): 100 points.
     * Mid-range trims (Comfortline, Touch, Style): 80 points.
     * Base/Entry level trims (Trendline, Joy, Active, empty packages): 50 points.
   Formula: Price/Performance Score = (Condition Score * 0.3) + (Trim Value Score * 0.2) + (Fair Price Score * 0.5)

5. OVERALL SCORE (Base 100):
   This must be the EXACT ARITHMETIC MEAN of the 4 scores above.
   Formula: Overall Score = (Market Speed Score + Price/Performance Score + Fair Price Score + Condition Score) / 4

CRITICAL JSON OUTPUT FORMAT:
You must return ONLY a single, valid JSON object exactly matching the structure below. Do not output markdown, do not output explanations outside the JSON.

{
  "clean_title": "Cleaned up Make, Model and Year of the car (e.g., 'Volkswagen Passat 2015'). Remove advertising words.",
  
  "competitor_analysis": {
    "competitors": ["Competitor 1", "Competitor 2"],
    "text": "Detailed comparison against competitors. Be highly objective, realistic, and highlight any real red flags.",
    "pros": ["Strong point 1", "Strong point 2"],
    "cons": ["Weak point 1", "Weak point 2"]
  },
  
  "market_speed_score": 85,
  "price_perf_score": 60,
  "fair_price_score": 50,
  "condition_score": 40,
  "overall_score": 61,
  
  "ai_report": "A very detailed summary report about the car's technical data in Turkish. YOU MUST EXPLICITLY AND TRANSPARENTLY SHOW the mathematical breakdown of the 5 scores (Condition, Fair Price, Market Speed, Price/Performance, and Overall Score). Show the calculations. Use exactly ONE EMPTY LINE (\\n\\n) between each score's explanation.",
  
  "detailed_specs": [
    { "name": "Spec Name", "value": "Value", "status": "good", "comment": "Detailed expert professional comment explaining why this spec is an advantage or a disadvantage in the real world." }
  ],
  
  "damage_map": {
    "kaput": "orijinal"
  }
}

INSTRUCTIONS FOR SPECIFIC FIELDS:

1. DETAILED SPECS (CRITICAL):
- You MUST EXTRACT AND ANALYZE ALL AVAILABLE SPECS from the data (at least 15-20 specs if available, e.g., Motor Gücü, Model Yılı, Vites Tipi, Yakıt, Renk, Boya/Değişen, Hasar Kaydı vb.).
- Do NOT just pick 3 features. Put ALL OF THEM in the 'detailed_specs' array.
- Write detailed, professional comments for every single one. The status must be one of: 'good', 'bad', or 'neutral'.

2. DAMAGE MAP:
- Map damage values based on user data. Keep keys simple and in Turkish (e.g. 'kaput', 'tavan', 'sag_on_kapi').

GENERAL CRITICAL RULES:
- All text MUST be in TURKISH. 
- Be 100% realistic and purely data-driven.
- Do not trust seller claims or 'clean' labels if the data (like mileage or damage) says otherwise.
- Do NOT hallucinate data. Be totally objective and strict.`;

// Otomatik Cihaz Oturumu Eşitleme (Vercel deploy gerektirmez)
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'local' && (changes.userEmail || changes.deviceId)) {
    const res = await new Promise(r => chrome.storage.local.get(['userEmail', 'deviceId'], r));
    if (res.userEmail && res.deviceId) {
      fetch(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/register_device_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ p_device_id: res.deviceId, p_email: res.userEmail })
      }).catch(console.error);
    }
  }
});

function updateState(updates) {
  if (updates.trackedTabs !== undefined) trackedTabs = updates.trackedTabs;
  if (updates.isAnalyzing !== undefined) isAnalyzing = updates.isAnalyzing;
  if (updates.analysisProgress !== undefined) analysisProgress = updates.analysisProgress;
  if (updates.aiStatusText !== undefined) aiStatusText = updates.aiStatusText;
  if (updates.finalReport !== undefined) finalReport = updates.finalReport;
  if (updates.aiError !== undefined) aiError = updates.aiError;
  if (updates.collectedVehicles !== undefined) collectedVehicles = updates.collectedVehicles;
  if (updates.isCollecting !== undefined) isCollecting = updates.isCollecting;
  chrome.storage.local.set(updates);
}

function addTabToTrackingAndExtract(tabId, url, title, currentTrackedTabs = null) {
  if (currentTrackedTabs) {
    trackedTabs = currentTrackedTabs;
  }
  let existing = trackedTabs.find(t => t.url === url);
  if (existing) {
    if (existing.status === 'Yüklendi' && existing.data) {
      return;
    }
    existing.status = 'Yükleniyor...';
    existing.tabId = tabId;
  } else {
    const newTab = {
      tabId: tabId,
      url: url,
      title: title || url,
      status: 'Yükleniyor...',
      data: null
    };
    trackedTabs.push(newTab);
  }
  updateState({ trackedTabs });

  // Try direct messaging first for instant extraction
  chrome.tabs.sendMessage(tabId, { action: "extract_data" }, (response) => {
    let err = chrome.runtime.lastError;
    if (err || !response) {
      // Content script not loaded or tab sleeping. Try injecting it.
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }, () => {
        let err2 = chrome.runtime.lastError;
        if (err2) {
          // Injection failed, likely discarded/sleeping. Check if discarded and reload in background
          chrome.tabs.get(tabId, (tabInfo) => {
            let errInfo = chrome.runtime.lastError;
            if (!errInfo && tabInfo && tabInfo.discarded) {
              chrome.tabs.reload(tabId);
            } else {
              updateTabStatus(url, 'Hata Oluştu');
            }
          });
        } else {
          // Injection succeeded, try messaging again
          chrome.tabs.sendMessage(tabId, { action: "extract_data" }, (response2) => {
            let err3 = chrome.runtime.lastError;
            if (!err3 && response2 && response2.title) {
              updateTabStatus(url, 'Yüklendi', response2);
            } else {
              updateTabStatus(url, 'Hata Oluştu');
            }
          });
        }
      });
    } else if (response && response.title) {
      updateTabStatus(url, 'Yüklendi', response);
    } else {
      updateTabStatus(url, 'Hata Oluştu');
    }
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.storage.local.get(['isCollecting', 'isAnalyzing', 'trackedTabs'], (res) => {
    const isCollecting = res.isCollecting || false;
    const isAnalyzing = res.isAnalyzing || false;
    const currentTrackedTabs = res.trackedTabs || [];

    if (!isCollecting || isAnalyzing) return;
    const url = changeInfo.url || tab.url;
    if (changeInfo.status === 'complete' && url) {
      if (url.includes('sahibinden.com/ilan/') || url.includes('arabam.com/ilan/')) {
        addTabToTrackingAndExtract(tabId, url, tab.title, currentTrackedTabs);
      }
    }
  });
});

function updateTabStatus(url, status, data = null) {
  chrome.storage.local.get(['trackedTabs'], (res) => {
    trackedTabs = res.trackedTabs || [];
    const t = trackedTabs.find(x => x.url === url);
    if (t) {
      t.status = status;
      if (data) {
        t.data = data;
        t.title = data.title || t.url;
      }
      updateState({ trackedTabs });
    }
  });
}

// ------------------------------------------------------------------
// OPENAI API CALL LOGIC
// ------------------------------------------------------------------
async function callOpenAI(systemPrompt, userContent, apiKey, model = 'gpt-4o-mini', retries = 2) {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('API Hatası: Bu cihaza tanımlı bir oturum bulunamadı. Lütfen web portalından bir kez giriş yapın.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 saniye zaman aşımı

  try {
    let messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(userContent) }
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
        temperature: 0.1
      }),
      signal: controller.signal
    });
    const json = await res.json();
    
    if (!res.ok) {
      if (res.status === 401) throw new Error('API Anahtarı eksik veya geçersiz.');
      if (res.status === 429) {
        if (json.error && json.error.code === 'insufficient_quota') {
          throw new Error('Yapay Zeka (OpenAI) Bakiyeniz Tükenmiştir.');
        }
        if (retries > 0) {
          console.warn(`429 Too Many Requests. Retrying in 4 seconds... (${retries} left)`);
          await new Promise(r => setTimeout(r, 4000));
          return await callOpenAI(systemPrompt, userContent, apiKey, model, retries - 1);
        }
      }
      if (res.status >= 500 && retries > 0) {
          console.warn(`OpenAI Sunucu Hatası. Retrying in 4 seconds... (${retries} left)`);
          await new Promise(r => setTimeout(r, 4000));
          return await callOpenAI(systemPrompt, userContent, apiKey, model, retries - 1);
      }
      throw new Error('Yapay Zeka geçici bir hata verdi. Kod: ' + res.status);
    }
    const parsedJSON = JSON.parse(json.choices[0].message.content);
    clearTimeout(timeoutId);
    return parsedJSON;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(err);
    if (err.name === 'AbortError') {
      if (retries > 0) {
        console.warn(`Zaman aşımı (Timeout). Tekrar deneniyor...`);
        return await callOpenAI(systemPrompt, userContent, apiKey, model, retries - 1);
      } else {
        throw new Error('Yapay Zeka (OpenAI) 50 saniye içinde yanıt vermedi (Zaman Aşımı).');
      }
    } else if (err.message && (err.message.includes('NetworkError') || err.message.includes('Failed to fetch'))) {
      throw new Error(`İnternet bağlantısı koptu veya tarayıcı izin vermedi. Detay: ${err.message}`);
    } else {
      throw err;
    }
  }
}

function getBrandModel(title) {
  if (!title) return 'Diğer Araçlar';
  const cleanTitle = title.trim();
  const lowerTitle = cleanTitle.toLowerCase();
  
  let brand = '';
  let rest = '';
  
  if (lowerTitle.startsWith('alfa romeo')) {
    brand = 'Alfa Romeo';
    rest = cleanTitle.slice(10).trim();
  } else if (lowerTitle.startsWith('aston martin')) {
    brand = 'Aston Martin';
    rest = cleanTitle.slice(12).trim();
  } else if (lowerTitle.startsWith('land rover')) {
    brand = 'Land Rover';
    rest = cleanTitle.slice(10).trim();
  } else {
    const parts = cleanTitle.split(/\s+/);
    brand = parts[0] || 'Diğer';
    rest = parts.slice(1).join(' ');
  }
  
  const modelParts = rest.split(/\s+/);
  const model = modelParts[0] || '';
  
  if (model) {
    return `${brand} ${model}`;
  }
  return brand;
}

async function analyzeCarData(carData, dynamicPrompt, apiKey) {
  const systemPrompt = dynamicPrompt || DEFAULT_ANALYZE_PROMPT;

  const dataForAi = { ...carData };
  delete dataForAi.images;
  
  try {
    return await callOpenAI(systemPrompt, dataForAi, apiKey);
  } catch (error) {
    console.error(`Araç analiz edilemedi (${carData.title}):`, error);
    return {
      clean_title: carData.title || "Bilinmeyen Araç",
      market_speed_score: 0,
      price_perf_score: 0,
      fair_price_score: 0,
      condition_score: 0,
      overall_score: 0,
      ai_report: `Bu araç analiz edilemedi. Hata: ${error.message}`,
      detailed_specs: [],
      competitor_analysis: null,
      damage_map: null
    };
  }
}

async function generateGlobalMasterReport(groupReports, dynamicPrompt, apiKey) {
  const systemPrompt = dynamicPrompt || `Sen sistemin 'Master AI' yöneticisisin. Tüm araç gruplarının analiz raporları sana geliyor. Bu grupları birbiriyle kıyasla, FİYAT-PERFORMANS ve SEGMENT mantığını dikkate alarak gelen araçları sırala ve sana verilen tüm arabaların hepsini değerlendirerek listele. En iyi araçları belirle.
SADECE GEÇERLİ BİR JSON DÖNDÜR.
Format:
{
  "title": "Master AI Derinlemesine Kıyaslama Raporu (Top Seçimler)",
  "logic": "Bu liste neye göre hazırlandı? Kısaca açıkla.",
  "top_10": [
    { 
      "rank": 1,
      "title": "Volkswagen Passat 2015", 
      "score": 95, 
      "comment": "Piyasanın en dolu paketi, fiyatı ise emsallerine göre %10 daha ucuz. Neden birinci seçildiği detayı." 
    },
    { 
      "rank": 2,
      "title": "Skoda Superb 2018", 
      "score": 92, 
      "comment": "Düşük kilometresi ve temiz ekspertizi ile uzun yıllar masrafsız binilecek bir araç. Neden ikinci seçildiği." 
    }
  ],
  "details": [
    { "icon": "info", "title": "Rakipleri Neler?", "desc": "Gelen araçların genel bir piyasa analizi." },
    { "icon": "star", "title": "Bütçe ve Kitle", "desc": "Hangi kitleye hitap ediyorlar?" }
  ]
}
Kurallar:
- "score" alanlarına kafandan puan uydurma! Sana verilen verideki "overall_score" değeri neyse BİREBİR aynısını yaz.
- "title" kısmına ASLA HAM İLAN BAŞLIĞINI KOPYALAMA! Sadece aracın MARKASI, MODELİ ve YILINI tertemiz bir şekilde yaz (Örn: "Volkswagen Passat 2015").
- "comment" kısmı kesinlikle SADECE 1 CÜMLE olmalı. O aracın neden o sıraya yerleştiğini ve öne çıktığını çok vurucu şekilde yaz.
- Sana verilen araçların hepsini "top_10" dizisine sırasıyla ekle.
`;

  const cleanGroupReports = groupReports.map(g => ({
    groupName: g.groupName,
    cars: g.cars.map(c => ({
      title: c.title,
      price: c.price,
      overall_score: c.overall_score,
      ai_report: c.ai_report || ""
    }))
  }));

  return await callOpenAI(systemPrompt, cleanGroupReports, apiKey);
}

// ------------------------------------------------------------------
// RUN FULL ANALYSIS (100 CHUNKS, 60s LIMIT, TIE BREAKER)
// ------------------------------------------------------------------
async function runFullAnalysis() {
  const readyData = trackedTabs.map(t => t.data).filter(d => d !== null);
  
  if (readyData.length === 0) {
    updateState({
      aiStatusText: `Hata: Analiz edilecek araç bulunamadı.`,
      analysisProgress: 100,
      isAnalyzing: false,
      aiError: true
    });
    return;
  }

  try {
    updateState({ aiStatusText: "Sistem konfigürasyonu alınıyor...", analysisProgress: 2 });
    
    let activeConfig = { analyze_prompt: null, master_prompt: null };
    try {
      const configRes = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/get_system_config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
        }
      });
      if (configRes.ok) {
        const configData = await configRes.json();
        if (configData) {
          activeConfig.analyze_prompt = configData.analyze_prompt;
          activeConfig.master_prompt = configData.master_prompt;
        }
      }
    } catch(e) {
      console.warn("System config couldn't be fetched, using defaults.", e);
    }

    let sessionApiKey = '';
    const storageRes = await new Promise(r => chrome.storage.local.get(['deviceId', 'userEmail'], r));
    
    if (storageRes.deviceId && storageRes.userEmail) {
      try {
        await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/register_device_session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ p_device_id: storageRes.deviceId, p_email: storageRes.userEmail })
        });
      } catch(e) {
        console.error("Device session auto-register failed.", e);
      }
    }

    if (storageRes.deviceId) {
      try {
        const keyRes = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/get_session_api_key`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ p_device_id: storageRes.deviceId })
        });
        if (keyRes.ok) {
          const keyData = await keyRes.json();
          if (keyData && keyData.api_key) sessionApiKey = keyData.api_key;
        }
      } catch(e) {
        console.error("API Key couldn't be fetched.", e);
      }
    }

    if (!sessionApiKey) {
      updateState({
        aiStatusText: `Hata: Bu cihaz için oturum bulunamadı. Lütfen Vercel web portalına giriş yapın!`,
        analysisProgress: 100,
        isAnalyzing: false,
        aiError: true
      });
      return;
    }

    updateState({ aiStatusText: "Hazırlanıyor...", analysisProgress: 5 });
    const flatCarsList = readyData.map(carData => ({ carData }));

    let totalCars = flatCarsList.length;
    let processedCars = 0;

    updateState({ aiStatusText: `Analiz başladı. Yapay zeka yanıtları bekleniyor...`, analysisProgress: 5 });
    
    const CHUNK_SIZE = 50;
    const allProcessedCars = [];

    for (let i = 0; i < flatCarsList.length; i += CHUNK_SIZE) {
      if (isAnalysisCancelled) break;

      const chunk = flatCarsList.slice(i, i + CHUNK_SIZE);
      
      const chunkPromises = chunk.map(async (item) => {
        const { carData: cData } = item;
        const finalReport = await analyzeCarData(cData, activeConfig.analyze_prompt, sessionApiKey);

        processedCars++;
        updateState({ 
          aiStatusText: `Araçlar analiz ediliyor (${processedCars}/${totalCars})...`,
          analysisProgress: 5 + Math.round((processedCars / totalCars) * 80)
        });

        let cleanTitle = finalReport.clean_title || cData.title;
        if (!finalReport.clean_title || finalReport.clean_title.length > 50) {
          const match = cData.title.match(/(?:[12][0-9]{3})/);
          if (match) {
            cleanTitle = `${cData.title.split(' ')[0]} ${match[0]} Model`;
          } else {
            cleanTitle = cData.title.split(' ')[0];
          }
        }

        const groupName = getBrandModel(cleanTitle);

        return {
          groupName: groupName,
          carData: {
            title: cleanTitle,
            price: cData.price,
            url: cData.url,
            images: cData.images, 
            market_speed_score: (finalReport.market_speed_score !== undefined && finalReport.market_speed_score !== null) ? finalReport.market_speed_score : null,
            price_perf_score: (finalReport.price_perf_score !== undefined && finalReport.price_perf_score !== null) ? finalReport.price_perf_score : null,
            fair_price_score: (finalReport.fair_price_score !== undefined && finalReport.fair_price_score !== null) ? finalReport.fair_price_score : null,
            condition_score: (finalReport.condition_score !== undefined && finalReport.condition_score !== null) ? finalReport.condition_score : null,
            overall_score: (finalReport.overall_score !== undefined && finalReport.overall_score !== null) ? finalReport.overall_score : null,
            ai_report: (finalReport.ai_report && finalReport.ai_report.trim().length > 0) ? finalReport.ai_report : "Bu araç için analiz oluşturulamadı (Veri eksikliği veya OpenAI yanıt vermedi).",
            vision_report: null,
            defects: [],
            positives: [],
            competitor_analysis: finalReport.competitor_analysis || null,
            detailed_specs: finalReport.detailed_specs || [],
            damage_map: finalReport.damage_map || null
          }
        };
      });

      const chunkResults = await Promise.all(chunkPromises);
      allProcessedCars.push(...chunkResults);

      if (i + CHUNK_SIZE < flatCarsList.length && !isAnalysisCancelled) {
        updateState({ 
          aiStatusText: `Limit koruması: 5 saniye bekleniyor...`,
        });
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    if (isAnalysisCancelled) return;

    // -------------------------------------------------------------
    // SISTEM KONTROL AŞAMASI (HATA ALAN ARAÇLARI YENİDEN ANALİZ ETME)
    // -------------------------------------------------------------
    if (!isAnalysisCancelled) {
      const failedItems = [];
      allProcessedCars.forEach((item, index) => {
        if (
          !item.carData.overall_score || 
          item.carData.overall_score === 0 || 
          (item.carData.ai_report && item.carData.ai_report.includes("analiz edilemedi"))
        ) {
          failedItems.push({
            index: index,
            carData: flatCarsList[index].carData
          });
        }
      });

      if (failedItems.length > 0) {
        updateState({ 
          aiStatusText: `Sistem Kontrolü: Hata alan ${failedItems.length} araç tespit edildi. Yeniden analiz ediliyor...`,
          analysisProgress: 80
        });
        await new Promise(r => setTimeout(r, 3000));

        let retryProcessed = 0;
        const RETRY_CHUNK_SIZE = 15; // Eşzamanlı limit
        
        for (let j = 0; j < failedItems.length; j += RETRY_CHUNK_SIZE) {
          if (isAnalysisCancelled) break;
          
          const retryChunk = failedItems.slice(j, j + RETRY_CHUNK_SIZE);
          const retryPromises = retryChunk.map(async (failedItem) => {
            const { index, carData: cData } = failedItem;
            
            const finalReport = await analyzeCarData(cData, activeConfig.analyze_prompt, sessionApiKey);
            retryProcessed++;
            updateState({
              aiStatusText: `Tekrar deneniyor (${retryProcessed}/${failedItems.length})...`
            });

            if (finalReport.overall_score > 0 && (!finalReport.ai_report || !finalReport.ai_report.includes("analiz edilemedi"))) {
              let cleanTitle = finalReport.clean_title || cData.title;
              if (!finalReport.clean_title || finalReport.clean_title.length > 50) {
                const match = cData.title.match(/(?:[12][0-9]{3})/);
                if (match) {
                  cleanTitle = `${cData.title.split(' ')[0]} ${match[0]} Model`;
                } else {
                  cleanTitle = cData.title.split(' ')[0];
                }
              }
              const groupName = getBrandModel(cleanTitle);

              allProcessedCars[index] = {
                groupName: groupName,
                carData: {
                  title: cleanTitle,
                  price: cData.price,
                  url: cData.url,
                  images: cData.images, 
                  market_speed_score: (finalReport.market_speed_score !== undefined && finalReport.market_speed_score !== null) ? finalReport.market_speed_score : null,
                  price_perf_score: (finalReport.price_perf_score !== undefined && finalReport.price_perf_score !== null) ? finalReport.price_perf_score : null,
                  fair_price_score: (finalReport.fair_price_score !== undefined && finalReport.fair_price_score !== null) ? finalReport.fair_price_score : null,
                  condition_score: (finalReport.condition_score !== undefined && finalReport.condition_score !== null) ? finalReport.condition_score : null,
                  overall_score: (finalReport.overall_score !== undefined && finalReport.overall_score !== null) ? finalReport.overall_score : null,
                  ai_report: (finalReport.ai_report && finalReport.ai_report.trim().length > 0) ? finalReport.ai_report : "Bu araç için analiz oluşturulamadı (Veri eksikliği veya OpenAI yanıt vermedi).",
                  vision_report: null,
                  defects: [],
                  positives: [],
                  competitor_analysis: finalReport.competitor_analysis || null,
                  detailed_specs: finalReport.detailed_specs || [],
                  damage_map: finalReport.damage_map || null
                }
              };
            }
          });

          await Promise.all(retryPromises);

          if (j + RETRY_CHUNK_SIZE < failedItems.length && !isAnalysisCancelled) {
            updateState({ 
              aiStatusText: `Tekrar deneme limit koruması: 3 saniye bekleniyor...`,
            });
            await new Promise(r => setTimeout(r, 3000));
          }
        }
      }
    }

    if (isAnalysisCancelled) return;

    const groupsMap = {};
    allProcessedCars.forEach(item => {
      const gName = item.groupName;
      if (!groupsMap[gName]) {
        groupsMap[gName] = [];
      }
      let carDataCopy = { ...item.carData };
      if (carDataCopy.images && carDataCopy.images.length > 3) {
        carDataCopy.images = carDataCopy.images.slice(0, 3);
      }
      groupsMap[gName].push(carDataCopy);
    });

    const allGroupReports = Object.keys(groupsMap).map(gName => ({
      groupName: gName,
      group_logic: `${gName} analizi tamamlandı.`,
      cars: groupsMap[gName]
    }));

    await compileMasterReportAndComplete(allGroupReports, activeConfig, sessionApiKey);

  } catch (error) {
    updateState({
      aiError: true,
      aiStatusText: `Hata: ${error.message}`,
      isAnalyzing: true,
      finalReport: null
    });
  }
}

async function compileMasterReportAndComplete(allGroupReports, activeConfig, sessionApiKey) {
  updateState({ aiStatusText: `Master AI Tüm Grupları Kıyaslıyor...`, analysisProgress: 85 });

  let topCars = [];
  for (let g of allGroupReports) {
    for (let c of g.cars) {
      topCars.push({ groupName: g.groupName, car: c });
    }
  }
  
  topCars.sort((a, b) => {
    let scoreA = parseInt(a.car.overall_score, 10) || 0;
    let scoreB = parseInt(b.car.overall_score, 10) || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (a.car.url || "").localeCompare(b.car.url || "");
  });

  let topN = 10;
  if (topCars.length > 10) {
    let tenthScore = parseInt(topCars[9].car.overall_score, 10) || 0;
    while (topN < topCars.length && (parseInt(topCars[topN].car.overall_score, 10) || 0) >= tenthScore) {
       topN++;
    }
  }
  
  const masterHavuz = topCars.slice(0, topN);
  
  const masterGroupReports = masterHavuz.map(item => ({
    groupName: item.groupName,
    cars: [item.car]
  }));

  updateState({ aiStatusText: "Büyük Master AI Raporu oluşturuluyor...", analysisProgress: 95 });
  const globalSummary = await generateGlobalMasterReport(masterGroupReports, activeConfig.master_prompt, sessionApiKey);

  updateState({
    analysisProgress: 100,
    aiStatusText: `Analiz Tamamlandı!`,
    isAnalyzing: false,
    finalReport: { groups: allGroupReports, summaryData: globalSummary },
    activeBatchId: null,
    batchFlatCars: null,
    batchConfig: null
  });
}

// ------------------------------------------------------------------
// MESSAGE LISTENER
// ------------------------------------------------------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.storage.local.get([
    'trackedTabs', 'isAnalyzing', 'analysisProgress', 'aiStatusText', 
    'finalReport', 'aiError', 'collectedVehicles', 'isCollecting'
  ], (res) => {
    if (res.trackedTabs) trackedTabs = res.trackedTabs;
    if (res.isAnalyzing !== undefined) isAnalyzing = res.isAnalyzing;
    if (res.analysisProgress !== undefined) analysisProgress = res.analysisProgress;
    if (res.aiStatusText) aiStatusText = res.aiStatusText;
    if (res.finalReport) finalReport = res.finalReport;
    if (res.aiError !== undefined) aiError = res.aiError;
    if (res.collectedVehicles) collectedVehicles = res.collectedVehicles;
    if (res.isCollecting !== undefined) isCollecting = res.isCollecting;

    handleMessage(request, sender, sendResponse);
  });
  return true; // Asenkron yanıt kanalı açık kalsın
});

function handleMessage(request, sender, sendResponse) {
  if (request.action === 'passive_extract') {
    if (!isCollecting || isAnalyzing) {
      sendResponse({ success: false });
      return;
    }
    const data = request.data;
    let existing = trackedTabs.find(t => t.url === data.url);
    if (!existing) {
      const newTab = {
        tabId: sender.tab ? sender.tab.id : `passive_${Date.now()}_${Math.random()}`,
        url: data.url,
        title: data.title,
        status: 'Yüklendi',
        data: data
      };
      trackedTabs.push(newTab);
      updateState({ trackedTabs });
    } else {
      if (!existing.data) {
        existing.status = 'Yüklendi';
        existing.data = data;
        existing.title = data.title;
        updateState({ trackedTabs });
      }
    }
    sendResponse({ success: true });
    return;
  }

  if (request.action === 'get_state') {
    sendResponse({
      tabs: trackedTabs,
      isAnalyzing: isAnalyzing,
      progress: analysisProgress,
      aiText: aiStatusText,
      finalReport: finalReport,
      isError: aiError,
      collectedCount: trackedTabs.length,
      collectedVehicles: trackedTabs,
      isCollecting: isCollecting
    });
    return;
  }

  if (request.action === 'set_collecting') {
    updateState({ isCollecting: request.value });
    
    if (request.value === true) {
      chrome.tabs.query({}, (tabs) => {
        let matchedTabs = tabs.filter(tab => {
          const url = tab.url;
          return url && (url.includes('sahibinden.com/ilan/') || url.includes('arabam.com/ilan/'));
        });
        
        let delay = 0;
        matchedTabs.forEach(tab => {
          setTimeout(() => {
            chrome.storage.local.get(['trackedTabs'], (res) => {
              const currentTabs = res.trackedTabs || [];
              addTabToTrackingAndExtract(tab.id, tab.url, tab.title, currentTabs);
            });
          }, delay);
          delay += 150;
        });
      });
    }

    sendResponse({ success: true });
    return;
  }

  if (request.action === 'remove_vehicle') {
    collectedVehicles = collectedVehicles.filter(v => v.url !== request.url);
    updateState({ collectedVehicles: collectedVehicles });
    sendResponse({ success: true });
    return;
  }

  if (request.action === 'reset_memory') {
    isAnalysisCancelled = true;
    updateState({
      trackedTabs: [],
      finalReport: null,
      aiError: false,
      isAnalyzing: false,
      aiStatusText: '',
      isCollecting: false
    });
    sendResponse({ success: true });
    return;
  }

  if (request.action === 'cancel_analysis') {
    isAnalysisCancelled = true;
    
    chrome.storage.local.get(['activeBatchId', 'deviceId'], async (res) => {
      if (res.activeBatchId && res.deviceId) {
        let sessionApiKey = '';
        try {
          const keyRes = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/get_session_api_key`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': CONFIG.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ p_device_id: res.deviceId })
          });
          if (keyRes.ok) {
            const keyData = await keyRes.json();
            if (keyData && keyData.api_key) sessionApiKey = keyData.api_key;
          }
        } catch(e) {}
        if (sessionApiKey) {
          cancelOpenAIBatch(res.activeBatchId, sessionApiKey);
        }
      }
    });

    updateState({
      trackedTabs: [],
      finalReport: null,
      aiError: false,
      isAnalyzing: false,
      aiStatusText: '',
      isCollecting: false,
      analysisProgress: 0,
      activeBatchId: null,
      batchFlatCars: null,
      batchConfig: null
    });
    sendResponse({ success: true });
    return;
  }

  if (request.action === 'show_report') {
    if (!finalReport) {
      sendResponse({ success: false });
      return;
    }
    const portalUrl = CONFIG.PORTAL_URL;
    chrome.tabs.create({ url: portalUrl }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            world: 'MAIN',
            func: (data) => {
              window.localStorage.setItem('autocar_ai_result', JSON.stringify(data));
              window.dispatchEvent(new Event('autocar_report_ready'));
            },
            args: [finalReport]
          });
        }
      });
    });
    sendResponse({ success: true });
    return;
  }

  if (request.action === 'remove_tab') {
    trackedTabs = trackedTabs.filter(t => t.url !== request.url);
    updateState({ trackedTabs: trackedTabs });
    sendResponse({ success: true });
    return;
  }

  if (request.action === 'start_analysis') {
    const readyData = trackedTabs.map(t => t.data).filter(d => d !== null);
    if (readyData.length === 0) {
      updateState({ aiError: true, aiStatusText: "Analiz edilecek araç verisi yok." });
      sendResponse({ success: false });
      return;
    }
    isAnalysisCancelled = false;
    updateState({ isAnalyzing: true, analysisProgress: 5, aiStatusText: "Yapay Zeka Hazırlanıyor..." });
    runFullAnalysis();
    sendResponse({ success: true });
    return;
  }
}
