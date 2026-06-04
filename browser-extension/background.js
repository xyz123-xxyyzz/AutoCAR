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

async function callOpenAI(systemPrompt, userContent, useVision = false, model = 'gpt-4o-mini', retries = 3) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai_api_key'], async (resStorage) => {
      let apiKey = (resStorage.openai_api_key || '').trim();
      if (!apiKey) {
        apiKey = OPENAI_API_KEY.trim();
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
  const systemPrompt = `You are a strict, brutally honest, and highly critical Automotive Data Analyst AI.
Analyze the provided car data (specs, price, damage history, mileage).
Return ONLY VALID JSON.
Format:
{
  "clean_title": "Cleaned up Make, Model and Year of the car (e.g., 'Volkswagen Passat 2015'). Remove advertising words.",
  "competitor_analysis": {
    "competitors": ["Competitor 1", "Competitor 2"],
    "text": "Detailed comparison against competitors. Be brutally honest and highlight red flags.",
    "pros": ["Strong point 1", "Strong point 2"],
    "cons": ["Weak point 1", "Weak point 2"]
  },
  "market_speed_score": 85,
  "price_perf_score": 60,
  "fair_price_score": 50,
  "condition_score": 40,
  "overall_score": 61,
  "data_report": "A very detailed summary report about the car's technical data in Turkish. YOU MUST EXPLICITLY AND TRANSPARENTLY EXPLAIN WHY YOU GAVE THE SPECIFIC SCORES for Satış Hızı, Fiyat/Performans, Uygunluk, and Araç Durumu. Break down the reasoning for the 4 scores. Use exactly ONE EMPTY LINE (\\n\\n) between each score's explanation. (e.g., 'Satış Hızı (75 Puan): [Açıklama]\\n\\nFiyat / Perf. (70 Puan): [Açıklama]'). BE OBJECTIVE AND BRUTALLY HONEST. Point out every red flag. No sugarcoating.",
  "detailed_specs": [
    { "name": "Spec Name", "value": "Value", "status": "good", "comment": "Detailed expert professional comment explaining why this spec is an advantage or a major flaw. Do not just restate the value." }
  ],
  "damage_map": {
    "kaput": "orijinal"
  }
}

RULES FOR SCORING (INTEGERS ONLY):
- market_speed_score: 0-100 (Volume of listings / popularity).
- price_perf_score: 0-100 (Features vs Price).
- fair_price_score: 0-100 (Is it priced at fair market value?).
- condition_score: 0-100 (Year, Mileage, Damage).
- overall_score: EXACT ARITHMETIC MEAN of the above 4 scores.

CRITICAL RULES:
- All text MUST be in TURKISH. 
- Be brutally honest, do not sugarcoat anything.
- If the price is too high or the condition is bad, heavily criticize it.
- Do NOT hallucinate data. Be totally objective and strict.`;

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
    { "medal": "gold", "title": "1. Araç (Grubun Başlığı)", "reason": "Neden altın madalya aldı? Detaylıca açıkla.", "score": 95, "color": "text-[#D4AF37]" },
    { "medal": "silver", "title": "2. Araç (Grubun Başlığı)", "reason": "Neden 2. oldu?", "score": 85, "color": "text-[#C0C0C0]" },
    { "medal": "bronze", "title": "3. Araç (Grubun Başlığı)", "reason": "Neden 3. oldu?", "score": 75, "color": "text-[#CD7F32]" }
  ],
  "details": [
    { "icon": "info", "title": "Rakipleri Neler?", "desc": "Volkswagen Passat: Rakibi Skoda Superb. Audi A3: Rakibi Mercedes A Serisi... şeklinde her aracın rakibini yaz." },
    { "icon": "check", "title": "Kıyaslama Ekseni (Kim Daha Üstün?)", "desc": "Performans: [Hangi araç motor/hız olarak neden üstün?]\\n\\nFiyat/Performans: [Hangisi fiyata göre en çok donanımı veriyor?]\\n\\nSatış Hızı: [Piyasada hangisi daha hızlı satılır?]" },
    { "icon": "star", "title": "Bütçe ve Kitle", "desc": "Hangi bütçeye ve hangi kitleye hitap ediyor?" }
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
`;

  // Master AI'a giden veriden gereksiz yer kaplayan kısımları (url, boş özellikler vb.) silerek SIKIŞTIRIYORUZ.
  // Bu sayede 1000 araç bile gönderilse OpenAI chat limiti şişmez.
  const cleanGroupReports = groupReports.map(g => ({
    groupName: g.groupName,
    cars: g.cars.map(c => ({
      title: c.carData.title,
      price: c.carData.price,
      scores: {
        ms: c.carData.market_speed_score,
        pp: c.carData.price_perf_score,
        fp: c.carData.fair_price_score,
        cs: c.carData.condition_score,
        total: c.carData.overall_score
      }
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

    // Arabaları 50'şerli "Chunk" (Paketler) haline getirelim
    const CHUNK_SIZE = 50;
    const allProcessedCars = [];

    for (let i = 0; i < flatCarsList.length; i += CHUNK_SIZE) {
      const chunk = flatCarsList.slice(i, i + CHUNK_SIZE);
      
      const chunkPromises = chunk.map(async (item) => {
        const { groupName: gName, carData: cData } = item;
        
        // TEK HAMLEDE TÜM VERİ ANALİZİNİ YAP
        const finalReport = await analyzeCarData(cData);

        processedCars++;
        updateState({ 
          aiStatusText: `Araçlar 50'li Paketler Halinde Analiz Ediliyor (${processedCars}/${totalCars})...`,
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
            images: cData.images, // Resimler aynen aktarılır, galeride görünür
            market_speed_score: finalReport.market_speed_score || null,
            price_perf_score: finalReport.price_perf_score || null,
            fair_price_score: finalReport.fair_price_score || null,
            condition_score: finalReport.condition_score || null,
            overall_score: finalReport.overall_score || null,
            ai_report: finalReport.data_report || null,
            vision_report: null, // Görsel AI tamamen kaldırıldı
            defects: [],
            positives: [],
            competitor_analysis: finalReport.competitor_analysis || null,
            detailed_specs: finalReport.detailed_specs || [],
            damage_map: finalReport.damage_map || null
          }
        };
      });

      // 50'lik paketi aynı anda çalıştır ve bitmesini bekle, sonraki 50'ye geç
      const chunkResults = await Promise.all(chunkPromises);
      allProcessedCars.push(...chunkResults);
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
});

chrome.tabs.onRemoved.addListener((tabId) => {
  const newTabs = trackedTabs.filter(t => t.tabId !== tabId);
  updateState({ trackedTabs: newTabs });
});
