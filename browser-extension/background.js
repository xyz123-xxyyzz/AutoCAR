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
  const systemPrompt = `Sen bir veri analisti yapay zekasın. Aracın teknik verilerini, fiyatını ve hasar kaydını inceleyip detaylı analiz et.
SADECE GEÇERLİ BİR JSON DÖNDÜR.
Format:
{
  "competitor_analysis": {
    "text": "Bu aracın piyasa durumu ve rakip kıyaslaması.",
    "pros": ["Güçlü yön 1", "Güçlü yön 2"],
    "cons": ["Zayıf yön 1", "Zayıf yön 2"]
  },
  "market_speed_score": 85,
  "price_perf_score": 90,
  "condition_score": 88,
  "overall_score": 88,
  "data_report": "Bu araç hakkında derinlemesine, uzun ve kapsamlı bir özet rapor yaz. Sadece 1-2 cümle olmasın.",
  "detailed_specs": [
    { "name": "Özellik Adı", "value": "Değer", "status": "good", "comment": "Çok detaylı ve profesyonel bir açıklama yaz.", "note": "Kısa not" }
  ]
}
Kurallar:
- "competitor_analysis" içindeki text kısmında bu aracın piyasadaki en büyük 2 veya 3 rakibinin ismini parantez içinde AÇIKÇA belirt (Örn: En büyük rakibi Skoda Superb...).
- "detailed_specs" dizisine araçla ilgili BULABİLDİĞİN TÜM ÖNEMLİ ÖZELLİKLERİ (en az 15-20 özellik) ekle ve yorum kısımlarını çok detaylı tut.
- overall_score, diğer üç skorun aritmetik ortalaması olmalı ve KESİNLİKLE TAM SAYI (virgülsüz) olmalıdır. Eğer küsurat çıkarsa yuvarla.
`;
  const dataForAi = { ...carData };
  delete dataForAi.images;
  return await callOpenAI(systemPrompt, dataForAi);
}

// Resim URL'sini Base64'e çeviren yardımcı fonksiyon
async function fetchImageAsBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const mimeType = blob.type || 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (err) {
    console.error("Image to Base64 failed for:", url, err);
    return null;
  }
}

