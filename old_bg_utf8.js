// ==========================================
// AUTOCAR AI - EKLENT─░ AYARLARI
// ==========================================
const CONFIG = {
  PORTAL_URL: "https://auto-car-gold.vercel.app/analiz" 
};
// ==========================================

let trackedTabs = [];
let isAnalyzing = false;
let analysisProgress = 0;
let aiStatusText = "Haz─▒r";
let finalReport = null;
let aiError = false;
let collectedVehicles = [];

// Initialize state from storage
chrome.storage.local.get(['trackedTabs', 'isAnalyzing', 'analysisProgress', 'aiStatusText', 'finalReport', 'aiError', 'collectedVehicles'], (res) => {
  if (res.trackedTabs) trackedTabs = res.trackedTabs;
  if (res.isAnalyzing !== undefined) isAnalyzing = res.isAnalyzing;
  if (res.analysisProgress !== undefined) analysisProgress = res.analysisProgress;
  if (res.aiStatusText) aiStatusText = res.aiStatusText;
  if (res.finalReport) finalReport = res.finalReport;
  if (res.aiError !== undefined) aiError = res.aiError;
  if (res.collectedVehicles) collectedVehicles = res.collectedVehicles;
});

function updateState(updates) {
  if (updates.trackedTabs !== undefined) trackedTabs = updates.trackedTabs;
  if (updates.isAnalyzing !== undefined) isAnalyzing = updates.isAnalyzing;
  if (updates.analysisProgress !== undefined) analysisProgress = updates.analysisProgress;
  if (updates.aiStatusText !== undefined) aiStatusText = updates.aiStatusText;
  if (updates.finalReport !== undefined) finalReport = updates.finalReport;
  if (updates.aiError !== undefined) aiError = updates.aiError;
  if (updates.collectedVehicles !== undefined) collectedVehicles = updates.collectedVehicles;
  chrome.storage.local.set(updates);
}

function processTab(tabId, url, title) {
  if (url.includes('sahibinden.com/ilan/') || url.includes('arabam.com/ilan/')) {
    let existingTab = trackedTabs.find(t => t.tabId === tabId);
    if (!existingTab) {
      const newTab = {
        tabId: tabId,
        url: url,
        title: title || url,
        status: 'Y├╝kleniyor...',
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
            updateTabStatus(tabId, 'Hata Olu┼ştu');
          } else {
            chrome.tabs.sendMessage(tabId, { action: "extract_data" }, (response) => {
              if (response && response.title) {
                updateTabStatus(tabId, 'Y├╝klendi', response);
              } else {
                updateTabStatus(tabId, 'Hata Olu┼ştu');
              }
            });
          }
        });
      }, 1500);
    }
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (isAnalyzing) return;
  const currentUrl = changeInfo.url || tab.url;
  if (changeInfo.status === 'complete' && currentUrl) {
    chrome.storage.local.get(['autocar_running'], (res) => {
      if (res.autocar_running) {
        processTab(tabId, currentUrl, tab.title);
      }
    });
  }
});

function updateTabStatus(tabId, status, data = null) {
  const t = trackedTabs.find(x => x.tabId === tabId);
  if (t) {
    t.status = status;
    if (data) t.data = data;
    updateState({ trackedTabs });
  }
}

const SUPABASE_URL = "https://jwffcfjuydjjzqtwjitn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ESKWW6qt0VZL9_GwNEM3Uw_Z8wUMnOM";

