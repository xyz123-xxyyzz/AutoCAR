import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Zap, CheckCircle, Star, Settings, Shield, Gauge, Maximize, AlertTriangle, AlertCircle, XCircle, Minus, HelpCircle, Trophy, Target, Sparkles, ArrowRight, Table2, Image as ImageIcon, Users, X } from 'lucide-react';
import DamageMap from '../components/DamageMap';

export default function AnalysisReport() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [aiLoadingText, setAiLoadingText] = useState('Veriler Yükleniyor...');
  
  // -1 = Summary (Master AI), 0, 1, 2... = Group index
  const [activeTab, setActiveTab] = useState(-1);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);


  useEffect(() => {
    const processData = () => {
      const storedData = window.localStorage.getItem('autocar_ai_result');
      if (!storedData) {
        setAiLoadingText('Eklentiden Rapor Bekleniyor...');
        return;
      }

      try {
        const result = JSON.parse(storedData);
        setGroups(result.groups || []);
        setSummaryData(result.summaryData || null);
        
        if (result.summaryData) {
          setActiveTab(-1);
        } else if (result.groups && result.groups.length > 0) {
          setActiveTab(0);
        }
        
        setIsLoading(false);
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
    setCurrentCarIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeGroup = activeTab >= 0 ? groups[activeTab] : null;
  const currentCar = activeGroup?.cars?.[currentCarIndex];
  const totalCarsInGroup = activeGroup?.cars?.length || 0;

  const nextCar = () => {
    setCurrentCarIndex(prev => (prev < totalCarsInGroup - 1 ? prev + 1 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const prevCar = () => {
    setCurrentCarIndex(prev => (prev > 0 ? prev - 1 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            <button 
              onClick={() => handleTabChange(activeTab > -1 ? activeTab - 1 : groups.length - 1)}
              className="p-3 bg-[#F5F5F7] rounded-full hover:bg-black hover:text-white transition-all duration-300"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="px-6 text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase text-black w-[250px] text-center">
              {(() => {
                const hasMaster = summaryData?.podium?.length > 0;
                const totalTabs = groups.length + (hasMaster ? 1 : 0);
                const currentTabIndex = activeTab === -1 ? 1 : activeTab + (hasMaster ? 2 : 1);
                return `${totalTabs}'te ${currentTabIndex}`;
              })()}
            </div>

            <button 
              onClick={() => handleTabChange(activeTab < groups.length - 1 ? activeTab + 1 : -1)}
              className="p-3 bg-[#F5F5F7] rounded-full hover:bg-black hover:text-white transition-all duration-300"
            >
              <ChevronRight size={24} />
            </button>
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
                <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter leading-[1.1] text-black">
                  {summaryData.title}
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...(summaryData?.podium || [])].map((item) => {
                // Skoru zorla gruptan al
                const realGroup = groups.find(g => g.groupName.toLowerCase().includes(item.title.toLowerCase().substring(0, 10)) || item.title.toLowerCase().includes(g.groupName.toLowerCase()));
                const realScore = realGroup ? (parseInt(realGroup.cars[0]?.overall_score, 10) || 0) : (parseInt(item.score, 10) || 0);
                return { ...item, realScore: realScore };
              }).sort((a, b) => b.realScore - a.realScore).map((item, idx) => (
                <div key={idx} className="bg-white rounded-[2rem] p-8 border border-black/5 shadow-embossed relative overflow-hidden group hover:shadow-embossed-hover transition-all duration-500 flex flex-col">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-700">
                    <Trophy size={80} className={item.color || 'text-[#C0C0C0]'} />
                  </div>
                  
                  {/* Master AI Görselleri */}
                  {item.images && item.images.length > 0 && (
                    <div className="flex gap-2 mb-6 mt-2 relative z-10">
                      {item.images.slice(0, 3).map((imgUrl, i) => (
                        <div key={i} className="w-1/3 aspect-[4/3] rounded-xl overflow-hidden relative border border-black/5 shadow-inner-embossed">
                          <img src={imgUrl} alt="Araç Görseli" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 relative z-10 ${item.bg || 'bg-gray-100'} ${item.color || 'text-black'}`}>
                    <span className="font-display font-black text-2xl">{item.rank || idx + 1}</span>
                  </div>
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase mb-2 text-left">
                    {item.medal} Madalya — {item.realScore} Puan
                  </h3>
                  <h4 className="text-xl font-display font-black tracking-tight text-black mb-4 pr-12 line-clamp-2 text-left">
                    {item.title || 'Bilinmeyen Araç'}
                  </h4>
                  <div className="text-sm font-bold text-black/70 leading-relaxed relative z-10 flex-1 whitespace-pre-line text-left">
                    {item.reason}
                  </div>
                </div>
              ))}
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
        ) : activeGroup && currentCar ? (
          
          /* ====================================================
             GRUP İÇİ ARAÇ (AI-1 + AI-2 + AI-3) GÖRÜNÜMÜ
             ==================================================== */
          <div className="w-full animation-fade-in relative pt-12">
            
            {/* Araç Navigasyonu (Slider) */}
            <div className="absolute -top-6 w-full flex justify-between items-center z-50 pointer-events-none">
              <button 
                onClick={prevCar} 
                disabled={currentCarIndex === 0}
                className="p-4 bg-white/80 backdrop-blur-md rounded-full text-black hover:scale-110 disabled:opacity-0 transition-all duration-300 shadow-xl border border-black/5 pointer-events-auto"
              >
                <ChevronLeft size={32} strokeWidth={2} />
              </button>
              <div className="text-[10px] font-bold tracking-[0.2em] text-black/60 uppercase bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-sm border border-black/5 pointer-events-auto">
                {activeGroup.groupName} — {currentCarIndex + 1} / {totalCarsInGroup}
              </div>
              <button 
                onClick={nextCar} 
                disabled={currentCarIndex === totalCarsInGroup - 1}
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
                
                <div className="relative pl-8 border-l-4 border-black">
                  <h3 className="text-xs font-bold tracking-[0.2em] text-black/40 uppercase mb-4 flex items-center gap-2">
                  <Star size={14} /> AI Analizi (Görsel + Veri)
                </h3>
                <p className="text-sm font-bold text-black/60 leading-loose tracking-wider whitespace-pre-line">
                  {currentCar.ai_report
                    ?.replace(/(Fiyat\s*\/?\s*Performans|Fiyat\s*\/\s*Perf\.|Uygunluk|Araç Durumu)\s*\(/g, '\n\n$1 (') || ''}
                </p>
              </div>
            </div>

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
            </div>

            {/* Section 2: Detaylı Araç Özellikleri */}
            <div className="mb-20">
              <h3 className="text-2xl font-display font-black tracking-tight text-black mb-8 flex items-center gap-4">
                <Settings className="text-black/30" /> Detaylı Araç Özellikleri
              </h3>
              
              <div className="flex flex-col gap-4">
                {currentCar.detailed_specs?.map((spec, index) => (
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
                <Maximize className="text-black/30" /> Rakiplerine Göre Analiz {currentCar.competitor_analysis?.competitors ? `(${currentCar.competitor_analysis.competitors.join(', ')})` : ''}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                <div className="bg-[#F5F5F7] p-8 rounded-[2rem] shadow-inner-embossed">
                  <div className="text-[10px] font-bold tracking-[0.2em] text-green-600 uppercase mb-6 flex items-center gap-2"><CheckCircle size={14}/> Avantajlı Yönleri</div>
                  <ul className="space-y-4">
                    {currentCar.competitor_analysis?.pros?.map((p, i) => (
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
                    {currentCar.competitor_analysis?.cons?.map((p, i) => (
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
                  <Star size={14} className="text-[#D4AF37]" /> Rakiplerine Göre Analiz {currentCar.competitor_analysis?.competitors ? `(${currentCar.competitor_analysis.competitors.join(', ')})` : ''}
                </div>
                <div className="relative z-10 space-y-6">
                  {(currentCar.competitor_analysis?.text || 'Rakip analizi bulunamadı.').split('\n\n').map((paragraph, idx) => (
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
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {(() => {
                  const imgs = currentCar.images || [];
                  if (!Array.isArray(imgs) || imgs.length === 0) return <div className="text-sm font-bold text-black/50 col-span-full">Görsel bulunamadı.</div>;
                  
                  return imgs.map((imgSrc, idx) => (
                    <div key={idx} onClick={() => openLightbox(imgs, idx)} className="bg-white p-2 rounded-2xl shadow-embossed group cursor-pointer">
                      <div className="rounded-xl overflow-hidden relative">
                        <img src={imgSrc} alt={`Araç Görseli ${idx + 1}`} className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white font-bold tracking-widest text-xs uppercase text-center p-2">
                          <Maximize className="mb-2" size={24} />
                          Büyüt
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 mb-12">
                <a href={currentCar.url} target="_blank" rel="noopener noreferrer" className="bg-[#FFCC00] text-black px-10 py-5 rounded-full font-bold tracking-widest text-xs uppercase hover:scale-105 transition-all duration-300 shadow-xl shadow-[#FFCC00]/20 flex items-center justify-center gap-3">
                  İlan Linkine Git <ArrowRight size={18} />
                </a>
              </div>

              {/* Ekspertiz Haritası */}
              <DamageMap damageMap={currentCar.damage_map} />

              {/* Görsel AI Notları */}
              {(currentCar.vision_report || (currentCar.defects && currentCar.defects.length > 0)) && (
                <div className="bg-white rounded-[2rem] border border-black/5 shadow-embossed p-8 mb-12">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase mb-4 flex items-center gap-2">
                    <AlertCircle size={14} /> AI Görsel Ekspertiz Raporu
                  </h4>
                  <p className="text-sm md:text-base font-bold leading-loose text-black/80 mb-6">
                    {currentCar.vision_report}
                  </p>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <div className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase mb-3">Tespit Edilen Kusurlar</div>
                      <ul className="space-y-2">
                        {currentCar.defects?.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm font-bold text-black/70">
                            <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" /> {d}
                          </li>
                        )) || <li className="text-sm font-bold text-black/50">-</li>}
                      </ul>
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-bold tracking-[0.2em] text-green-600 uppercase mb-3">Olumlu Yanlar</div>
                      <ul className="space-y-2">
                        {currentCar.positives?.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm font-bold text-black/70">
                            <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> {p}
                          </li>
                        )) || <li className="text-sm font-bold text-black/50">-</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : null}
      </div>

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
