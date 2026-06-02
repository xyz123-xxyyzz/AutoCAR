const apiKeyPart1 = 'sk-proj-Z8bfe7a3mXpD45pHPamGVz9S7dxjX3gb52cTYjL8VC1EsRS2ZD5X7gMyXOxgFs-CHxupfPuu';
const apiKeyPart2 = 'DAT3BlbkFJYz-L_xKZgLkIrDkyuCbrQZxbokXa3MhoZ6jh8SFyEdmZQagDH6UPAaJlRnk9mQ8-a119MJ4WUA';
const OPENAI_API_KEY = apiKeyPart1 + apiKeyPart2;

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

async function callOpenAI(systemPrompt, userContent, useVision = false, model = 'gpt-4o') {
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
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_API_KEY },
      body: JSON.stringify({
        model: model,
        messages: messages,
        response_format: { type: 'json_object' }
      })
    });
    
    const json = await res.json();
    if (res.status !== 200) {
      if (res.status === 401) throw new Error('API Anahtarı geçersiz veya yetkisiz. (401 Unauthorized)');
      if (res.status === 429) throw new Error('API kotası dolmuş veya çok fazla istek atıldı. (429 Too Many Requests)');
      throw new Error(json.error ? json.error.message : 'Bilinmeyen API Hatası');
    }
    return JSON.parse(json.choices[0].message.content);
  } catch (err) {
    console.error(err);
    if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
      throw new Error('İnternet bağlantısı koptu veya tarayıcı izin vermedi.');
    }
    throw err;
  }
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

async function analyzeDataOnly(carData) {
  const systemPrompt = `Sen bir veri analisti yapay zekasın. Sadece aracın teknik verilerini, fiyatını ve hasar kaydını inceleyip analiz et.
SADECE GEÇERLİ BİR JSON DÖNDÜR.
Format:
{
  "market_speed_score": 85,
  "price_perf_score": 90,
  "condition_score": 88,
  "overall_score": 88,
  "data_report": "Sadece verilere dayalı genel yorum.",
  "detailed_specs": [
    { "name": "Özellik Adı", "value": "Değer", "status": "good", "comment": "Yorum", "note": "Kısa not" }
  ]
}`;
  const dataForAi = { ...carData };
  delete dataForAi.images;
  return await callOpenAI(systemPrompt, dataForAi);
}

async function analyzeImagesOnly(carData) {
  const systemPrompt = `Sen bir görsel oto ekspertiz yapay zekasın. Gönderilen araç resimlerini incele. Dış kasa, boya, jant, lastik ve iç mekandaki aşınmaları, kusurları veya olumlu yanları raporla.
SADECE GEÇERLİ BİR JSON DÖNDÜR.
Format:
{
  "vision_report": "Resimlere dayalı ekspertiz yorumu.",
  "defects": ["sağ çamurluk çizik", "koltukta yırtık"],
  "positives": ["jantlar temiz", "boya parlak"]
}`;
  const maxImages = 5;
  const imagesToAnalyze = carData.images ? carData.images.slice(0, maxImages) : [];
  
  if (imagesToAnalyze.length === 0) {
    return { vision_report: "Resim bulunamadı.", defects: [], positives: [] };
  }

  let userContent = [
    { type: 'text', text: 'Bu aracın resimlerini incele ve ekspertiz yap.' }
  ];
  
  imagesToAnalyze.forEach(url => {
    userContent.push({
      type: 'image_url',
      image_url: { url: url }
    });
  });

  return await callOpenAI(systemPrompt, userContent, true, 'gpt-4o-mini');
}

