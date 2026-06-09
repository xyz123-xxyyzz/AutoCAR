// ==========================================
// AUTOCAR AI - EKLENTİ AYARLARI
// ==========================================
const CONFIG = {
  PORTAL_URL: "https://auto-car-gold.vercel.app/analiz" 
};
// ==========================================

let trackedTabs = [];
let isAnalyzing = false;
let analysisProgress = 0;
let aiStatusText = "Hazır";
let finalReport = null;
let aiError = false;

// Initialize state from storage
chrome.storage.local.get(['trackedTabs', 'isAnalyzing', 'analysisProgress', 'aiStatusText', 'finalReport', 'aiError'], (res) => {
  if (res.trackedTabs) trackedTabs = res.trackedTabs;
  if (res.isAnalyzing !== undefined) isAnalyzing = res.isAnalyzing;
  if (res.analysisProgress !== undefined) analysisProgress = res.analysisProgress;
  if (res.aiStatusText) aiStatusText = res.aiStatusText;
  if (res.finalReport) finalReport = res.finalReport;
  if (res.aiError !== undefined) aiError = res.aiError;
});

function updateState(updates) {
  if (updates.trackedTabs !== undefined) trackedTabs = updates.trackedTabs;
  if (updates.isAnalyzing !== undefined) isAnalyzing = updates.isAnalyzing;
  if (updates.analysisProgress !== undefined) analysisProgress = updates.analysisProgress;
  if (updates.aiStatusText !== undefined) aiStatusText = updates.aiStatusText;
  if (updates.finalReport !== undefined) finalReport = updates.finalReport;
  if (updates.aiError !== undefined) aiError = updates.aiError;
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
              if (response && response.title) {
                updateTabStatus(tabId, 'Yüklendi', response);
              } else {
                updateTabStatus(tabId, 'Hata Oluştu');
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
        return reject(new Error('Kullanıcı bilgileri veya cihaz kimliği eksik. Lütfen Web Portalına tekrar giriş yapın.'));
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
        return reject(new Error('Veritabanına bağlanılamadı. Cihazınız veya parolanız hatalı olabilir.'));
      }

      if (!apiKey || apiKey.trim().length === 0) {
        return reject(new Error('API Hatası: Supabase veritabanında bu hesap için API Anahtarı yok veya bu cihaz yetkisiz!'));
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
            throw new Error('API Anahtarı eksik veya geçersiz. Lütfen Ayarlar (⚙️) kısmından geçerli bir OpenAI API Anahtarı girin.');
          }
          if (res.status === 429) {
            if (json.error && json.error.code === 'insufficient_quota') {
              throw new Error('Yapay Zeka (OpenAI) Bakiyeniz Tükenmiştir. Lütfen Ayarlar panelindeki linkten bakiye yüklemesi yapın.');
            }
            if (retries > 0) {
              console.warn(`429 Too Many Requests. Retrying in 6 seconds... (${retries} retries left)`);
              await new Promise(r => setTimeout(r, 6000));
              return resolve(await callOpenAI(systemPrompt, userContent, useVision, model, retries - 1));
            }
          }
          throw new Error(json.error ? json.error.message : 'Bilinmeyen API Hatası');
        }
        resolve(JSON.parse(json.choices[0].message.content));
      } catch (err) {
        console.error(err);
        if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
          reject(new Error(`İnternet bağlantısı koptu veya tarayıcı izin vermedi. Detay: ${err.message}`));
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
  return await callOpenAI(systemPrompt, dataForAi);
}