async function callOpenAI(systemPrompt, userContent, useVision = false, model = 'gpt-4o-mini', retries = 3) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['userEmail', 'deviceId'], async (resStorage) => {
      let email = resStorage.userEmail;
      let deviceId = resStorage.deviceId;
      
      if (!email || !deviceId) {
        return reject(new Error('Kullan─▒c─▒ bilgileri veya cihaz kimli─şi eksik. L├╝tfen Web Portal─▒na tekrar giri┼ş yap─▒n.'));
      }

      let apiKey = '';
      try {
        const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_api_key_for_device`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ p_email: email, p_device_id: deviceId })
        });
        
        if (!supaRes.ok) throw new Error("Supabase RPC failed");
        const jsonResponse = await supaRes.json();
        apiKey = jsonResponse || '';
      } catch (err) {
        return reject(new Error('Veritaban─▒na ba─şlan─▒lamad─▒. Cihaz─▒n─▒z veya parolan─▒z hatal─▒ olabilir.'));
      }

      if (!apiKey || apiKey.trim().length === 0) {
        return reject(new Error('API Hatas─▒: Supabase veritaban─▒nda bu hesap i├ğin API Anahtar─▒ yok veya bu cihaz yetkisiz!'));
      }

      try {
        let messages = [
          { role: 'system', content: systemPrompt }
        ];
        
        if (useVision) {
          messages.push({ role: 'user', content: userContent });
        } else {
          messages.push({ role: 'user', content: JSON.stringify(userContent) });
        }

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
          body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: 4096,
            response_format: { type: 'json_object' }
          })
        });
        
        const json = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('API Anahtar─▒ eksik veya ge├ğersiz. L├╝tfen Ayarlar (ÔÜÖ´©Å) k─▒sm─▒ndan ge├ğerli bir OpenAI API Anahtar─▒ girin.');
          }
          if (res.status === 429) {
            if (json.error && json.error.code === 'insufficient_quota') {
              throw new Error('Yapay Zeka (OpenAI) Bakiyeniz T├╝kenmi┼ştir. L├╝tfen Ayarlar panelindeki linkten bakiye y├╝klemesi yap─▒n.');
            }
            if (retries > 0) {
              console.warn(`429 Too Many Requests. Retrying in 6 seconds... (${retries} retries left)`);
              await new Promise(r => setTimeout(r, 6000));
              return resolve(await callOpenAI(systemPrompt, userContent, useVision, model, retries - 1));
            }
          }
          throw new Error(json.error ? json.error.message : 'Bilinmeyen API Hatas─▒');
        }
        resolve(JSON.parse(json.choices[0].message.content));
      } catch (err) {
        console.error(err);
        if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
          reject(new Error(`─░nternet ba─şlant─▒s─▒ koptu veya taray─▒c─▒ izin vermedi. Detay: ${err.message}`));
        } else {
          reject(err);
        }
      }
    });
  });
}

function groupTabsByModel(readyData) {
  const groups = {};
  readyData.forEach(car => {
    let titleParts = car.title.split(' ');
    let groupName = 'Di─şer Ara├ğlar';
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

async function analyzeCarData(carData) {
  const systemPrompt = `You are a highly realistic, strictly objective, and deeply analytical Automotive Expert AI.
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
  
  "ai_report": "A very detailed summary report about the car's technical data in Turkish. YOU MUST EXPLICITLY AND TRANSPARENTLY EXPLAIN WHY YOU GAVE THE SPECIFIC SCORES for Sat─▒┼ş H─▒z─▒, Fiyat/Performans, Uygunluk, and Ara├ğ Durumu. Break down the reasoning for the 4 scores. Use exactly ONE EMPTY LINE (\\n\\n) between each score's explanation.",
  
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
- You MUST EXTRACT AND ANALYZE ALL AVAILABLE SPECS from the data (at least 15-20 specs if available, e.g., Motor G├╝c├╝, Model Y─▒l─▒, Vites Tipi, Yak─▒t, Renk, Boya/De─şi┼şen, Hasar Kayd─▒ vb.).
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
  return await callOpenAI(systemPrompt, dataForAi);
}

async function generateGlobalMasterReport(groupReports) {
  const systemPrompt = `Sen sistemin 'Master AI' y├Âneticisisin. T├╝m ara├ğ gruplar─▒n─▒n analiz raporlar─▒ sana geliyor. Bu gruplar─▒ birbiriyle k─▒yasla, F─░YAT-PERFORMANS ve SEGMENT mant─▒─ş─▒n─▒ dikkate alarak gelen ara├ğlar─▒ s─▒rala ve sadece ─░LK 10 arac─▒ belirle.
SADECE GE├çERL─░ B─░R JSON D├ûND├£R.
Format:
{
  "title": "Master AI Derinlemesine K─▒yaslama Raporu (Top 10)",
  "logic": "Bu liste neye g├Âre haz─▒rland─▒? K─▒saca a├ğ─▒kla.",
  "top_10": [
    { 
      "rank": 1,
      "title": "Volkswagen Passat 2015", 
      "score": 95, 
      "comment": "Piyasan─▒n en dolu paketi, fiyat─▒ ise emsallerine g├Âre %10 daha ucuz." 
    },
    { 
      "rank": 2,
      "title": "Skoda Superb 2018", 
      "score": 92, 
      "comment": "D├╝┼ş├╝k kilometresi ve temiz ekspertizi ile uzun y─▒llar masrafs─▒z binilecek bir ara├ğ." 
    }
  ],
  "details": [
    { "icon": "info", "title": "Rakipleri Neler?", "desc": "Gelen ara├ğlar─▒n genel bir piyasa analizi." },
    { "icon": "star", "title": "B├╝t├ğe ve Kitle", "desc": "Hangi kitleye hitap ediyorlar?" }
  ]
}
Kurallar:
- "score" alanlar─▒na kafandan puan uydurma! Sana verilen verideki "overall_score" de─şeri neyse B─░REB─░R ayn─▒s─▒n─▒ yaz.
- "title" k─▒sm─▒na ASLA HAM ─░LAN BA┼ŞLI─ŞINI KOPYALAMA! Sadece arac─▒n MARKASI, MODEL─░ ve YILINI tertemiz bir ┼şekilde yaz (├ûrn: "Volkswagen Passat 2015").
- "comment" k─▒sm─▒ kesinlikle SADECE 1 C├£MLE olmal─▒. O arac─▒n neden ├Âne ├ğ─▒kt─▒─ş─▒n─▒ ├ğok vurucu, ilgi ├ğekici ve galericiyi cezbedecek ┼şekilde yaz.
- Sadece top_10 listesi olu┼ştur. E─şer 10'dan az ara├ğ varsa olanlar─▒ s─▒rala. 10'dan fazlaysa sadece en iyi 10'unu al.
`;

  // Master AI'a giden veriden gereksiz yer kaplayan k─▒s─▒mlar─▒ (url, bo┼ş ├Âzellikler vb.) silerek SIKI┼ŞTIRIYORUZ.
  // Bu sayede 1000 ara├ğ bile g├Ânderilse OpenAI chat limiti ┼şi┼şmez.
  const cleanGroupReports = groupReports.map(g => ({
    groupName: g.groupName,
    cars: g.cars.map(c => ({
      title: c.title,
      price: c.price,
      scores: {
        ms: c.market_speed_score,
        pp: c.price_perf_score,
        fp: c.fair_price_score,
        cs: c.condition_score,
        total: c.overall_score
      },
      specs: (c.detailed_specs || []).map(s => `${s.name}: ${s.value}`),
      competitors: c.competitor_analysis ? c.competitor_analysis.competitors : []
    }))
  }));

  return await callOpenAI(systemPrompt, cleanGroupReports);
}

async function runFullAnalysis(options) {
  const readyData = trackedTabs.filter(t => t.status === 'Y├╝klendi' && t.data).map(t => t.data);
  
  if (readyData.length === 0) {
    updateState({
      aiStatusText: `Hata: Analiz edilecek ara├ğ bulunamad─▒.`,
      analysisProgress: 100,
      isAnalyzing: false,
      aiError: true
    });
    return;
  }

  try {
    updateState({ aiStatusText: "Ara├ğlar grupland─▒r─▒l─▒yor...", analysisProgress: 5 });
    const groups = groupTabsByModel(readyData);
    const groupNames = Object.keys(groups);
    let allGroupReports = [];
    
    let totalCars = readyData.length;
    let processedCars = 0;
    
    // B├╝t├╝n ara├ğlar─▒ d├╝zle┼ştirilmi┼ş bir listeye alal─▒m
    const flatCarsList = [];
    for (let g = 0; g < groupNames.length; g++) {
      const gName = groupNames[g];
      const gCars = groups[gName];
      for (let i = 0; i < gCars.length; i++) {
        flatCarsList.push({ groupName: gName, carData: gCars[i] });
      }
    }

    // Arabalar─▒ 100'erli "Chunk" (Paketler) haline getirelim
    const CHUNK_SIZE = 100;
    const allProcessedCars = [];

    for (let i = 0; i < flatCarsList.length; i += CHUNK_SIZE) {
      const chunkStartTime = Date.now(); // Paketin API'ye g├Ânderilmeye ba┼şlad─▒─ş─▒ an
      
      const chunk = flatCarsList.slice(i, i + CHUNK_SIZE);
      
      const chunkPromises = chunk.map(async (item) => {
        const { groupName: gName, carData: cData } = item;
        const finalReport = await analyzeCarData(cData);

        processedCars++;
        updateState({ 
          aiStatusText: `Ara├ğlar 100'l├╝ Paketler Halinde Analiz Ediliyor (${processedCars}/${totalCars})...`,
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

        return {
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
            ai_report: finalReport.ai_report || finalReport.data_report || "Bu ara├ğ i├ğin ├Âzel analiz olu┼şturulamad─▒ (AI zaman a┼ş─▒m─▒ veya veri eksikli─şi).",
            vision_report: null,
            defects: [],
            positives: [],
            competitor_analysis: finalReport.competitor_analysis || null,
            detailed_specs: finalReport.detailed_specs || [],
            damage_map: finalReport.damage_map || null
          }
        };
      });

      // 100'l├╝k paketi ayn─▒ anda ├ğal─▒┼şt─▒r ve bitmesini bekle, sonraki 100'e ge├ğ
      const chunkResults = await Promise.all(chunkPromises);
      allProcessedCars.push(...chunkResults);
      
      // E─şer bu son paket de─şilse, tam 70 saniyelik d├Âng├╝y├╝ tamamla.
      if (i + CHUNK_SIZE < flatCarsList.length) {
        const elapsed = Date.now() - chunkStartTime;
        const waitTime = Math.max(0, 70000 - elapsed); // 70 saniyeden kalan─▒ hesapla
        
        if (waitTime > 0) {
           updateState({ 
             aiStatusText: `API G├╝venli─şi: Kalan ${(waitTime / 1000).toFixed(0)} saniye bekleniyor...`,
           });
           await new Promise(r => setTimeout(r, waitTime));
        }
      }
    }

    // ─░┼şlenmi┼ş ara├ğlar─▒ gruplar─▒na g├Âre tekrar ay─▒r
    for (let g = 0; g < groupNames.length; g++) {
      const gName = groupNames[g];
      const carsInGroup = allProcessedCars.filter(c => c.groupName === gName).map(c => {
        let carDataCopy = { ...c.carData };
        // YZ'n─▒n kafas─▒n─▒ kar─▒┼şt─▒rmamak ve veri paketini ┼şi┼şirmemek i├ğin resimleri KOD ile 3'e d├╝┼ş├╝r
        if (carDataCopy.images && carDataCopy.images.length > 3) {
          carDataCopy.images = carDataCopy.images.slice(0, 3);
        }
        return carDataCopy;
      });
      
      const groupConsolidated = {
        groupName: gName,
        group_logic: `${gName} grubu i├ğin e┼şzamanl─▒ yapay zeka analizi tamamland─▒.`,
        cars: carsInGroup
      };
      allGroupReports.push(groupConsolidated);
    }

    updateState({ aiStatusText: `Master AI T├╝m Gruplar─▒ K─▒yasl─▒yor...`, analysisProgress: 85 });

    // YEN─░ MANTIK: T├╝m arabalar─▒ al─▒p overall_score'a g├Âre y├╝ksekten d├╝┼ş├╝─şe s─▒rala ve en iyi 3 arac─▒ se├ğ.
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

    const top10Cars = topCars.slice(0, 10);
    
    // Master AI i├ğin bu en iyi 10 arac─▒ grup format─▒na geri ├ğevir
    const masterGroupReports = top10Cars.map(item => ({
      groupName: item.groupName,
      cars: [item.car]
    }));

    const globalSummary = await generateGlobalMasterReport(masterGroupReports);

    updateState({
      analysisProgress: 100,
      aiStatusText: `Analiz Tamamland─▒!`,
      isAnalyzing: false,
      finalReport: { groups: allGroupReports, summaryData: globalSummary }
    });

  } catch (error) {
    updateState({
      aiError: true,
      aiStatusText: `API Hatas─▒: ${error.message}`,
      analysisProgress: 100,
      isAnalyzing: false,
      finalReport: null
    });
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start_system') {
    chrome.storage.local.set({ autocar_running: true });
    chrome.tabs.query({ url: ["*://*.sahibinden.com/*", "*://*.arabam.com/*"] }, (tabs) => {
      tabs.forEach(tab => {
        processTab(tab.id, tab.url, tab.title);
      });
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'stop_system') {
    chrome.storage.local.set({ autocar_running: false });
    updateState({
      trackedTabs: [],
      isAnalyzing: false,
      analysisProgress: 0,
      aiStatusText: "Haz─▒r",
      finalReport: null,
      aiError: false
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'get_state') {
    sendResponse({
      tabs: trackedTabs,
      isAnalyzing: isAnalyzing,
      progress: analysisProgress,
      aiText: aiStatusText,
      hasReport: finalReport !== null,
      isError: aiError,
      collectedCount: collectedVehicles.length,
      collectedVehicles: collectedVehicles
    });
    return true;
  }

  if (request.action === 'remove_tab') {
    const newTabs = trackedTabs.filter(t => t.tabId !== request.tabId);
    updateState({ trackedTabs: newTabs });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'start_analysis') {
    chrome.storage.local.set({ autocar_running: false });
    if (trackedTabs.length > 50) {
      updateState({
        isAnalyzing: true,
        aiError: true,
        analysisProgress: 100,
        aiStatusText: "Maksimum s─▒n─▒r a┼ş─▒ld─▒! L├╝tfen ayn─▒ anda en fazla 50 araba se├ğin.",
        finalReport: null
      });
      sendResponse({ success: false, error: "Limit a┼ş─▒ld─▒" });
      return true;
    }

    updateState({
      isAnalyzing: true,
      aiError: false,
      analysisProgress: 0,
      aiStatusText: "Yapay Zeka Ba┼şlat─▒l─▒yor...",
      finalReport: null
    });
    
    // Vision tamamen kald─▒r─▒ld─▒─ş─▒ i├ğin direkt Data modunda (true) ba┼şlat─▒yoruz
    const options = { runData: true };
    runFullAnalysis(options); 
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
          
          updateState({
            trackedTabs: [],
            analysisProgress: 0
            // finalReport is NOT set to null here, so we remember it!
          });
        }
      });
    });
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'stop_system') {
    chrome.storage.local.set({ autocar_running: false });
    updateState({
      trackedTabs: [],
      isAnalyzing: false,
      aiError: false,
      finalReport: null
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'reset_memory') {
    updateState({
      collectedVehicles: [],
      finalReport: null,
      aiError: false,
      isAnalyzing: false,
      aiStatusText: 'Haf─▒za S─▒f─▒rland─▒.'
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'passive_extract') {
    const data = request.data;
    // E─şer ara├ğ zaten haf─▒zada yoksa ekle
    if (!collectedVehicles.find(v => v.url === data.url)) {
      collectedVehicles.push(data);
      updateState({
        collectedVehicles: collectedVehicles
      });
    }
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'remove_vehicle') {
    const urlToRemove = request.url;
    collectedVehicles = collectedVehicles.filter(v => v.url !== urlToRemove);
    updateState({
      collectedVehicles: collectedVehicles
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'start_analysis') {
    if (collectedVehicles.length === 0) {
      updateState({
        aiError: true,
        aiStatusText: "├ûnce sayfa toplamal─▒s─▒n─▒z!"
      });
      sendResponse({ success: false });
      return true;
    }

    updateState({
      isAnalyzing: true,
      analysisProgress: 5,
      aiStatusText: "Yapay Zeka Haz─▒rlan─▒yor..."
    });

    let currentTrackedTabs = collectedVehicles.map((v, idx) => ({
      tabId: `ghost_${idx}`,
      url: v.url,
      title: v.title,
      status: 'Y├╝klendi',
      data: v
    }));

    updateState({ trackedTabs: currentTrackedTabs });
    runFullAnalysis({ runData: true });

    sendResponse({ success: true });
    return true;
  }
});