async function consolidateGroup(groupName, ai1Results, ai2Results, originalCars) {
  const systemPrompt = `Sen '${groupName}' araçlarının uzmanısın (AI-3 Group Chef). Sana veri (AI-1) ve görsel (AI-2) analizleri verilmiş araçların birleştirilmiş raporunu hazırla.
SADECE GEÇERLİ JSON DÖNDÜR.
Format:
{
  "groupName": "${groupName}",
  "group_logic": "Bu gruptaki araçlar hakkında genel değerlendirme.",
  "cars": [
    {
       "title": "Araç Başlığı",
       "price": "Fiyat",
       "url": "Link",
       "market_speed_score": 85,
       "overall_score": 88,
       "ai_report": "Veri ve Görsel analizlerin birleştirilmiş nihai araç yorumu",
       "detailed_specs": [
         { "name": "Özellik", "value": "Değer", "status": "good", "comment": "Yorum", "note": "Not" }
       ],
       "competitor_analysis": { "pros": ["artı 1"], "cons": ["eksi 1"], "text": "Bu aracın gruptaki diğer araçlara göre durumu" }
    }
  ]
}`;

  let inputData = [];
  for(let i=0; i<originalCars.length; i++) {
     inputData.push({
        title: originalCars[i].title,
        price: originalCars[i].price,
        url: originalCars[i].url,
        data_analysis: ai1Results[i],
        vision_analysis: ai2Results[i]
     });
  }

  const result = await callOpenAI(systemPrompt, inputData);
  
  if (result.cars && Array.isArray(result.cars)) {
     result.cars.forEach((car, index) => {
        car.images = originalCars[index].images;
     });
  }
  return result;
}

async function generateGlobalMasterReport(groupReports) {
  const systemPrompt = `Sen sistemin 'Master AI' yöneticisisin. Tüm araç gruplarının analiz raporları sana geliyor. Bu grupları birbirleriyle kıyasla, en iyileri seç ve genel podyumu belirle.
SADECE GEÇERLİ BİR JSON DÖNDÜR.
Format:
{
  "title": "Gruplar Arası Genel Kıyaslama ve Podyum",
  "logic": "Hangi grubun/aracın neden seçildiğine dair geniş mantık.",
  "podium": [
    { "medal": "gold", "title": "1. Araç", "reason": "Neden 1. oldu", "score": 95, "color": "text-[#D4AF37]" },
    { "medal": "silver", "title": "2. Araç", "reason": "Neden 2. oldu", "score": 85, "color": "text-[#C0C0C0]" },
    { "medal": "bronze", "title": "3. Araç", "reason": "Neden 3. oldu", "score": 75, "color": "text-[#CD7F32]" }
  ],
  "details": [
    { "icon": "info", "title": "Piyasa Özeti", "desc": "Gruplar arası genel durum" }
  ],
  "tableData": [
    { "feature": "Özellik Adı", "grup1": "değer", "grup2": "değer" }
  ]
}`;

  return await callOpenAI(systemPrompt, groupReports);
}

async function runFullAnalysis() {
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

    for (let g = 0; g < groupNames.length; g++) {
      const gName = groupNames[g];
      const gCars = groups[gName];
      let ai1Results = [];
      let ai2Results = [];

      for (let i = 0; i < gCars.length; i++) {
        processedCars++;
        updateState({ 
          aiStatusText: `[${gName}] Araç ${i+1}/${gCars.length} Veri+Görsel Analizi Yapılıyor...`,
          analysisProgress: 5 + Math.round((processedCars / totalCars) * 60)
        });
        
        const [a1, a2] = await Promise.all([
           analyzeDataOnly(gCars[i]),
           analyzeImagesOnly(gCars[i])
        ]);
        ai1Results.push(a1);
        ai2Results.push(a2);
      }

      updateState({ aiStatusText: `[${gName}] AI-3 Grup Şefi Verileri Birleştiriyor...` });
      const groupConsolidated = await consolidateGroup(gName, ai1Results, ai2Results, gCars);
      allGroupReports.push(groupConsolidated);
    }

    updateState({ aiStatusText: `Master AI Tüm Grupları Kıyaslıyor...`, analysisProgress: 85 });
    const globalSummary = await generateGlobalMasterReport(allGroupReports);

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
    updateState({
      isAnalyzing: true,
      aiError: false,
      analysisProgress: 0,
      aiStatusText: "Yapay Zeka Başlatılıyor...",
      finalReport: null
    });
    
    runFullAnalysis(); 
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'show_report') {
    if (!finalReport) return;
    const portalUrl = "https://auto-car-gold.vercel.app/analiz";
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
});

chrome.tabs.onRemoved.addListener((tabId) => {
  const newTabs = trackedTabs.filter(t => t.tabId !== tabId);
  updateState({ trackedTabs: newTabs });
});
