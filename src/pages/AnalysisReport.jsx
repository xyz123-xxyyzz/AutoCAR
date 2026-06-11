import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Zap, CheckCircle, Star, Settings, Shield, Gauge, Maximize, AlertTriangle, AlertCircle, XCircle, Minus, HelpCircle, Trophy, Target, Sparkles, ArrowRight, Table2, Image as ImageIcon, Users, X, Link } from 'lucide-react';
import DamageMap from '../components/DamageMap';
import { supabase } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';

export default function AnalysisReport() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [flatCars, setFlatCars] = useState([]);
  const [aiLoadingText, setAiLoadingText] = useState('Veriler Yükleniyor...');
  
  // -1 = Summary (Master AI), 0, 1, 2... = Group index
  const [activeTab, setActiveTab] = useState(-1);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  useEffect(() => {
    const processData = async () => {
      // 1. EĞER LİNK İLE GELDİYSE (Örn: /analiz/AC-45)
      if (routeId) {
        const dbId = routeId.replace('AC-', '');
        const { data, error } = await supabase.from('analyses_history').select('report_json').eq('id', dbId).single();
        if (data && data.report_json) {
          const result = data.report_json;
          const fetchedGroups = result.groups || [];
          setGroups(fetchedGroups);
          setSummaryData(result.summaryData || null);
          
          const cars = [];
          fetchedGroups.forEach(g => {
            if (g.cars) {
              g.cars.forEach(c => {
                cars.push({ ...c, groupName: g.groupName });
              });
            }
          });
          setFlatCars(cars);

          if (result.summaryData) setActiveTab(-1);
          else if (cars.length > 0) setActiveTab(0);
          setIsLoading(false);
          return;
        } else {
          console.error("Link yükleme hatası:", error);
          setAiLoadingText('Rapor Bulunamadı veya Silinmiş.');
          return;
        }
      }

      // 2. EĞER EKLENTİDEN YENİ GELDİYSE (LocalStorage)
      const storedData = window.localStorage.getItem('autocar_ai_result');
      if (!storedData) {
        setAiLoadingText('Eklentiden Rapor Bekleniyor...');
        return;
      }

      try {
        const result = JSON.parse(storedData);
        const fetchedGroups = result.groups || [];
        setGroups(fetchedGroups);
        setSummaryData(result.summaryData || null);
        
        const cars = [];
        fetchedGroups.forEach(g => {
          if (g.cars) {
            g.cars.forEach(c => {
              cars.push({ ...c, groupName: g.groupName });
            });
          }
        });
        setFlatCars(cars);
        
        if (result.summaryData) {
          setActiveTab(-1);
        } else if (cars.length > 0) {
          setActiveTab(0);
        }
        
        setIsLoading(false);

        // GEÇMİŞİ KAYDET (Eğer yeni bir raporsa)
        const lastSaved = window.localStorage.getItem('last_saved_report');
        if (storedData !== lastSaved) {
          window.localStorage.setItem('last_saved_report', storedData);
          
          const userEmail = localStorage.getItem('userEmail') || 'demo@autocar.com';
          const userRole = localStorage.getItem('userRole') || 'Kullanıcı';
          
          if (userEmail) {
            let title = "Yeni Analiz";
            let score = 0;
            
            if (result.summaryData && result.summaryData.title) {
               title = result.summaryData.title;
               score = result.summaryData.podium?.[0]?.score || 0;
            } else if (result.groups && result.groups.length > 0) {
               title = result.groups[0].cars?.[0]?.title || "Tekil Araç Analizi";
               score = result.groups[0].cars?.[0]?.overall_score || 0;
            }
            
            const realGroup = result.groups?.find(g => g.groupName?.toLowerCase().includes(title.substring(0, 10).toLowerCase()) || title.toLowerCase().includes(g.groupName?.toLowerCase()));
            if (realGroup && realGroup.cars?.[0]?.overall_score) {
               score = parseInt(realGroup.cars[0].overall_score, 10);
            }

            const newId = Math.floor(Math.random() * 9000000000) + 1000000000; // 10 haneli rastgele sayı
            
            const { data: insertedData, error } = await supabase.from('analyses_history').insert([
              { 
                id: newId,
                user_email: userEmail,
                role: userRole,
                car_details: title,
                score: parseInt(score, 10) || 0,
                report_json: result
              }
            ]).select();
            
            if (error) {
              console.error("Geçmiş kaydetme hatası:", error);
            } else if (insertedData && insertedData[0]) {
              // YENİ BENZERSİZ LİNK (AC-ID) OLUŞTUR VE REACT ROUTER İLE YÖNLENDİR
              navigate(`/analiz/AC-${insertedData[0].id}`, { replace: true });
            }
          }
        }
      } catch (err) {
        console.error('Data Load Error:', err);
        setAiLoadingText('Veri Yükleme Hatası Oluştu.');
      }
    };

    processData();
    
    window.addEventListener('autocar_report_ready', processData);
    return () => window.removeEventListener('autocar_report_ready', processData);
  }, []);

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

  const handleTabChange = (index) => {
    setActiveTab(index);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const currentCar = activeTab >= 0 ? flatCars[activeTab] : null;

  const openLightbox = (images, index) => {
    const validImages = Array.isArray(images) ? images : [];
    if (validImages.length === 0) return;
    setLightboxImages(validImages);
    setLightboxIndex(index || 0);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightboxImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevLightboxImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black overflow-hidden font-sans relative selection:bg-black selection:text-white pt-6 pb-20">
      
      {/* Top Navigation Panel */}
      {!isLoading && (
        <div className="w-full flex justify-center mb-12 px-4 max-w-7xl mx-auto z-50 relative mt-4">
          <div className="bg-white rounded-[2rem] shadow-embossed border border-black/5 flex items-center p-2 gap-4">
            {activeTab !== -1 && (
               <button 
                onClick={() => handleTabChange(-1)}
                className="p-3 bg-black text-white rounded-full hover:scale-105 transition-all duration-300 flex items-center gap-2 px-6 font-bold text-xs uppercase tracking-widest"
              >
                Ana Sayfaya Dön
              </button>
            )}
            
            <button 
               onClick={() => {
                if (activeTab === -1) {
                  handleTabChange(flatCars.length - 1);
                } else if (activeTab === 0) {
                  handleTabChange(-1);
                } else {
                  handleTabChange(activeTab - 1);
                }
              }}
              className={`p-3 bg-[#F5F5F7] rounded-full hover:bg-black hover:text-white transition-all duration-300 ${activeTab !== -1 ? 'ml-4' : 'ml-2'}`}
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="px-6 text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase text-black w-[250px] text-center">
              {activeTab === -1 ? "MASTER AI KIYASLAMA" : `${flatCars.length} İlandan ${activeTab + 1}.`}
            </div>
 
            <button 
              onClick={() => {
                if (activeTab === -1) {
                  handleTabChange(0);
                } else if (activeTab === flatCars.length - 1) {
                  handleTabChange(-1);
                } else {
                  handleTabChange(activeTab + 1);
                }
              }}
              className="p-3 bg-[#F5F5F7] rounded-full hover:bg-black hover:text-white transition-all duration-300"
            >
              <ChevronRight size={24} />
            </button>
            
            {/* Right side buttons container */}
            <div className="flex items-center gap-2 ml-4">
              {activeTab === -1 && (
                <button 
                  onClick={() => handleTabChange(0)}
                  className="p-3 bg-black text-white rounded-full hover:scale-105 transition-all duration-300 flex items-center gap-2 px-6 font-bold text-xs uppercase tracking-widest"
                >
                  Tüm İlanları İncele
                </button>
              )}
              
              {routeId && (
                <button 
                  onClick={handleCopyLink}
                  className="p-3 bg-[#FFCC00] text-black rounded-full hover:scale-105 transition-all duration-300 flex items-center gap-2 px-6 shadow-xl shadow-[#FFCC00]/20"
                >
                  {copySuccess ? <CheckCircle size={18} /> : <Link size={18} />}
                  <span className="font-bold text-xs uppercase tracking-widest">{copySuccess ? 'Kopyalandı' : 'Linki Paylaş'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col h-full items-center justify-center relative max-w-7xl mx-auto px-4 md:px-12 mt-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-8">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 border-4 border-black/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-black rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Target size={40} className="text-black/20" />
              </div>
            </div>
            <div className="text-xl font-display font-black tracking-widest text-black uppercase animate-pulse">
              {aiLoadingText}
            </div>
          </div>
        ) : activeTab === -1 && summaryData ? (
          
          /* ====================================================
             MASTER AI (GENEL KIYASLAMA) GÖRÜNÜMÜ
             ==================================================== */
          <div className="w-full animation-fade-in">
            <div className="text-center mb-20 relative">
              <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-embossed p-10 md:p-16 mb-12 inline-block mx-auto">
                <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter leading-[1.1] text-black mb-6">
                  {summaryData.title}
                </h1>
                <button 
                  onClick={() => handleTabChange(0)}
                  className="bg-black text-white px-8 py-4 rounded-full font-bold tracking-widest text-[11px] uppercase hover:scale-105 transition-all duration-300 shadow-2xl flex items-center justify-center gap-2 mx-auto"
                >
                  İlanları İncele <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Top 10 Araç Listesi */}
            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
              {(() => {
                // Tüm araçları puanına göre sırala
                const allCarsFlat = [];
                let flatIndex = 0;
                groups.forEach((g, gIdx) => {
                  g.cars?.forEach((c, cIdx) => {
                    allCarsFlat.push({ ...c, flatIndex: flatIndex++ });
                  });
                });
                allCarsFlat.sort((a, b) => {
                  let scoreA = parseInt(a.overall_score, 10) || 0;
                  let scoreB = parseInt(b.overall_score, 10) || 0;
                  if (scoreB !== scoreA) return scoreB - scoreA;
                  return (a.url || "").localeCompare(b.url || "");
                });
                
                const top10Cars = allCarsFlat.slice(0, 10);
                
                return top10Cars.map((car, idx) => {
                  const aiComment = summaryData?.top_10?.[idx]?.comment || "Fiyat ve kondisyon açısından piyasadaki mantıklı seçeneklerden biri.";
                  return (
                    <div 
                      key={idx} 
                      onClick={() => { handleTabChange(car.flatIndex); }}
                      className="bg-white rounded-3xl p-6 border border-black/5 shadow-embossed hover:shadow-embossed-hover transition-all duration-300 cursor-pointer flex flex-col md:flex-row items-center gap-6 group"
                    >
                      <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center shrink-0 font-display font-black text-3xl shadow-lg">
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-xl md:text-2xl font-display font-black tracking-tight text-black mb-1 group-hover:text-blue-600 transition-colors">
                          {car.title}
                        </h4>
                        <div className="text-2xl font-bold text-black/80 mb-2">
                          {car.price}
                        </div>
                        <p className="text-sm font-bold text-black/60 italic border-l-2 border-[#FFCC00] pl-3">
                          "{aiComment}"
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-center">
                          <div className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase mb-1">Skor</div>
                          <div className="text-3xl font-display font-black tracking-tighter text-[#32D74B]">{parseInt(car.overall_score, 10) || 0}</div>
                        </div>
                        <div className="w-10 h-10 bg-[#F5F5F7] rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            
            {/* Tüm İlanları İncele Butonu */}
            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => { handleTabChange(0); }}
                className="bg-black text-white px-10 py-5 rounded-full font-bold tracking-widest text-xs uppercase hover:scale-105 transition-all duration-300 shadow-2xl flex items-center justify-center gap-3"
              >
                Tüm İlanları ({groups.reduce((acc, g) => acc + (g.cars?.length || 0), 0)}) Detaylı İncele <ArrowRight size={18} />
              </button>
            </div>

            <div className="bg-black text-white rounded-[2.5rem] p-10 md:p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden mt-10">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-8">Master AI Mantığı</h3>
              <p className="text-white/80 mt-8 max-w-3xl mx-auto text-sm md:text-base font-bold leading-loose tracking-wide">
                {summaryData?.logic || "Analiz tamamlandı."}
              </p>
              <div className="bg-[#F5F5F7] rounded-[2rem] p-8 md:p-12 shadow-inner-embossed flex flex-col gap-8 text-left mt-10">
                {summaryData?.details?.map((detail, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-6 border-b border-black/5 pb-8 last:border-0 last:pb-0">
                    <div className="w-full md:w-1/4 shrink-0 border-l-4 border-black/10 pl-6">
                      <div className="mb-4 text-black/40">
                        {detail.icon === 'info' ? <HelpCircle size={24} /> : <CheckCircle size={24} />}
                      </div>
                      <div className="text-[10px] font-bold tracking-[0.2em] text-black/50 uppercase mb-2">
                        {detail.title}
                      </div>
                      {detail.winner && (
                        <div className="text-lg font-display font-black tracking-tight text-black">
                          {detail.winner}
                        </div>
                      )}
                    </div>
                    <div className="w-full md:w-3/4">
                      <div className="text-sm md:text-base font-bold text-black/70 whitespace-pre-line leading-loose text-left">
                        {detail.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Master AI Detaylı Kıyaslama Tablosu */}
              {summaryData?.tableData && summaryData.tableData.length > 0 && (
                <div className="mt-12 bg-white rounded-[2.5rem] border border-black/5 shadow-embossed p-8 md:p-12 overflow-hidden">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase mb-8 flex items-center gap-2">
                    <TrendingUp size={16} /> Teknik Özellik ve Fiyat Performans Kıyaslaması
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr>
                          <th className="p-4 border-b border-black/5 text-[10px] font-bold tracking-[0.2em] text-black uppercase">Özellik</th>
                          {Object.keys(summaryData.tableData[0]).filter(k => k !== 'feature').map((key, i) => (
                            <th key={i} className="p-4 border-b border-black/5 text-[10px] font-bold tracking-[0.2em] text-black uppercase">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {summaryData.tableData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-black/5 transition-colors group">
                            <td className="p-4 border-b border-black/5 font-bold text-black/70 text-sm group-hover:text-black">{row.feature}</td>
                            {Object.keys(row).filter(k => k !== 'feature').map((key, i) => (
                              <td key={i} className="p-4 border-b border-black/5 font-bold text-black text-sm">{row[key]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab >= 0 && currentCar ? (
          
          /* ====================================================
             GRUP İÇİ ARAÇ (AI-1 + AI-2 + AI-3) GÖRÜNÜMÜ
             ==================================================== */
          <div className="w-full animation-fade-in relative pt-12">
            
            {/* Araç Navigasyonu (Slider) */}
            <div className="absolute -top-6 w-full flex justify-between items-center z-50 pointer-events-none">
              <button 
                onClick={() => handleTabChange(activeTab > 0 ? activeTab - 1 : -1)} 
                className="p-4 bg-white/80 backdrop-blur-md rounded-full text-black hover:scale-110 disabled:opacity-0 transition-all duration-300 shadow-xl border border-black/5 pointer-events-auto"
              >
                <ChevronLeft size={32} strokeWidth={2} />
              </button>
              <div className="text-[10px] font-bold tracking-[0.2em] text-black/60 uppercase bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-sm border border-black/5 pointer-events-auto">
                {currentCar.groupName} — {activeTab + 1} / {flatCars.length}
              </div>
              <button 
                onClick={() => handleTabChange(activeTab < flatCars.length - 1 ? activeTab + 1 : -1)} 
                className="p-4 bg-white/80 backdrop-blur-md rounded-full text-black hover:scale-110 disabled:opacity-0 transition-all duration-300 shadow-xl border border-black/5 pointer-events-auto"
              >
                <ChevronRight size={32} strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-20 mb-20">
              <div className="flex-1">
                <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-8 leading-[1.1] text-black">{currentCar.title}</h2>
                <div className="text-3xl font-display font-black tracking-tight text-black mb-16">
                  {currentCar.price}
                </div>
                
                {currentCar.ai_report && (
                  <div className="relative pl-8 border-l-4 border-black">
                    <h3 className="text-xs font-bold tracking-[0.2em] text-black/40 uppercase mb-4 flex items-center gap-2">
                    <Star size={14} /> AI Veri Analizi
                  </h3>
                  <p className="text-sm font-bold text-black/60 leading-loose tracking-wider whitespace-pre-line">
                    {currentCar.ai_report
                      ?.replace(/(Fiyat\s*\/?\s*Performans|Fiyat\s*\/\s*Perf\.|Uygunluk|Araç Durumu)\s*\(/g, '\n\n$1 (') || ''}
                  </p>
                </div>
                )}
              </div>

              {currentCar.ai_report && (
                <div className="w-full xl:w-[350px] flex flex-col gap-4">
                  <div className="bg-[#F5F5F7] rounded-[2rem] p-10 text-center relative overflow-hidden group shadow-inner-embossed flex flex-col justify-center min-h-[220px]">
                    <div className="text-black/40 font-bold text-[10px] tracking-[0.2em] uppercase mb-2">Genel Skor</div>
                    <div className="text-7xl lg:text-[7rem] leading-none font-display font-black tracking-tighter text-black w-full overflow-hidden px-2">
                      {parseInt(currentCar.overall_score, 10) || 0}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-4">
                    <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 flex justify-between items-center shadow-embossed hover:shadow-embossed-hover transition-all duration-500">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#F5F5F7] rounded-full shadow-inner-embossed"><Zap className="text-black" size={16} strokeWidth={2} /></div>
                        <span className="font-bold tracking-widest text-[10px] text-black uppercase">Satış Hızı</span>
                      </div>
                      <div className="text-2xl font-display font-black tracking-tighter text-black">{parseInt(currentCar.market_speed_score, 10) || 0}</div>
                    </div>
                    <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 flex justify-between items-center shadow-embossed hover:shadow-embossed-hover transition-all duration-500">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#F5F5F7] rounded-full shadow-inner-embossed"><TrendingUp className="text-black" size={16} strokeWidth={2} /></div>
                        <span className="font-bold tracking-widest text-[10px] text-black uppercase">Fiyat / Perf.</span>
                      </div>
                      <div className="text-2xl font-display font-black tracking-tighter text-black">{parseInt(currentCar.price_perf_score, 10) || 0}</div>
                    </div>
                    <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 flex justify-between items-center shadow-embossed hover:shadow-embossed-hover transition-all duration-500">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#F5F5F7] rounded-full shadow-inner-embossed"><Target className="text-black" size={16} strokeWidth={2} /></div>
                        <span className="font-bold tracking-widest text-[10px] text-black uppercase">Uygunluk</span>
                      </div>
                      <div className="text-2xl font-display font-black tracking-tighter text-black">{parseInt(currentCar.fair_price_score, 10) || 0}</div>
                    </div>
                    <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 flex justify-between items-center shadow-embossed hover:shadow-embossed-hover transition-all duration-500">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#F5F5F7] rounded-full shadow-inner-embossed"><Shield className="text-black" size={16} strokeWidth={2} /></div>
                        <span className="font-bold tracking-widest text-[10px] text-black uppercase">Araç Durumu</span>
                      </div>
                      <div className="text-2xl font-display font-black tracking-tighter text-black">{parseInt(currentCar.condition_score, 10) || 0}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Detaylı Araç Özellikleri */}
            {currentCar.detailed_specs && currentCar.detailed_specs.length > 0 && (
              <>
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
              </>
            )}

            {/* Section 3: Kıyaslama ve Rakip Analizi */}
            {currentCar.competitor_analysis && (
              <>
                <div className="mb-20">
                  <h3 className="text-2xl font-display font-black tracking-tight text-black mb-8 flex items-center gap-4">
                    <Maximize className="text-black/30" /> Rakiplerine Göre Analiz {currentCar.competitor_analysis.competitors ? `(${currentCar.competitor_analysis.competitors.join(', ')})` : ''}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                    <div className="bg-[#F5F5F7] p-8 rounded-[2rem] shadow-inner-embossed">
                      <div className="text-[10px] font-bold tracking-[0.2em] text-green-600 uppercase mb-6 flex items-center gap-2"><CheckCircle size={14}/> Avantajlı Yönleri</div>
                      <ul className="space-y-4">
                        {currentCar.competitor_analysis.pros?.map((p, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-bold text-black/70">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
                            {p}
                          </li>
                        )) || <li className="text-sm font-bold text-black/50">Belirtilmemiş</li>}
                      </ul>
                    </div>

                    <div className="bg-[#F5F5F7] p-8 rounded-[2rem] shadow-inner-embossed">
                      <div className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase mb-6 flex items-center gap-2"><AlertTriangle size={14}/> Zayıf Yönleri</div>
                      <ul className="space-y-4">
                        {currentCar.competitor_analysis.cons?.map((p, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-bold text-black/70">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0"></div>
                            {p}
                          </li>
                        )) || <li className="text-sm font-bold text-black/50">Belirtilmemiş</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-black text-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Maximize size={120} />
                    </div>
                    <div className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-6 relative z-10 flex items-center gap-3">
                      <Star size={14} className="text-[#D4AF37]" /> Rakiplerine Göre Analiz {currentCar.competitor_analysis.competitors ? `(${currentCar.competitor_analysis.competitors.join(', ')})` : ''}
                    </div>
                    <div className="relative z-10 space-y-6">
                      {(currentCar.competitor_analysis.text || 'Rakip analizi bulunamadı.').split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="text-sm md:text-base font-bold leading-loose tracking-wide text-white/90">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-black/10 mb-20"></div>
              </>
            )}

            {/* Section 4: Görsel Yapay Zeka Analizi */}
            {currentCar.images && currentCar.images.length > 0 && (
              <>
                <div className="mb-20">
                  <h3 className="text-2xl font-display font-black tracking-tight text-black mb-8 flex items-center gap-4">
                    <ImageIcon className="text-black/30" /> Araç Fotoğrafları {currentCar.vision_report && "ve Görsel Analiz"}
                  </h3>
                  
                  {/* Resim Galerisi (Her Zaman Görünür) */}
                  <div className="w-full overflow-x-auto hide-scrollbar mb-12 cursor-grab active:cursor-grabbing pb-8 border-b border-black/5">
                    <div className="flex gap-4 px-2" style={{ width: 'max-content' }}>
                      {currentCar.images?.map((img, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => openLightbox(currentCar.images, idx)}
                          className="relative h-[200px] md:h-[280px] rounded-3xl overflow-hidden shrink-0 shadow-lg cursor-pointer group"
                        >
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10"></div>
                          <img 
                            src={img} 
                            alt={`Araç ${idx+1}`} 
                            className="h-full w-auto object-cover"
                            draggable="false"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Görsel AI Notları (Sadece Vision Çalıştıysa) */}
                  {currentCar.vision_report && (
                    <div className="bg-[#1C1C1E] text-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ImageIcon size={120} />
                      </div>
                      <div className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-8 relative z-10 flex items-center gap-3">
                        <Star size={14} className="text-[#32D74B]" /> 4o-Mini Görsel İnceleme Raporu
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10 relative z-10">
                        <div className="bg-black/40 p-8 rounded-[2rem]">
                          <div className="text-[10px] font-bold tracking-[0.2em] text-[#32D74B] uppercase mb-6 flex items-center gap-2"><CheckCircle size={14}/> Olumlu Detaylar</div>
                          <ul className="space-y-4">
                            {currentCar.positives?.map((p, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm font-bold text-white/80">
                                <div className="w-1.5 h-1.5 bg-[#32D74B] rounded-full mt-1.5 shrink-0"></div>
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-black/40 p-8 rounded-[2rem]">
                          <div className="text-[10px] font-bold tracking-[0.2em] text-[#FF453A] uppercase mb-6 flex items-center gap-2"><AlertTriangle size={14}/> Görünen Kusurlar</div>
                          <ul className="space-y-4">
                            {currentCar.defects?.map((p, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm font-bold text-white/80">
                                <div className="w-1.5 h-1.5 bg-[#FF453A] rounded-full mt-1.5 shrink-0"></div>
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="relative z-10 border-t border-white/10 pt-8">
                        {(currentCar.vision_report || '').split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="text-sm md:text-base font-bold leading-loose tracking-wide text-white/90">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full h-[1px] bg-black/10 mb-20"></div>
              </>
            )}

              {/* İlan Linki ve Ekspertiz */}
              <div>
                <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 mb-12">
                  <a href={currentCar.url} target="_blank" rel="noopener noreferrer" className="bg-[#FFCC00] text-black px-10 py-5 rounded-full font-bold tracking-widest text-xs uppercase hover:scale-105 transition-all duration-300 shadow-xl shadow-[#FFCC00]/20 flex items-center justify-center gap-3">
                    İlan Linkine Git <ArrowRight size={18} />
                  </a>
                </div>

                {/* Ekspertiz Haritası */}
                <DamageMap damageMap={currentCar.damage_map} />
              </div>
          </div>
        ) : null}
      </div>

      {/* Marketing CTA Removed */}

      {/* Lightbox Modal */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animation-fade-in" onClick={closeLightbox}>
          <div className="absolute top-6 right-6 flex gap-4">
            <div className="bg-white/10 text-white px-4 py-2 rounded-full font-bold tracking-widest text-xs">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>
            <button onClick={closeLightbox} className="bg-white/10 hover:bg-white text-white hover:text-black p-2 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <button onClick={prevLightboxImage} className="absolute left-6 p-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-colors z-50">
            <ChevronLeft size={32} />
          </button>
          
          <button onClick={nextLightboxImage} className="absolute right-6 p-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-colors z-50">
            <ChevronRight size={32} />
          </button>
          
          <img 
            src={lightboxImages[lightboxIndex]} 
            alt="Tam Ekran Görsel" 
            className="max-w-[90vw] max-h-[85vh] object-contain select-none"
            onClick={(e) => e.stopPropagation()} 
          />
          
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
