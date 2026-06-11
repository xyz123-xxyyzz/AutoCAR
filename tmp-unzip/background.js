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
chrome.storage.local.get(['trackedTabs', 'isAnalyzing', 'analysisProgress', 'aiStatusText', 'finalReport', 'aiError', 'collectedVehicles', 'isCollecting'], (res) => {
  if (res.trackedTabs) trackedTabs = res.trackedTabs;
  if (res.isAnalyzing !== undefined) isAnalyzing = res.isAnalyzing;
  if (res.analysisProgress !== undefined) analysisProgress = res.analysisProgress;
  if (res.aiStatusText) aiStatusText = res.aiStatusText;
  if (res.finalReport) finalReport = res.finalReport;
  if (res.aiError !== undefined) aiError = res.aiError;
  if (res.collectedVehicles) collectedVehicles = res.collectedVehicles;
  if (res.isCollecting !== undefined) isCollecting = res.isCollecting;
});

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

function addTabToTrackingAndExtract(tabId, url, title) {
  let existingUrl = trackedTabs.find(t => t.url === url || t.tabId === tabId);
  if (existingUrl) return;

  const newTab = {
    tabId: tabId,
    url: url,
    title: title || url,
    status: 'Yükleniyor...',
    data: null
  };
  trackedTabs.push(newTab);
  updateState({ trackedTabs });
  
  setTimeout(() => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }, () => {
      if (chrome.runtime.lastError) {
        updateTabStatus(tabId, 'Hata Oluştu');
      } else {
        chrome.tabs.sendMessage(tabId, { action: "extract_data" }, (response) => {
          if (chrome.runtime.lastError) {
            updateTabStatus(tabId, 'Hata Oluştu');
          } else if (response && response.title) {
            updateTabStatus(tabId, 'Yüklendi', response);
          } else {
            updateTabStatus(tabId, 'Hata Oluştu');
          }
        });
      }
    });
  }, 1500);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!isCollecting || isAnalyzing) return;
  const url = changeInfo.url || tab.url;
  if (changeInfo.status === 'complete' && url) {
    if (url.includes('sahibinden.com/ilan/') || url.includes('arabam.com/ilan/')) {
      addTabToTrackingAndExtract(tabId, url, tab.title);
    }
  }
});

function updateTabStatus(tabId, status, data = null) {
  const t = trackedTabs.find(x => x.tabId === tabId);
  if (t) {
    t.status = status;
    if (data) {
      t.data = data;
      t.title = data.title || t.url;
    }
    updateState({ trackedTabs });
  }
}

// ------------------------------------------------------------------
// OPENAI API CALL LOGIC
// ------------------------------------------------------------------
async function callOpenAI(systemPrompt, userContent, apiKey, model = 'gpt-4o-mini', retries = 3) {
  return new Promise(async (resolve, reject) => {
      if (!apiKey || apiKey.trim().length === 0) {
        return reject(new Error('API Hatası: Bu cihaza tanımlı bir oturum bulunamadı. Lütfen web portalından bir kez giriş yapın.'));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 40000); // 40 saniye zaman aşımı

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
            response_format: { type: 'json_object' }
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
              return resolve(await callOpenAI(systemPrompt, userContent, apiKey, model, retries - 1));
            }
          }
          if (res.status >= 500 && retries > 0) {
              console.warn(`OpenAI Sunucu Hatası. Retrying in 4 seconds... (${retries} left)`);
              await new Promise(r => setTimeout(r, 4000));
              return resolve(await callOpenAI(systemPrompt, userContent, apiKey, model, retries - 1));
          }
          throw new Error('Yapay Zeka geçici bir hata verdi. Kod: ' + res.status);
        }
        const parsedJSON = JSON.parse(json.choices[0].message.content);
        clearTimeout(timeoutId);
        resolve(parsedJSON);
      } catch (err) {
        clearTimeout(timeoutId);
        console.error(err);
        if (err.name === 'AbortError') {
          if (retries > 0) {
            console.warn(`Zaman aşımı (Timeout). Tekrar deneniyor...`);
            return resolve(await callOpenAI(systemPrompt, userContent, apiKey, model, retries - 1));
          } else {
            reject(new Error('İşlem çok uzun sürdüğü için zaman aşımına uğradı. (OpenAI yanıt vermedi)'));
          }
        } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
          reject(new Error(`İnternet bağlantısı koptu veya tarayıcı izin vermedi. Detay: ${err.message}`));
        } else {
          reject(err);
        }
      }
    });
}