async function generateGlobalMasterReport(groupReports) {
  const systemPrompt = `Sen sistemin 'Master AI' yöneticisisin. Tüm araç gruplarının analiz raporları sana geliyor. Bu grupları birbiriyle kıyasla, FİYAT-PERFORMANS ve SEGMENT mantığını dikkate alarak gelen araçları sırala ve sadece İLK 10 aracı belirle.
SADECE GEÇERLİ BİR JSON DÖNDÜR.
Format:
{
  "title": "Master AI Derinlemesine Kıyaslama Raporu (Top 10)",
  "logic": "Bu liste neye göre hazırlandı? Kısaca açıkla.",
  "top_10": [
    { 
      "rank": 1,
      "title": "Volkswagen Passat 2015", 
      "score": 95, 
      "comment": "Piyasanın en dolu paketi, fiyatı ise emsallerine göre %10 daha ucuz." 
    },
    { 
      "rank": 2,
      "title": "Skoda Superb 2018", 
      "score": 92, 
      "comment": "Düşük kilometresi ve temiz ekspertizi ile uzun yıllar masrafsız binilecek bir araç." 
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
- "comment" kısmı kesinlikle SADECE 1 CÜMLE olmalı. O aracın neden öne çıktığını çok vurucu, ilgi çekici ve galericiyi cezbedecek şekilde yaz.
- Sadece top_10 listesi oluştur. Eğer 10'dan az araç varsa olanları sırala. 10'dan fazlaysa sadece en iyi 10'unu al.
`;

  // Master AI'a giden veriden gereksiz yer kaplayan kısımları (url, boş özellikler vb.) silerek SIKIŞTIRIYORUZ.
  // Bu sayede 1000 araç bile gönderilse OpenAI chat limiti şişmez.
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
  const readyData = trackedTabs.filter(t => t.status === 'Yüklendi' && t.data).map(t => t.data);
  
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
    updateState({ aiStatusText: "Araçlar gruplandırılıyor...", analysisProgress: 5 });
    const groups = groupTabsByModel(readyData);
    const groupNames = Object.keys(groups);
    let allGroupReports = [];
    
    let totalCars = readyData.length;
    let processedCars = 0;
    
    // Bütün araçları düzleştirilmiş bir listeye alalım
    const flatCarsList = [];
    for (let g = 0; g < groupNames.length; g++) {
      const gName = groupNames[g];
      const gCars = groups[gName];
      for (let i = 0; i < gCars.length; i++) {
        flatCarsList.push({ groupName: gName, carData: gCars[i] });
      }
    }

    // Arabaları 100'erli "Chunk" (Paketler) haline getirelim
    const CHUNK_SIZE = 100;
    const allProcessedCars = [];

    for (let i = 0; i < flatCarsList.length; i += CHUNK_SIZE) {
      const chunkStartTime = Date.now(); // Paketin API'ye gönderilmeye başladığı an
      
      const chunk = flatCarsList.slice(i, i + CHUNK_SIZE);
      
      const chunkPromises = chunk.map(async (item) => {
        const { groupName: gName, carData: cData } = item;
        const finalReport = await analyzeCarData(cData);

        processedCars++;
        updateState({ 
          aiStatusText: `Araçlar 100'lü Paketler Halinde Analiz Ediliyor (${processedCars}/${totalCars})...`,
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
            ai_report: finalReport.ai_report || finalReport.data_report || "Bu araç için özel analiz oluşturulamadı (AI zaman aşımı veya veri eksikliği).",
            vision_report: null,
            defects: [],
            positives: [],
            competitor_analysis: finalReport.competitor_analysis || null,
            detailed_specs: finalReport.detailed_specs || [],
            damage_map: finalReport.damage_map || null
          }
        };
      });

      // 100'lük paketi aynı anda çalıştır ve bitmesini bekle, sonraki 100'e geç
      const chunkResults = await Promise.all(chunkPromises);
      allProcessedCars.push(...chunkResults);
      
      // Eğer bu son paket değilse, tam 70 saniyelik döngüyü tamamla.
      if (i + CHUNK_SIZE < flatCarsList.length) {
        const elapsed = Date.now() - chunkStartTime;
        const waitTime = Math.max(0, 70000 - elapsed); // 70 saniyeden kalanı hesapla
        
        if (waitTime > 0) {
           updateState({ 
             aiStatusText: `API Güvenliği: Kalan ${(waitTime / 1000).toFixed(0)} saniye bekleniyor...`,
           });
           await new Promise(r => setTimeout(r, waitTime));
        }
      }
    }

    // İşlenmiş araçları gruplarına göre tekrar ayır
    for (let g = 0; g < groupNames.length; g++) {
      const gName = groupNames[g];
      const carsInGroup = allProcessedCars.filter(c => c.groupName === gName).map(c => {
        let carDataCopy = { ...c.carData };
        // YZ'nın kafasını karıştırmamak ve veri paketini şişirmemek için resimleri KOD ile 3'e düşür
        if (carDataCopy.images && carDataCopy.images.length > 3) {
          carDataCopy.images = carDataCopy.images.slice(0, 3);
        }
        return carDataCopy;
      });
      
      const groupConsolidated = {
        groupName: gName,
        group_logic: `${gName} grubu için eşzamanlı yapay zeka analizi tamamlandı.`,
        cars: carsInGroup
      };
      allGroupReports.push(groupConsolidated);
    }

    updateState({ aiStatusText: `Master AI Tüm Grupları Kıyaslıyor...`, analysisProgress: 85 });

    // YENİ MANTIK: Tüm arabaları alıp overall_score'a göre yüksekten düşüğe sırala ve en iyi 3 aracı seç.
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
    
    // Master AI için bu en iyi 10 aracı grup formatına geri çevir
    const masterGroupReports = top10Cars.map(item => ({
      groupName: item.groupName,
      cars: [item.car]
    }));

    const globalSummary = await generateGlobalMasterReport(masterGroupReports);

    updateState({
      analysisProgress: 100,
      aiStatusText: `Analiz Tamamlandı!`,
      isAnalyzing: false,
      finalReport: { groups: allGroupReports, summaryData: globalSummary }
    });

  } catch (error) {
    updateState({
      aiError: true,
      aiStatusText: `API Hatası: ${error.message}`,
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
      aiStatusText: "Hazır",
      finalReport: null,
      aiError: false
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'get_state') {
    chrome.storage.local.get(['trackedTabs', 'isAnalyzing', 'analysisProgress', 'aiStatusText', 'finalReport', 'aiError'], (res) => {
      const currentTabs = res.trackedTabs || trackedTabs;
      const currentIsAnalyzing = res.isAnalyzing !== undefined ? res.isAnalyzing : isAnalyzing;
      const currentProgress = res.analysisProgress !== undefined ? res.analysisProgress : analysisProgress;
      const currentText = res.aiStatusText || aiStatusText;
      const currentReport = res.finalReport || finalReport;
      const currentError = res.aiError !== undefined ? res.aiError : aiError;
      
      sendResponse({
        tabs: currentTabs,
        isAnalyzing: currentIsAnalyzing,
        progress: currentProgress,
        aiText: currentText,
        hasReport: currentReport !== null && currentReport !== undefined,
        isError: currentError
      });
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
        aiStatusText: "Maksimum sınır aşıldı! Lütfen aynı anda en fazla 50 araba seçin.",
        finalReport: null
      });
      sendResponse({ success: false, error: "Limit aşıldı" });
      return true;
    }

    updateState({
      isAnalyzing: true,
      aiError: false,
      analysisProgress: 0,
      aiStatusText: "Yapay Zeka Başlatılıyor...",
      finalReport: null
    });
    
    // Vision tamamen kaldırıldığı için direkt Data modunda (true) başlatıyoruz
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

  if (request.action === 'start_deep_scan') {
    chrome.storage.local.set({ autocar_running: false });
    
    // Aktif sekmeyi bul
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ success: false, error: "Aktif sekme bulunamadı." });
        return;
      }
      
      const activeTab = tabs[0];
      
      updateState({
        isAnalyzing: true,
        aiError: false,
        analysisProgress: 2,
        aiStatusText: "Sayfalardaki ilanlar taranıyor (Sayfa 1)...",
        finalReport: null,
        trackedTabs: []
      });

      const MAX_DEEP_SCAN_LIMIT = 1000;
      let allUrls = [];
      let hasNextPage = true;
      let currentScanTabId = activeTab.id;
      let pageCount = 1;

      while (hasNextPage && allUrls.length < MAX_DEEP_SCAN_LIMIT) {
        // Eklenti scriptini sayfaya her ihtimale karşı inject et
        await new Promise(r => {
          chrome.scripting.executeScript({
            target: { tabId: currentScanTabId },
            files: ['content.js']
          }, () => r());
        });

        // Sayfadan URL'leri ve sonraki sayfa linkini iste
        const response = await new Promise(resolve => {
          chrome.tabs.sendMessage(currentScanTabId, { action: "extract_urls" }, (res) => {
            resolve(res);
          });
        });

        if (!response || !response.urls || response.urls.length === 0) {
          break; // İlan bulunamadıysa döngüyü kır
        }

        // Bulunan eşsiz URL'leri ana havuza ekle
        response.urls.forEach(u => {
          if (!allUrls.includes(u) && allUrls.length < MAX_DEEP_SCAN_LIMIT) {
            allUrls.push(u);
          }
        });

        updateState({
          aiStatusText: `Şu ana kadar ${allUrls.length} ilan bulundu, sayfalar taranıyor...`,
          analysisProgress: Math.min(4, 2 + Math.floor(allUrls.length / 250))
        });

        // Eğer sonraki sayfa varsa ve sınır dolmadıysa, sekmeyi oraya yönlendir
        if (response.nextPageUrl && allUrls.length < MAX_DEEP_SCAN_LIMIT) {
          pageCount++;
          updateState({ aiStatusText: `${allUrls.length} ilan toplandı. Sayfa ${pageCount}'e geçiliyor...` });
          
          await new Promise(resolve => {
            chrome.tabs.update(currentScanTabId, { url: response.nextPageUrl }, () => {
              const listener = (tabId, info) => {
                if (tabId === currentScanTabId && info.status === 'complete') {
                  chrome.tabs.onUpdated.removeListener(listener);
                  resolve();
                }
              };
              chrome.tabs.onUpdated.addListener(listener);
            });
          });

          // Sayfanın DOM ağacının ve resimlerin/JS'lerin oturması için 3 saniye insan molası
          await new Promise(r => setTimeout(r, 3000));
        } else {
          hasNextPage = false;
        }
      }

      if (allUrls.length === 0) {
        updateState({
          aiError: true,
          isAnalyzing: false,
          analysisProgress: 100,
          aiStatusText: "Hiçbir sayfada ilan bulunamadı. Lütfen bir arama sonuç sayfasında deneyin."
        });
        return;
      }

      let urls = allUrls;
      const totalUrls = urls.length;
      
      updateState({
        aiStatusText: `Toplam ${pageCount} sayfadan ${totalUrls} ilan başarıyla toplandı. Hayalet tarayıcılar başlatılıyor...`,
        analysisProgress: 5
      });

      // Hayalet Sekme İşçileri (Workers) Oluştur
          const MAX_CONCURRENT_TABS = 2;
          let currentIndex = 0;
          let successCount = 0;
          let currentTrackedTabs = [];

          const processNextUrl = async (ghostTabId) => {
            let i;
            // Lock index safely
            synchronized: {
              if (currentIndex >= urls.length) return;
              i = currentIndex++;
            }

            const url = urls[i];
            
            updateState({
              aiStatusText: `İlanlar Çekiliyor (${Math.min(successCount+1, totalUrls)} / ${totalUrls}). Lütfen bekleyin...`,
              analysisProgress: 5 + Math.round((successCount/totalUrls) * 40)
            });

            // Ghost tabı yönlendir
            await new Promise(resolve => {
              chrome.tabs.update(ghostTabId, { url: url }, () => {
                const listener = (tabId, info) => {
                  if (tabId === ghostTabId && info.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                  }
                };
                chrome.tabs.onUpdated.addListener(listener);
              });
            });

            // Sayfa yüklendi, DOM'un oturması için 1 saniye bekle
            await new Promise(r => setTimeout(r, 1000));

            // Veriyi çek
            const data = await new Promise(resolve => {
              chrome.scripting.executeScript({
                target: { tabId: ghostTabId },
                files: ['content.js']
              }, () => {
                chrome.tabs.sendMessage(ghostTabId, { action: "extract_data" }, (res) => {
                  resolve(res);
                });
              });
            });

            if (data && data.title) {
              currentTrackedTabs.push({
                tabId: `ghost_${i}`,
                url: url,
                title: data.title,
                status: 'Yüklendi',
                data: data
              });
              successCount++;
            }

            // Bot korumasına takılmamak için 2.5 saniye bekle
            await new Promise(r => setTimeout(r, 2500));
            
            // Sıradaki URL'ye geç
            await processNextUrl(ghostTabId);
          };

          const workerPromises = [];
          const numWorkers = Math.min(MAX_CONCURRENT_TABS, urls.length);
          
          for (let w = 0; w < numWorkers; w++) {
            workerPromises.push(new Promise(resolveWorker => {
              chrome.tabs.create({ url: "about:blank", active: false }, async (ghostTab) => {
                await processNextUrl(ghostTab.id);
                chrome.tabs.remove(ghostTab.id);
                resolveWorker();
              });
            }));
          }

          // Bütün işçilerin (sekmelerin) bitmesini bekle
          Promise.all(workerPromises).then(() => {
            if (successCount === 0) {
              updateState({
                aiError: true,
                isAnalyzing: false,
                analysisProgress: 100,
                aiStatusText: "İlan verileri çekilemedi. Sahibinden engeli olabilir."
              });
              return;
            }

            // Tracked tabs güncellendi, AI'ya yolla
            updateState({ trackedTabs: currentTrackedTabs });
            runFullAnalysis({ runData: true });
          });
    });
    
    sendResponse({ success: true });
    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  const newTabs = trackedTabs.filter(t => t.tabId !== tabId);
  updateState({ trackedTabs: newTabs });
});
