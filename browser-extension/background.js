// ==========================================
// AUTOCAR AI - EKLENTİ AYARLARI
// ==========================================
const CONFIG = {
  // Geliştirme yaparken bunu kullanın: "http://localhost:5173/analiz"
  // Sistemi satarken / canlıdayken bunu kullanın: "https://auto-car-gold.vercel.app/analiz"
  PORTAL_URL: "https://auto-car-gold.vercel.app/analiz" 
};
// ==========================================

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

async function callOpenAI(systemPrompt, userContent, useVision = false, model = 'gpt-4o', retries = 3) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai_api_key'], async (resStorage) => {
      let apiKey = resStorage.openai_api_key;
      if (!apiKey || apiKey.trim() === '') {
        // Fallback to hardcoded key if user hasn't provided one (even if it might be revoked)
        apiKey = OPENAI_API_KEY;
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
            response_format: { type: 'json_object' }
          })
        });
        
        const json = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('API Anahtarı eksik veya geçersiz. Lütfen Ayarlar (⚙️) kısmından geçerli bir OpenAI API Anahtarı girin.');
          }
          if (res.status === 429 && retries > 0) {
            console.warn(`429 Too Many Requests. Retrying in 6 seconds... (${retries} retries left)`);
            await new Promise(r => setTimeout(r, 6000));
            return resolve(await callOpenAI(systemPrompt, userContent, useVision, model, retries - 1));
          }
          throw new Error(json.error ? json.error.message : 'Bilinmeyen API Hatası');
        }
        resolve(JSON.parse(json.choices[0].message.content));
      } catch (err) {
        console.error(err);
        if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
          reject(new Error('İnternet bağlantısı koptu veya tarayıcı izin vermedi.'));
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

async function analyzeDataOnly(carData) {
const systemPrompt = `You are an expert, highly critical, and brutally realistic automotive appraiser and data analyst AI.
Analyze the provided car data (technical specs, price, damage history, mileage).
YOU MUST RETURN ONLY VALID JSON.
Format:
{
  "clean_title": "Cleaned up Make, Model and Year of the car (e.g., 'Volkswagen Passat 2015'). Remove any garbage advertising words from the original title.",
  "competitor_analysis": {
    "competitors": ["Competitor Make Model 1", "Competitor Make Model 2"],
    "text": "Detailed comparison of this car against its actual real-world market competitors. Be objective, brutally honest and highly critical.",
    "pros": ["Strong point 1", "Strong point 2"],
    "cons": ["Weak point 1", "Weak point 2"]
  },
  "market_speed_score": 85,
  "price_perf_score": 60,
  "fair_price_score": 50,
  "condition_score": 40,
  "overall_score": 61,
  "data_report": "A very detailed, comprehensive summary report about the car in Turkish. YOU MUST EXPLICITLY AND TRANSPARENTLY EXPLAIN WHY YOU GAVE THE SPECIFIC SCORES for Satış Hızı, Fiyat/Performans, Uygunluk, and Araç Durumu. Break down your reasoning for each of the 4 scores. CRITICAL RULE FOR FORMATTING: Do NOT write a single flat paragraph! Write it as a structured list with exactly ONE EMPTY LINE (\n\n) between each score's explanation. Example format: 'Satış Hızı (75 Puan): [Açıklama]\n\nFiyat / Perf. (70 Puan): [Açıklama]\n\nUygunluk (50 Puan): [Açıklama]\n\nAraç Durumu (50 Puan): [Açıklama]'. Be completely objective, realistic and point out every red flag. No sugarcoating.",
  "detailed_specs": [
    { "name": "Spec Name (Turkish)", "value": "Value", "status": "good", "comment": "Detailed professional comment in Turkish", "note": "Short note" }
  ],
  "damage_map": {
    "kaput": "orijinal",
    "tavan": "orijinal",
    "on_tampon": "orijinal",
    "arka_tampon": "orijinal",
    "sag_on_camurluk": "orijinal",
    "sag_on_kapi": "orijinal",
    "sag_arka_kapi": "orijinal",
    "sag_arka_camurluk": "orijinal",
    "sol_on_camurluk": "orijinal",
    "sol_on_kapi": "orijinal",
    "sol_arka_kapi": "orijinal",
    "sol_arka_camurluk": "orijinal",
    "bagaj": "orijinal"
  }
RULES FOR SCORING AND EXTRACTION (BE OBJECTIVE BUT FAIR):
1. detailed_specs: YOU MUST EXTRACT EVERY SINGLE TECHNICAL SPECIFICATION available in the listing. Do NOT just put 4 specs! Extract at least 15-25 specs (e.g., HP, Torque, Engine Size, Transmission, Color, Drivetrain, Fuel type, Trim level, 0-100, Top Speed, Year, Mileage, etc.). If the data is there, extract it!
CRITICAL RULE FOR DETAILED SPECS 'comment' FIELD: DO NOT just repeat the value! The user already sees the value. The 'comment' must be your DEEP, EXPERT AI THOUGHT/OPINION on that specific feature.
Example BAD: "Araç 2019 modeldir."
Example GOOD: "2019 model olması, kronik motor sorunlarının çözüldüğü makyajlı kasaya denk gelir, bu bir avantajdır."
Example BAD: "Araç 120.000 kilometrededir."
Example GOOD: "120.000 km dizel motor için ağır bakım (triger vs.) sınırıdır, alırken servis geçmişine kesinlikle bakılmalı."

2. market_speed_score (Satış Hızı): Evaluate how fast this car sells in the Turkish market. A great indicator is the volume of listings: if there are tons of ads for this model (like Fiat Egea, Renault Clio, VW Golf), it means it has a huge market and sells fast (give 85-95). If it's a rare, niche, or very unpopular model with few listings, it sells slowly (give 30-50).

3. price_perf_score (Fiyat/Performans): Compare the asking price to the car's features. Is this the most feature-rich and capable car you can buy for this amount of money in the current market? If it offers incredible features and value for its price bracket, give it a very high score (85-95). If there are much better, more equipped cars available for this exact price, give it a lower score (40-60).

4. fair_price_score (Uygunluk): Determine if the vehicle is priced strictly at its fair market value based on its specs and condition. If it is priced EXACTLY at its fair market value, give it a 50. If it is OVERPRICED (expensive), give it between 0-49. If it is UNDERPRICED (a bargain/cheap), give it between 51-100.

5. condition_score (Araç Durumu): Measure how far the car is from being "Brand New" (0 km). Start at 100 for a flawless new car. Deduct points heavily based on: Year (older = lower score), Mileage (higher km = lower score), Paint/Replaced parts, Scratches, Tramer/Damage records. A 2-3 year old car with no damage might get 85-90. A 10-year-old car with 200k km and 3 painted parts should drop to 50-60. A heavily damaged old car should be 30-40.

6. overall_score: The exact arithmetic mean of the above 4 scores (market_speed_score, price_perf_score, fair_price_score, condition_score). ALL SCORES MUST BE INTEGERS, not strings. Do not put brackets around them.

- For damage_map: ONLY use "orijinal", "boyali", "lokal_boyali", "degisen", "bilinmiyor". Deduce this accurately.
- All output text MUST be in TURKISH.
- Do NOT hallucinate data, but extract EVERYTHING provided in the data blob.
`;
  const dataForAi = { ...carData };
  delete dataForAi.images;
  return await callOpenAI(systemPrompt, dataForAi);
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
- "podium" içindeki "title" kısmına ASLA HAM İLAN BAŞLIĞINI KOPYALAMA! Sadece aracın MARKASI, MODELİ ve YILINI tertemiz bir şekilde yaz (Örn: "Volkswagen Passat 2015" veya "Ford Focus 2018"). "KASKO SİGORTAYA", "BAYİYE VERICEM" gibi ilan başlıkları KESİNLİKLE YASAKTIR.
- Eğer sana sadece 2 farklı grup gönderildiyse, sadece 2 madalya (gold, silver) ver.
- "details" bölümündeki kısımlara yazacağın metinleri MADDELER HALİNDE veya \\n\\n (çift yeni satır) kullanarak ALT ALTA yaz. Asla tek bir uzun paragraf halinde birleştirme!
- Özellikle "Rakipleri Neler?" kısmında her bir aracın rakibini sırayla yazarken şu formatı kullan (Örn: \\n\\n1. Volkswagen Passat (Rakibi: Skoda Superb) \\n\\n2. BMW 520 (Rakibi: Audi A6)...).
    Ardından ŞU 2 ALT BAŞLIĞI YİNE \\n\\n İLE YENİ SATIRA GEÇEREK LİSTELE:
    (a) Fiyat-Performans Kıyaslaması (Hangi araç daha çok tercih ediliyor?)
    (b) Bütçe ve Kitle Sınıflandırması (Kime hitap ediyor? Örn: Megane/Egea -> Fabrika işçileri/Alt-orta gelir. Tesla -> Orta gelirli aileler. Audi A3/BMW 1 -> Kadın kullanıcılar vb.)
- "tableData" kısmında SÜTUN BAŞLIKLARI KESİNLİKLE "Gold", "Silver", "Bronze" olmalıdır. Asla Grup 1, Grup 2 yazma!
- **ÇOK ÖNEMLİ MATEMATİK KURALI:** "tableData" hücrelerine "Veri + Emoji" koyacaksın (Örn: "2015 ✅"). Ancak emojileri koyarken **DİKKAT KESİL!** Sayısal verilerde daima matematiksel kıyaslama yap.
- HÜCRE İÇİNE SADECE BİR TANE EMOJİ KOY. ASLA "More ✅", "✅✅", "Yok ❌" gibi İngilizce veya gereksiz kelimeler yazma. Sadece net veri ve yanına TEK BİR emoji koy.
- SADECE ŞU 3 SİMGEYİ KULLANABİLİRSİN, BAŞKA HİÇBİR EMOJİ VEYA HARF YASAKTIR: 
  1. Çarpı (❌): Zayıf, yetersiz, düşük donanım veya eski model
  2. Tik (✅): Üstün, çok iyi, güçlü donanım veya yeni model
  3. Daire (⚪): Ortalama, nötr, orta seviye
- "tableData" (Kıyaslama tablosu) KESİNLİKLE ÇOK UZUN OLMALIDIR. En az 15 farklı kıyaslama satırı ekle (Model Yılı, Güç, Tork, Şanzıman, Ekran, Cam Tavan, Fiyat vb.).
- "images" dizisi için sana verilen verideki o araca ait 'images' dizisinden en az 3 URL koymayı UNUTMA.
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
      let cars = [];

      for (let i = 0; i < gCars.length; i++) {
        processedCars++;
        updateState({ 
          aiStatusText: `[${gName}] Araç ${i+1}/${gCars.length} Veri Analizi Yapılıyor...`,
          analysisProgress: 5 + Math.round((processedCars / totalCars) * 80)
        });
        const a1 = await analyzeDataOnly(gCars[i]);

        let cleanTitle = a1.clean_title || gCars[i].title;
        if (!a1.clean_title || a1.clean_title.length > 50) {
          const match = gCars[i].title.match(/(?:[12][0-9]{3})/);
          if (match) {
            cleanTitle = `${gName} ${match[0]} Model`;
          } else {
            cleanTitle = gName;
          }
        }

        cars.push({
          title: cleanTitle,
          price: gCars[i].price,
          url: gCars[i].url,
          images: gCars[i].images,
          market_speed_score: a1.market_speed_score,
          price_perf_score: a1.price_perf_score,
          fair_price_score: a1.fair_price_score,
          condition_score: a1.condition_score,
          overall_score: a1.overall_score,
          ai_report: a1.data_report,
          competitor_analysis: a1.competitor_analysis,
          detailed_specs: a1.detailed_specs,
          damage_map: a1.damage_map || null
        });
      }

      updateState({ aiStatusText: `[${gName}] Veriler Derleniyor...` });
      const groupConsolidated = {
        groupName: gName,
        group_logic: `${gName} grubu için güncel piyasa ve özellik analizi tamamlandı.`,
        cars: cars
      };
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
});

chrome.tabs.onRemoved.addListener((tabId) => {
  const newTabs = trackedTabs.filter(t => t.tabId !== tabId);
  updateState({ trackedTabs: newTabs });
});