function groupTabsByModel(readyData) {
  const groups = {};
  readyData.forEach(car => {
    let titleParts = car.title.split(' ');
    let groupName = 'Diğer Araçlar';
    if (titleParts.length >= 2) {
      groupName = `${titleParts[0]} ${titleParts[1]}`;
    } else if (titleParts.length === 1) {
      groupName = titleParts[0];
    }
    
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(car);
  });
  return groups;
}

async function analyzeCarData(carData, dynamicPrompt, apiKey) {
  const systemPrompt = dynamicPrompt || `You are a highly realistic, strictly objective, and deeply analytical Automotive Expert AI.
Your goal is to find the ABSOLUTE TRUTH about the car data provided (specs, price, damage history, mileage).
Do not trust seller exaggerations or marketing fluff. Be 100% realistic and fair based purely on data.

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
  
  "ai_report": "A very detailed summary report about the car's technical data in Turkish. YOU MUST EXPLICITLY AND TRANSPARENTLY EXPLAIN WHY YOU GAVE THE SPECIFIC SCORES for Satış Hızı, Fiyat/Performans, Uygunluk, and Araç Durumu. Break down the reasoning for the 4 scores. Use exactly ONE EMPTY LINE (\\n\\n) between each score's explanation.",
  
  "detailed_specs": [
    { "name": "Spec Name", "value": "Value", "status": "good", "comment": "Detailed expert professional comment explaining why this spec is an advantage or a disadvantage in the real world." }
  ],
  
  "damage_map": {
    "kaput": "orijinal"
  }
}

INSTRUCTIONS FOR SPECIFIC FIELDS:

1. SCORING (INTEGERS ONLY):
- market_speed_score: 0-100 (Volume of listings / popularity).
- price_perf_score: 0-100 (Features vs Price).
- fair_price_score: 0-100 (Is it priced at fair market value? Evaluate realistically).
- condition_score: 0-100 (Year, Mileage, Damage).
- overall_score: EXACT ARITHMETIC MEAN of the above 4 scores.

2. DETAILED SPECS (CRITICAL):
- You MUST EXTRACT AND ANALYZE ALL AVAILABLE SPECS from the data (at least 15-20 specs if available, e.g., Motor Gücü, Model Yılı, Vites Tipi, Yakıt, Renk, Boya/Değişen, Hasar Kaydı vb.).
- Do NOT just pick 3 features. Put ALL OF THEM in the 'detailed_specs' array.
- Write detailed, professional comments for every single one. The status must be one of: 'good', 'bad', or 'neutral'.

3. DAMAGE MAP:
- Map damage values based on user data. Keep keys simple and in Turkish (e.g. 'kaput', 'tavan', 'sag_on_kapi').

GENERAL CRITICAL RULES:
- All text MUST be in TURKISH. 
- Be 100% realistic and purely data-driven.
- Do not trust seller claims or 'clean' labels if the data (like mileage or damage) says otherwise.
- Do NOT hallucinate data. Be totally objective and strict.`;

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
      ai_report: "Bu araç API yanıt vermediği için veya zaman aşımı nedeniyle analiz edilemedi.",
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
      // Önce Vercel'den alınan (veya eklentideki) email-cihaz eşleşmesini zorla Supabase'e kaydet (Vercel deploy edilmese bile çalışması için)
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

    updateState({ aiStatusText: "Araçlar gruplandırılıyor...", analysisProgress: 5 });
    const groups = groupTabsByModel(readyData);
    const groupNames = Object.keys(groups);
    let allGroupReports = [];
    
    let totalCars = readyData.length;
    let processedCars = 0;
    
    const flatCarsList = [];
    for (let g = 0; g < groupNames.length; g++) {
      const gName = groupNames[g];
      const gCars = groups[gName];
      for (let i = 0; i < gCars.length; i++) {
        flatCarsList.push({ groupName: gName, carData: gCars[i] });
      }
    }

    // Mükemmel Asenkron Kuyruk (Promise Queue) - Max Concurrency: 5
    // Chrome'un bağlantı sınırını asla aşmaz. Bitenin yerine anında yenisini alır.
    updateState({ aiStatusText: `Analiz başladı. Yapay zeka yanıtları bekleniyor...`, analysisProgress: 5 });
    
    const chunkResults = new Array(flatCarsList.length).fill(null);
    let currentIndex = 0;
    let activeWorkers = 0;

    await new Promise((resolveQueue) => {
      function startNext() {
        if (isAnalysisCancelled) {
           if (activeWorkers === 0) resolveQueue();
           return;
        }
        
        if (currentIndex >= flatCarsList.length) {
           if (activeWorkers === 0) resolveQueue();
           return;
        }

        const workIndex = currentIndex++;
        activeWorkers++;
        const item = flatCarsList[workIndex];
        const { groupName: gName, carData: cData } = item;

        analyzeCarData(cData, activeConfig.analyze_prompt, sessionApiKey)
          .then(finalReport => {
            if (isAnalysisCancelled) return;

            processedCars++;
            updateState({ 
              aiStatusText: `Araçlar analiz ediliyor (${processedCars}/${totalCars})...`,
              analysisProgress: 5 + Math.round((processedCars / totalCars) * 80)
            });

            let cleanTitle = finalReport.clean_title || cData.title;
            if (!finalReport.clean_title || finalReport.clean_title.length > 50) {
              const match = cData.title.match(/(?:[12][0-9]{3})/);
              if (match) {
                cleanTitle = `${gName} ${match[0]} Model`;
              } else {
                cleanTitle = gName;
              }
            }

            chunkResults[workIndex] = {
              groupName: gName,
              carData: {
                title: cleanTitle,
                price: cData.price,
                url: cData.url,
                images: cData.images, 
                market_speed_score: finalReport.market_speed_score || null,
                price_perf_score: finalReport.price_perf_score || null,
                fair_price_score: finalReport.fair_price_score || null,
                condition_score: finalReport.condition_score || null,
                overall_score: finalReport.overall_score || null,
                ai_report: finalReport.ai_report || "Analiz oluşturulamadı.",
                vision_report: null,
                defects: [],
                positives: [],
                competitor_analysis: finalReport.competitor_analysis || null,
                detailed_specs: finalReport.detailed_specs || [],
                damage_map: finalReport.damage_map || null
              }
            };
          })
          .catch(err => {
             console.error("Araç kuyrukta işlenirken hata:", err);
          })
          .finally(() => {
            activeWorkers--;
            // API güvenliği için yeni bir işe geçmeden 1 saniye bekle
            setTimeout(startNext, 1000);
          });
      }

      // Max 5 eşzamanlı işlem başlat (Google Chrome limiti 6'dır)
      const maxConcurrency = Math.min(5, flatCarsList.length);
      for (let i = 0; i < maxConcurrency; i++) {
        startNext();
      }
    });

    if (isAnalysisCancelled) return;
    
    const allProcessedCars = chunkResults.filter(r => r !== null);
    
    if (isAnalysisCancelled) return;

    // İşlenmiş araçları gruplarına göre paketle
    for (let g = 0; g < groupNames.length; g++) {
      const gName = groupNames[g];
      const carsInGroup = allProcessedCars.filter(c => c.groupName === gName).map(c => c.carData);
      
      const groupConsolidated = {
        groupName: gName,
        group_logic: `${gName} analizi tamamlandı.`,
        cars: carsInGroup
      };
      allGroupReports.push(groupConsolidated);
    }

    updateState({ aiStatusText: `Master AI Tüm Grupları Kıyaslıyor...`, analysisProgress: 85 });

    // MASTER AI EŞİTLİK MANTIĞI
    let topCars = [];
    for (let g of allGroupReports) {
      for (let c of g.cars) {
        topCars.push({ groupName: g.groupName, car: c });
      }
    }
    
    // Yüksek puandan düşüğe doğru sırala
    topCars.sort((a, b) => {
      let scoreA = parseInt(a.car.overall_score, 10) || 0;
      let scoreB = parseInt(b.car.overall_score, 10) || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (a.car.url || "").localeCompare(b.car.url || "");
    });

    let topN = 10;
    if (topCars.length > 10) {
      let tenthScore = parseInt(topCars[9].car.overall_score, 10) || 0;
      // 10. arabanın puanıyla aynı puanı alan diğer araçları da havuza dahil et
      while (topN < topCars.length && (parseInt(topCars[topN].car.overall_score, 10) || 0) >= tenthScore) {
         topN++;
      }
    }
    
    // Kesinleşmiş Master Havuzu
    const masterHavuz = topCars.slice(0, topN);
    
    const masterGroupReports = masterHavuz.map(item => ({
      groupName: item.groupName,
      cars: [item.car]
    }));

    // Master AI Raporunu oluştur
    updateState({ aiStatusText: "Büyük Master AI Raporu oluşturuluyor...", analysisProgress: 95 });
    const globalSummary = await generateGlobalMasterReport(masterGroupReports, activeConfig.master_prompt, sessionApiKey);

    updateState({
      analysisProgress: 100,
      aiStatusText: `Analiz Tamamlandı!`,
      isAnalyzing: false,
      finalReport: { groups: allGroupReports, summaryData: globalSummary }
    });

  } catch (error) {
    updateState({
      aiError: true,
      aiStatusText: `Hata: ${error.message}`,
      isAnalyzing: true, // Hata mesajı loading ekranında kalsın diye true bırakıyoruz
      finalReport: null
    });
  }
}

