import fs from 'fs';

const apiKeyPart1 = 'sk-proj-Z8bfe7a3mXpD45pHPamGVz9S7dxjX3gb52cTYjL8VC1EsRS2ZD5X7gMyXOxgFs-CHxupfPuu';
const apiKeyPart2 = 'DAT3BlbkFJYz-L_xKZgLkIrDkyuCbrQZxbokXa3MhoZ6jh8SFyEdmZQagDH6UPAaJlRnk9mQ8-a119MJ4WUA';
const OPENAI_API_KEY = apiKeyPart1 + apiKeyPart2;

async function callOpenAI(systemPrompt, userContent, useVision = false, model = 'gpt-4o') {
  console.log(`Calling OpenAI API (${model})...`);
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
      throw new Error(json.error ? json.error.message : 'Unknown API Error');
    }
    return JSON.parse(json.choices[0].message.content);
  } catch (err) {
    console.error(err);
    throw err;
  }
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

async function runTest() {
  const mockCar1 = {
    title: "2018 Volkswagen Caddy 2.0 TDI",
    price: "850.000 TL",
    url: "https://example.com/caddy1",
    description: "Temiz caddy, hatasız boyasız.",
    specs: { "Yıl": "2018", "Km": "120.000" },
    images: []
  };
  
  const mockCar2 = {
    title: "2019 Volkswagen Caddy 2.0 TDI",
    price: "900.000 TL",
    url: "https://example.com/caddy2",
    description: "Yetkili servis bakımlı.",
    specs: { "Yıl": "2019", "Km": "95.000" },
    images: []
  };

  const gCars = [mockCar1, mockCar2];
  
  let ai1Results = [];
  let ai2Results = [];

  for (let i = 0; i < gCars.length; i++) {
    const a1 = await analyzeDataOnly(gCars[i]);
    const a2 = await analyzeImagesOnly(gCars[i]);
    ai1Results.push(a1);
    ai2Results.push(a2);
  }

  const groupConsolidated = await consolidateGroup("VW Caddy", ai1Results, ai2Results, gCars);
  
  const globalSummary = await generateGlobalMasterReport([groupConsolidated]);

  const finalReport = { groups: [groupConsolidated], summaryData: globalSummary };
  
  fs.writeFileSync('mock_result.json', JSON.stringify(finalReport, null, 2));
  console.log("Test finished! Result saved to mock_result.json");
}

runTest();