async function analyzeImagesOnly(carData) {
  const expertPrompt = `Sen bir görsel oto ekspertiz yapay zekasın. Gönderilen 10 araç resmini detaylıca incele. Dış kasa, boya, jant, lastik ve iç mekandaki aşınmaları, kusurları veya olumlu yanları raporla.
SADECE GEÇERLİ BİR JSON DÖNDÜR.
Format:
{
  "vision_report": "Resimlere dayalı ekspertiz yorumu. Tüm detayları uzun ve profesyonelce belirt.",
  "defects": ["sağ çamurluk çizik", "koltukta yırtık"],
  "positives": ["jantlar temiz", "boya parlak"]
}`;

  if (!carData.images || carData.images.length === 0) {
    return { vision_report: "Resim bulunamadı.", defects: [], positives: [] };
  }

  // Adım 1: Galeriden homojen olarak max 30 fotoğraf al (Aşırı RAM tüketimini ve token bloat'u önlemek için)
  const maxPoolSize = 30;
  let poolUrls = [];
  if (carData.images.length <= maxPoolSize) {
    poolUrls = [...carData.images];
  } else {
    const step = carData.images.length / maxPoolSize;
    for (let i = 0; i < maxPoolSize; i++) {
      poolUrls.push(carData.images[Math.floor(i * step)]);
    }
  }

  // Resimleri Base64 formatına çevir (Sadece 1 kere indirilecek)
  const base64Images = [];
  for (const url of poolUrls) {
    const b64 = await fetchImageAsBase64(url);
    if (b64) base64Images.push(b64);
  }

  if (base64Images.length === 0) {
    return { vision_report: "Resimler Sahibinden sunucularından çekilemedi.", defects: [], positives: [] };
  }

  // Adım 2: Eğer resim sayısı çok azsa filtrelemeye gerek yok, direkt Expert AI'a yolla
  let selectedBase64Images = base64Images;
  
  if (base64Images.length > 10) {
    // Adım 3: Seçici (Filter) AI'a gönder (Low Detail)
    const filterPrompt = `Sen bir Seçici Yapay Zekasın (Filter AI). Aşağıda sana bir aracın galerisinden ${base64Images.length} adet fotoğraf gönderilmiştir. Görevin bu fotoğrafları inceleyip, aracın her açısını (Ön, Arka, Yanlar, İç Mekan, Koltuklar, Hasarlı kısımlar) en iyi özetleyen tam 10 benzersiz fotoğrafı seçmektir.
SADECE GEÇERLİ BİR JSON ARRAY DÖNDÜR. Array içine seçtiğin fotoğrafların indeks numaralarını (0'dan ${base64Images.length - 1}'e kadar) koy.
Örnek Çıktı: [0, 3, 5, 8, 12, 15, 21, 23, 27, 29]`;

    let filterContent = [{ type: 'text', text: 'En iyi 10 fotoğrafın indeksini JSON array olarak dön.' }];
    base64Images.forEach((b64) => {
      filterContent.push({ type: 'image_url', image_url: { url: b64, detail: "low" } });
    });

    try {
      const filterResponse = await callOpenAI(filterPrompt, filterContent, false, 'gpt-4o-mini');
      let parsedIndices = [];
      const match = filterResponse.match(/\[.*\]/s);
      if (match) {
        parsedIndices = JSON.parse(match[0]);
      } else {
        parsedIndices = JSON.parse(filterResponse);
      }
      
      if (Array.isArray(parsedIndices) && parsedIndices.length > 0) {
        selectedBase64Images = parsedIndices
          .filter(idx => idx >= 0 && idx < base64Images.length)
          .map(idx => base64Images[idx])
          .slice(0, 10);
          
        if (selectedBase64Images.length === 0) {
          throw new Error("Geçerli index bulunamadı.");
        }
      } else {
        throw new Error("Dönen format Array değil.");
      }
    } catch (e) {
      console.error("Filter AI hatası, homojen yedeğe geçiliyor:", e);
      // Hata olursa matematiksel homojen seçimi yedek olarak kullan
      selectedBase64Images = [];
      const step = base64Images.length / 10;
      for (let i = 0; i < 10; i++) {
        selectedBase64Images.push(base64Images[Math.floor(i * step)]);
      }
    }
  }

  // Adım 4: Ekspertiz (Expert) AI'ın Analizi
  let expertContent = [
    { type: 'text', text: 'Bu aracın resimlerini (dış kasa ve iç mekan) detaylıca incele ve ekspertiz yap.' }
  ];
  
  selectedBase64Images.forEach(b64 => {
    expertContent.push({
      type: 'image_url',
      // Expert AI yüksek detayda bakar (opsiyonel: detail "high" veya bırakılabilir, varsayılan auto)
      image_url: { url: b64 } 
    });
  });

  return await callOpenAI(expertPrompt, expertContent, true, 'gpt-4o-mini');
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
       "title": "Volkswagen Passat 2015 Model (Bunun gibi REKLAM İÇERMEYEN, TEMİZ ve sadece marka/model/yıl barındıran bir isim uydur)",
       "price": "Fiyat",
       "url": "Link",
       "market_speed_score": 85,
       "price_perf_score": 90,
       "condition_score": 88,
       "overall_score": 88,
       "ai_report": "Veri ve Görsel analizlerin birleştirilmiş detaylı nihai araç yorumu",
       "vision_report": "Görsel yapay zekanın (AI-2) yazdığı yorumu buraya koy.",
       "defects": ["kusur 1"],
       "positives": ["olumlu 1"],
       "detailed_specs": [
         { "name": "Özellik", "value": "Değer", "status": "good", "comment": "Yorum", "note": "Not" }
       ],
       "competitor_analysis": { "pros": ["artı 1"], "cons": ["eksi 1"], "text": "Bu aracın gruptaki diğer araçlara göre durumu" }
    }
  ]
}
Kurallar:
- "title" alanını mutlaka "Marka Model Yıl" yap. "Hatasız boyasız 2015 Caddy" yerine "Volkswagen Caddy 2015 Model" yaz.
- "overall_score" alanını diğer 3 skorun ortalaması olarak hesapla.
- "detailed_specs" dizisini AI-1'den gelen verilerle uzun ve zengin tut.
- "competitor_analysis" kısmında rakipleri kıyaslarken KESİNLİKLE aynı segmenti ve fiyat klasmanını dikkate al (3 milyonluk araçla 1 milyonluk aracı donanım/lüks diye kıyaslama).
`;

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
  const systemPrompt = `Sen sistemin 'Master AI' yöneticisisin. Tüm araç gruplarının analiz raporları sana geliyor. Bu grupları birbiriyle kıyasla, FİYAT-PERFORMANS ve SEGMENT mantığını dikkate alarak en iyileri seç ve genel podyumu belirle.