// ------------------------------------------------------------------
// MESSAGE LISTENER
// ------------------------------------------------------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === 'get_state') {
    sendResponse({
      tabs: trackedTabs,
      isAnalyzing: isAnalyzing,
      progress: analysisProgress,
      aiText: aiStatusText,
      hasReport: finalReport !== null,
      isError: aiError,
      collectedCount: trackedTabs.length,
      collectedVehicles: trackedTabs,
      isCollecting: isCollecting
    });
    return true;
  }

  if (request.action === 'set_collecting') {
    updateState({ isCollecting: request.value });
    
    if (request.value === true) {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          const url = tab.url;
          if (url && (url.includes('sahibinden.com/ilan/') || url.includes('arabam.com/ilan/'))) {
             addTabToTrackingAndExtract(tab.id, url, tab.title);
          }
        });
      });
    }

    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'remove_vehicle') {
    collectedVehicles = collectedVehicles.filter(v => v.url !== request.url);
    updateState({ collectedVehicles: collectedVehicles });
    sendResponse({ success: true });
    return true;
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
    return true;
  }

  if (request.action === 'cancel_analysis') {
    isAnalysisCancelled = true;
    updateState({
      trackedTabs: [],
      finalReport: null,
      aiError: false,
      isAnalyzing: false,
      aiStatusText: '',
      isCollecting: false,
      analysisProgress: 0
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'show_report') {
    if (!finalReport) return;
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
    return true;
  }

  if (request.action === 'remove_tab') {
    trackedTabs = trackedTabs.filter(t => t.tabId !== request.tabId);
    updateState({ trackedTabs: trackedTabs });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'start_analysis') {
    const readyData = trackedTabs.map(t => t.data).filter(d => d !== null);
    if (readyData.length === 0) {
      updateState({ aiError: true, aiStatusText: "Analiz edilecek araç verisi yok." });
      sendResponse({ success: false });
      return true;
    }
    isAnalysisCancelled = false;
    updateState({ isAnalyzing: true, analysisProgress: 5, aiStatusText: "Yapay Zeka Hazırlanıyor..." });
    runFullAnalysis();
    sendResponse({ success: true });
    return true;
  }

});
