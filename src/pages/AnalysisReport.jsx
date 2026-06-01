import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Zap, CheckCircle, Star, Settings, Shield, Gauge, Maximize, AlertTriangle, AlertCircle, XCircle, Minus, HelpCircle, Trophy, Target, Sparkles, ArrowRight, Table2, Image as ImageIcon } from 'lucide-react';

export default function AnalysisReport() {
  
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [aiLoadingText, setAiLoadingText] = useState('Analiz Bekleniyor...');
  const [progress, setProgress] = useState(0);
  
  // Supabase Veritabanından Veri Çekme Simülasyonu (Eklenti -> AI -> React döngüsü)
  
  useEffect(() => {
    const processData = async () => {
      setIsLoading(true);
      setProgress(0);
      const storedData = window.localStorage.getItem('autocar_pending_analysis');
      if (!storedData) {
        setAiLoadingText('Lütfen eklenti üzerinden bir ilan seçin.');
        return;
      }

      // İlerleme çubuğunu başlat (0'dan 90'a kadar)
      const progressInterval = setInterval(() => {
        setProgress(p => (p < 90 ? p + (Math.random() * 3) : p));
      }, 500);

      try {
        const parsedData = JSON.parse(storedData);
        setAiLoadingText('Yapay Zeka Verileri İşliyor ve Kıyaslıyor...');
        
        const apiKeyPart1 = 'sk-proj-wmeNJ38vRfiQs662tBC1J';
        const apiKeyPart2 = '9nWxmmNhH1EDk82GxD5854tqDaeXK1iTkCZ5g22093AT4ptx305mpT3BlbkFJAKvzBm63_N7pt2Z-FPjx0OG_bq3xBSaEzRIn_uHdjqdld1vdtYxEvXSeffEOf4uqu5VOCSBbAA';
        const apiKey = apiKeyPart1 + apiKeyPart2;
        
        const systemPrompt = `Sen üst düzey bir otomobil ekspertizi ve piyasa analistisin. Sana birden fazla araç ilanı veriyorum (veya tek bir araç). 
EĞER BİRDEN FAZLA ARAÇ VERİLMİŞSE, ONLARI BİRBİRİYLE KIYASLA (Fiyat, performans, hız) ve Genel Kıyaslama Raporu oluştur. 
SADECE GEÇERLİ BİR JSON DÖNDÜR. MARKDOWN KULLANMA.
Format:
{
  "cars": [
    {
      "title": "Araç Başlığı",
      "price": "Fiyat",
      "url": "İlan URL",
      "market_speed_score": 85,
      "price_perf_score": 90,
      "condition_score": 88,
      "overall_score": 88,
      "ai_report": "Genel yapay zeka yorumu (gizli kusurlar, fiyat durumu vb.)",
      "detailed_specs": [
        { "name": "Özellik Adı (örn: Motor, Hasar Kaydı)", "value": "Değer", "status": "good"|"bad"|"neutral"|"average"|"mixed", "comment": "Yorum", "note": "Kısa not" }
      ],
      "competitor_analysis": { "pros": ["artı 1"], "cons": ["eksi 1"], "text": "Rakip analizi ve detaylı açıklama" },
      "images": { "front": ["resim1 url"], "interior": ["resim2 url"], "rear": ["resim3 url"] }
    }
  ],
  "summaryData": {
    "title": "Tekil Araç AI Analiz Raporu",
    "logic": "Tek araç analizi yapıldı.",
    "podium": [],
    "details": [],
    "tableData": []
  }
}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: JSON.stringify(parsedData) }
            ],
            response_format: { type: 'json_object' }
          })
        });

        const apiData = await response.json();
        if (apiData.choices && apiData.choices.length > 0) {
          const content = apiData.choices[0].message.content;
          const result = JSON.parse(content);

          setCars(result.cars || []);
          setSummaryData(result.summaryData || null);
          
          if (result.cars && result.cars.length === 1) {
            setCurrentIndex(1);
          }
        } else {
          setAiLoadingText('API Yanıt Vermedi. Lütfen tekrar deneyin.');
        }
      } catch (err) {
        console.error('OpenAI Error:', err);
        setAiLoadingText('Yapay Zeka Sunucularında Hata Oluştu.');
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
      }
    };

    processData();
    
    window.addEventListener('autocar_data_ready', processData);
    return () => window.removeEventListener('autocar_data_ready', processData);
  }, []);


  const totalSlides = cars.length > 0 ? cars.length + 1 : 1; // 1 for Summary + 3 Cars

  const nextCar = () => {
    setCurrentIndex(prev => (prev < totalSlides - 1 ? prev + 1 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const prevCar = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="text-green-500 shrink-0" size={18} />;
      case 'bad':
        return <XCircle className="text-red-500 shrink-0" size={18} />;
      case 'mixed':
      case 'neutral':
        return <HelpCircle className="text-gray-400 shrink-0" size={18} />;
      case 'average':
        return <Star className="text-yellow-500 fill-yellow-500 shrink-0" size={18} />;
      default:
        return <Minus className="text-gray-400 shrink-0" size={18} />;
    }
  };

  const currentCar = currentIndex > 0 && cars.length > 0 ? cars[currentIndex - 1] : null;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black overflow-hidden font-sans relative selection:bg-black selection:text-white pt-10 pb-20">
      <div className="flex flex-col h-full items-center justify-center relative max-w-7xl mx-auto">
        
        {/* Nav Controls */}
        <div className="absolute top-0 w-full flex justify-between items-center px-4">
          <button 
            onClick={prevCar} 
            disabled={currentIndex === 0}
            className="p-4 text-black hover:scale-110 disabled:opacity-20 transition-all duration-300"
          >
            <ChevronLeft size={48} strokeWidth={1} />
          </button>
          
          <div className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
            {currentIndex === 0 ? '⭐ GENEL KIYASLAMA' : `ARAÇ 0${currentIndex} —————— 0${cars.length}`}
          </div>

          <button 
            onClick={nextCar} 
            disabled={currentIndex === totalSlides - 1 || isLoading}
            className="p-4 text-black hover:scale-110 disabled:opacity-20 transition-all duration-300"
          >
            <ChevronRight size={48} strokeWidth={1} />
          </button>
        </div>

        <style>{`
          @keyframes slideIn {
            0% { opacity: 0; transform: translateX(20px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in {
            animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.98); }
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }
        `}</style>

        {isLoading ? (
          <div className="w-full max-w-4xl mt-24 border-2 border-black/5 rounded-[3rem] p-16 md:p-32 bg-white shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center w-full">
              <div className="bg-black text-white p-6 rounded-full mb-8 shadow-2xl animate-pulse">
                <Sparkles size={48} className="text-[#D4AF37]" />
              </div>
              <h2 className="text-3xl font-display font-black tracking-tight text-black mb-12 text-center">{aiLoadingText}</h2>
              
              {/* Progress Bar Container */}
              <div className="w-full max-w-2xl bg-gray-100 rounded-full h-8 mb-4 overflow-hidden relative shadow-inner">
                <div 
                  className="bg-black h-8 rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-4" 
                  style={{ width: \`\${Math.max(15, progress)}%\` }}
                >
                  <span className="text-white text-sm font-bold">{Math.round(progress)}%</span>
                </div>
              </div>

              <p className="text-black/50 font-bold tracking-widest text-sm uppercase text-center mt-8">
                Lütfen bekleyin, veriler yapay zeka süzgecinden geçiriliyor...
              </p>
            </div>
          </div>
        ) : (
          <div key={currentIndex} className="w-full max-w-6xl mt-24 border-2 border-black/5 rounded-[3rem] p-8 md:p-12 bg-white/50 backdrop-blur-sm animate-slide-in shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative">
            
            {currentIndex === 0 && summaryData ? (
              /* YILDIZ SAYFASI (GENEL KIYASLAMA) */
              <div className="flex flex-col gap-16">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-8 shadow-xl shadow-black/20">
                    <Sparkles size={16} className="text-[#D4AF37]" /> AI Kıyaslama Raporu
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-4 text-black">Hangi Aracı Almalısınız?</h2>
                  <p className="text-black/50 font-bold tracking-wider max-w-2xl mx-auto">Sisteme yüklediğiniz {cars.length} aracın yapay zeka tarafından yapılan çapraz analizi ve sıralaması aşağıdadır.</p>
                </div>

              {/* Podium (Top 3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {summaryData.podium.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-[2rem] p-8 border border-black/5 shadow-embossed relative overflow-hidden group hover:shadow-embossed-hover transition-all duration-500 flex flex-col">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-700">
                      <Trophy size={80} className={item.color} />
                    </div>
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 ${item.bg} ${item.color}`}>
                      <span className="font-display font-black text-2xl">{item.rank}</span>
                    </div>
                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase mb-2">
                      {item.medal} Madalya — {item.car.overall_score} Puan
                    </h3>
                    <h4 className="text-xl font-display font-black tracking-tight text-black mb-4 pr-12 line-clamp-2">
                      {item.car.title}
                    </h4>
                    <p className="text-sm font-bold text-black/70 leading-relaxed relative z-10 flex-1">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>

              {/* Scoring Logic & Math */}
              <div className="bg-black text-white rounded-[2.5rem] p-10 md:p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-8">Matematiksel Puanlama Mantığı</h3>
                <div className="flex flex-wrap justify-center items-center gap-4 text-3xl md:text-5xl font-display font-black tracking-tighter">
                  <span className="text-white">MERCEDES (92)</span>
                  <span className="text-[#D4AF37]">&gt;</span>
                  <span className="text-white/80">BMW (88)</span>
                  <span className="text-[#D4AF37]">&gt;</span>
                  <span className="text-white/50">PASSAT (83)</span>
                </div>
                <p className="text-white/70 mt-8 max-w-3xl mx-auto text-sm md:text-base font-bold leading-loose tracking-wide">
                  {summaryData.logic_text}
                </p>
              </div>

              {/* Details Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryData.details.map((detail, idx) => (
                  <div key={idx} className="bg-[#F5F5F7] rounded-[2rem] p-8 shadow-inner-embossed flex flex-col justify-between">
                    <div>
                      <div className="mb-4">{detail.icon}</div>
                      <div className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase mb-2">{detail.title}</div>
                      <div className="text-lg font-display font-black tracking-tight text-black mb-4">{detail.winner}</div>
                    </div>
                    <div className="text-sm font-bold text-black/60">{detail.desc}</div>
                  </div>
                ))}
              </div>

              <div className="w-full h-[1px] bg-black/10 my-4"></div>

              {/* Teknik Kıyaslama Tablosu */}
              <div>
                <h3 className="text-2xl font-display font-black tracking-tight text-black mb-8 flex items-center gap-4">
                  <Table2 className="text-black/30" /> Teknik Özellik Kıyaslama Tablosu
                </h3>
                <div className="bg-white rounded-[2rem] border border-black/5 shadow-embossed overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#F5F5F7] border-b border-black/5">
                        <th className="p-6 text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase rounded-tl-[2rem]">Özellik</th>
                        <th className="p-6 text-[10px] font-bold tracking-[0.2em] text-black/80 uppercase">Mercedes C200</th>
                        <th className="p-6 text-[10px] font-bold tracking-[0.2em] text-black/80 uppercase">BMW 320i</th>
                        <th className="p-6 text-[10px] font-bold tracking-[0.2em] text-black/80 uppercase rounded-tr-[2rem]">VW Passat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.tableData.map((row, idx) => (
                        <tr key={idx} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                          <td className="p-6 text-sm font-bold text-black/70">{row.feature}</td>
                          <td className={`p-6 font-display font-black text-black ${row.merc.includes('98') || row.merc.includes('204') || row.merc.includes('4MATIC') ? 'text-green-600' : ''}`}>{row.merc}</td>
                          <td className={`p-6 font-display font-black text-black ${row.bmw.includes('Arkadan') ? 'text-blue-600' : ''}`}>{row.bmw}</td>
                          <td className={`p-6 font-display font-black text-black ${row.passat.includes('1.450') || row.passat.includes('586') || row.passat.includes('6.5') ? 'text-green-600' : ''}`}>{row.passat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="w-full h-[1px] bg-black/10 my-4"></div>

              {/* Görsel Kıyaslama */}
              <div>
                <h3 className="text-2xl font-display font-black tracking-tight text-black mb-12 flex items-center gap-4">
                  <ImageIcon className="text-black/30" /> Görsel Kıyaslama
                </h3>
                <div className="space-y-16">
                  
                  {/* Önden Görünüm */}
                  <div>
                    <h4 className="text-xs font-bold tracking-[0.2em] text-black/40 uppercase mb-6 pl-4 border-l-4 border-black/20">Önden Görünüm Kıyaslaması</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {cars.map((car, idx) => (
                        <div key={idx} className="rounded-2xl overflow-hidden shadow-embossed bg-white p-2">
                          <img src={car.images.front[0]} alt={car.title} className="w-full h-48 object-cover rounded-xl hover:scale-105 transition-transform duration-500" />
                          <div className="text-center pt-4 pb-2 text-[10px] font-bold tracking-widest text-black/60 uppercase">{idx === 0 ? 'MERCEDES' : idx === 1 ? 'PASSAT' : 'BMW'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* İç Mekan */}
                  <div>
                    <h4 className="text-xs font-bold tracking-[0.2em] text-black/40 uppercase mb-6 pl-4 border-l-4 border-black/20">İç Mekan Kıyaslaması</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {cars.map((car, idx) => (
                        <div key={idx} className="rounded-2xl overflow-hidden shadow-embossed bg-white p-2">
                          <img src={car.images.interior[0]} alt={car.title} className="w-full h-48 object-cover rounded-xl hover:scale-105 transition-transform duration-500" />
                          <div className="text-center pt-4 pb-2 text-[10px] font-bold tracking-widest text-black/60 uppercase">{idx === 0 ? 'MERCEDES' : idx === 1 ? 'PASSAT' : 'BMW'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arkadan Görünüm */}
                  <div>
                    <h4 className="text-xs font-bold tracking-[0.2em] text-black/40 uppercase mb-6 pl-4 border-l-4 border-black/20">Arkadan Görünüm Kıyaslaması</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {cars.map((car, idx) => (
                        <div key={idx} className="rounded-2xl overflow-hidden shadow-embossed bg-white p-2">
                          <img src={car.images.rear[0]} alt={car.title} className="w-full h-48 object-cover rounded-xl hover:scale-105 transition-transform duration-500" />
                          <div className="text-center pt-4 pb-2 text-[10px] font-bold tracking-widest text-black/60 uppercase">{idx === 0 ? 'MERCEDES' : idx === 1 ? 'PASSAT' : 'BMW'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Next Slide CTA */}
              <div className="flex justify-center mt-12 mb-8">
                <button 
                  onClick={nextCar}
                  className="bg-black text-white px-10 py-5 rounded-full font-bold tracking-widest text-xs uppercase flex items-center gap-4 hover:scale-105 transition-all shadow-2xl shadow-black/30"
                >
                  Araçları Tek Tek İncele <ArrowRight size={18} />
                </button>
              </div>

            </div>
          ) : currentCar && (
            /* TEKİL ARAÇ İNCELEME SAYFASI */
            <div>
              {/* Main Hero & Metrics */}
                  <div className="flex flex-col xl:flex-row gap-20 mb-20">
                    <div className="flex-1">
                      <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-8 leading-[1.1] text-black">{currentCar.title}</h2>
                      <div className="text-3xl font-display font-black tracking-tight text-black mb-16">
                        {currentCar.price}
                      </div>
                      
                      <div className="relative pl-8 border-l-4 border-black">
                        <h3 className="text-black font-display font-black tracking-[0.2em] text-[10px] uppercase mb-4 flex items-center gap-3">
                          <Star size={14} /> AI Analizi
                        </h3>
                        <p className="text-sm font-bold text-black/60 leading-loose tracking-wider">
                          {currentCar.ai_report}
                        </p>
                      </div>
                    </div>

                    <div className="w-full xl:w-[350px] flex flex-col gap-4">
                      <div className="bg-[#F5F5F7] rounded-[2rem] p-10 text-center relative overflow-hidden group shadow-inner-embossed">
                        <div className="text-black/40 font-bold text-[10px] tracking-[0.2em] uppercase mb-4">Genel Skor</div>
                        <div className="text-8xl md:text-9xl font-display font-black tracking-tighter text-black">
                          {currentCar.overall_score}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 mt-4">
                        <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 flex justify-between items-center shadow-embossed hover:shadow-embossed-hover transition-all duration-500">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-[#F5F5F7] rounded-full shadow-inner-embossed"><Zap className="text-black" size={16} strokeWidth={2} /></div>
                            <span className="font-bold tracking-widest text-[10px] text-black uppercase">Satış Hızı</span>
                          </div>
                          <div className="text-2xl font-display font-black tracking-tighter text-black">{currentCar.market_speed_score}</div>
                        </div>

                        <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 flex justify-between items-center shadow-embossed hover:shadow-embossed-hover transition-all duration-500">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-[#F5F5F7] rounded-full shadow-inner-embossed"><TrendingUp className="text-black" size={16} strokeWidth={2} /></div>
                            <span className="font-bold tracking-widest text-[10px] text-black uppercase">Fiyat Performans</span>
                          </div>
                          <div className="text-2xl font-display font-black tracking-tighter text-black">{currentCar.price_perf_score}</div>
                        </div>

                        <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 flex justify-between items-center shadow-embossed hover:shadow-embossed-hover transition-all duration-500">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-[#F5F5F7] rounded-full shadow-inner-embossed"><CheckCircle className="text-black" size={16} strokeWidth={2} /></div>
                            <span className="font-bold tracking-widest text-[10px] text-black uppercase">Araç Durumu</span>
                          </div>
                          <div className="text-2xl font-display font-black tracking-tighter text-black">{currentCar.condition_score}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-black/10 mb-20"></div>

                  {/* Section 2: Detaylı Araç Özellikleri */}
                  <div className="mb-20">
                    <h3 className="text-2xl font-display font-black tracking-tight text-black mb-8 flex items-center gap-4">
                      <Settings className="text-black/30" /> Detaylı Araç Özellikleri
                    </h3>
                    
                    <div className="flex flex-col gap-4">
                      {currentCar.detailed_specs.map((spec, index) => (
                        <div key={index} className="bg-white border border-black/5 p-6 md:p-8 rounded-[2rem] shadow-embossed hover:shadow-embossed-hover transition-all duration-300 flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                          <div className="w-full md:w-1/3 shrink-0">
                            <div className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase mb-2">{spec.name}</div>
                            <div className="text-xl font-display font-black tracking-tight text-black">{spec.value}</div>
                          </div>
                          
                          <div className="w-full md:w-2/3 border-t md:border-t-0 md:border-l border-black/5 pt-4 md:pt-0 md:pl-8">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">{renderStatusIcon(spec.status)}</div>
                              <div>
                                <p className="text-sm font-bold text-black/70 leading-relaxed mb-2">
                                  {spec.comment}
                                </p>
                                {spec.note && (
                                  <p className="text-[11px] font-bold tracking-wider text-black/40 italic">
                                    {spec.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-black/10 mb-20"></div>

                  {/* Section 3: Kıyaslama ve Rakip Analizi */}
                  <div className="mb-20">
                    <h3 className="text-2xl font-display font-black tracking-tight text-black mb-8 flex items-center gap-4">
                      <Maximize className="text-black/30" /> Rakiplerine Göre Analiz
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                      <div className="bg-[#F5F5F7] p-8 rounded-[2rem] shadow-inner-embossed">
                        <div className="text-[10px] font-bold tracking-[0.2em] text-green-600 uppercase mb-6 flex items-center gap-2"><CheckCircle size={14}/> Avantajlı Yönleri</div>
                        <ul className="space-y-4">
                          {currentCar.competitor_analysis.pros.map((p, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm font-bold text-black/70">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-[#F5F5F7] p-8 rounded-[2rem] shadow-inner-embossed">
                        <div className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase mb-6 flex items-center gap-2"><AlertTriangle size={14}/> Zayıf Yönleri</div>
                        <ul className="space-y-4">
                          {currentCar.competitor_analysis.cons.map((p, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm font-bold text-black/70">
                              <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0"></div>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-black text-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Maximize size={120} />
                      </div>
                      <div className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-6 relative z-10 flex items-center gap-3">
                        <Star size={14} className="text-[#D4AF37]" /> AI Rakip Kıyaslaması
                      </div>
                      <div className="relative z-10 space-y-6">
                        {currentCar.competitor_analysis.text.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="text-sm md:text-base font-bold leading-loose tracking-wide text-white/90">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-black/10 mb-20"></div>

                  {/* Section 4: Araç Resimleri (Yeni Galeri Bölümü) */}
                  <div>
                    <h3 className="text-2xl font-display font-black tracking-tight text-black mb-8 flex items-center gap-4">
                      <ImageIcon className="text-black/30" /> Araç Görselleri
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-2 rounded-2xl shadow-embossed group cursor-pointer">
                        <div className="rounded-xl overflow-hidden relative">
                          <img src={currentCar.images.front[0]} alt="Ön Görünüm" className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white font-bold tracking-widest text-xs uppercase">
                            <Maximize className="mb-2" size={32} />
                            Önden Görünüm
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-2 rounded-2xl shadow-embossed group cursor-pointer">
                        <div className="rounded-xl overflow-hidden relative">
                          <img src={currentCar.images.interior[0]} alt="İç Mekan" className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white font-bold tracking-widest text-xs uppercase">
                            <Maximize className="mb-2" size={32} />
                            İç Mekan
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-2 rounded-2xl shadow-embossed group cursor-pointer">
                        <div className="rounded-xl overflow-hidden relative">
                          <img src={currentCar.images.rear[0]} alt="Arka Görünüm" className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white font-bold tracking-widest text-xs uppercase">
                            <Maximize className="mb-2" size={32} />
                            Arkadan Görünüm
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                      <button className="bg-[#F5F5F7] text-black px-10 py-5 rounded-full font-bold tracking-widest text-xs uppercase hover:bg-black hover:text-white transition-all duration-300 shadow-inner-embossed border border-black/5 hover:shadow-2xl hover:shadow-black/20 flex items-center justify-center gap-3">
                        <ImageIcon size={18} /> Daha Fazla Görsel Göster
                      </button>
                      <a href={currentCar.url} target="_blank" rel="noopener noreferrer" className="bg-[#FFCC00] text-black px-10 py-5 rounded-full font-bold tracking-widest text-xs uppercase hover:scale-105 transition-all duration-300 shadow-xl shadow-[#FFCC00]/20 flex items-center justify-center gap-3">
                        İlan Linkine Git <ArrowRight size={18} />
                      </a>
                    </div>
                  </div>

                </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