SADECE GEÇERLİ BİR JSON DÖNDÜR.
Format:
{
  "title": "Master AI Derinlemesine Kıyaslama Raporu",
  "logic": "Hangi aracın neden 1., 2. veya 3. seçildiğine dair çok detaylı, ikna edici ve profesyonel bir analiz yaz.",
  "podium": [
    { "medal": "gold", "title": "1. Araç (Grubun Başlığı)", "reason": "Neden altın madalya aldı? Detaylıca açıkla.", "score": 95, "color": "text-[#D4AF37]", "images": ["url1", "url2", "url3"] },
    { "medal": "silver", "title": "2. Araç (Grubun Başlığı)", "reason": "Neden 2. oldu?", "score": 85, "color": "text-[#C0C0C0]", "images": ["url1", "url2", "url3"] },
    { "medal": "bronze", "title": "3. Araç (Grubun Başlığı)", "reason": "Neden 3. oldu?", "score": 75, "color": "text-[#CD7F32]", "images": ["url1", "url2", "url3"] }
  ],
  "details": [
    { "icon": "info", "title": "Rakipleri Neler?", "desc": "Volkswagen Passat: Rakibi Skoda Superb. Audi A3: Rakibi Mercedes A Serisi... şeklinde her aracın rakibini yaz." },
    { "icon": "check", "title": "Kıyaslama Ekseni", "desc": "Neylerle kıyaslanması lazım? (Hız, Konfor, Şehir İçi vb.)" },
    { "icon": "info", "title": "Bütçe ve Kitle", "desc": "Hangi bütçeye ve hangi kitleye hitap ediyor?" }
  ],
  "tableData": [
    { "feature": "Özellik Adı (Model Yılı, Bagaj, vb.)", "Gold": "2015 ✅", "Silver": "2015 ⚪", "Bronze": "2012 ❌" }
  ]
}
Kurallar:
- "score" alanlarına kafandan puan uydurma! Sana verilen verideki O GRUBUN "overall_score" değeri neyse BİREBİR aynısını yaz.
- Eğer sana sadece 2 farklı grup gönderildiyse, sadece 2 madalya (gold, silver) ver.
- "details" bölümündeki "Rakipleri Neler?" kısmına her bir aracın rakibini net olarak alt alta yaz.
- "tableData" kısmında SÜTUN BAŞLIKLARI KESİNLİKLE "Gold", "Silver", "Bronze" olmalıdır. Asla Grup 1, Grup 2 yazma!
- "tableData" değerlerine SADECE EMOJİ DEĞİL, muhakkak **Veri + Emoji** yazmalısın. Örneğin: "2015 ✅", "500 Litre ⚪", "Yok ❌" gibi. Üstün olanlara ✅, denk/ortalama olanlara ⚪ (gri çember), zayıf olanlara ❌ koy.
- "tableData" kısmını ÇOK UZUN tut, en az 10-15 kıyaslama kriteri ekle.
- "images" dizisi için sana verilen verideki o araca ait 'images' dizisinden en az 3 URL koymayı UNUTMA. Bu çok önemlidir.
`;

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
