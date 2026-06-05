import { Link } from 'react-router-dom';
import { ArrowRight, Zap, CheckCircle, Star, TrendingUp, Shield, Gauge, Maximize, MousePointerClick, Cpu, LineChart, AlertCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black overflow-hidden font-sans selection:bg-black selection:text-white">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-[#F5F5F7] to-transparent pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <div className="font-display font-black text-2xl tracking-[0.2em] uppercase flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg shadow-embossed">
            A
          </div>
          AutoCAR
        </div>
        
        <div className="flex items-center gap-6">
          <Link to="/login" className="px-8 py-4 bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-full hover:bg-black/80 transition-colors shadow-embossed hover:shadow-embossed-hover">
            Giriş Yap / Kaydol
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-16 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full mb-10 shadow-embossed border border-black/5 animate-slide-in">
          <Star size={16} className="text-[#D4AF37]" fill="#D4AF37" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Dünyanın İlk Yapay Zeka Destekli Araç Analiz Sistemi</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-[0.9] mb-8 text-black drop-shadow-sm">
          GELECEĞİN <br/>
          OTOMOBİL <br/>
          ANALİZİ.
        </h1>
        
        <p className="max-w-3xl text-base md:text-xl font-bold tracking-wide text-black/50 mb-12 leading-relaxed">
          İkinci el araç alım satımında devrim yaratıyoruz. Farklı ilan sitelerindeki araçları tek tıkla yapay zeka havuzunuza atın; sistem gizli kusurları bulsun, fiyatın şişirme olup olmadığını analiz etsin ve size en karlı yatırımı söylesin.
        </p>

        {/* Membership Info Alert */}
        <div className="bg-black text-white p-6 md:p-8 rounded-[2rem] mb-12 max-w-2xl shadow-embossed border border-red-500/30 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full text-red-500 text-[10px] font-bold tracking-widest uppercase mb-4 border border-red-500/20">
            <AlertCircle size={14} /> DİKKAT: Kapalı Devre B2B Sistem
          </div>
          <p className="text-xs md:text-sm text-white/70 font-bold leading-relaxed mb-6">
            AutoCAR, kurumsal galeri ve al-sat uzmanları için geliştirilmiş kapalı devre bir sistemdir. Sisteme dahil olmak ve premium paketlerimiz hakkında bilgi almak için lütfen bizimle iletişime geçin.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => document.getElementById('iletisim')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase rounded-full hover:bg-gray-200 transition-colors shadow-embossed cursor-pointer"
            >
              İletişime Geçin
            </button>
            <Link to="/login" className="px-8 py-4 bg-transparent border border-white/20 text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-full hover:bg-white/10 transition-colors">
              Müşteri Girişi
            </Link>
          </div>
        </div>
        
      </main>

      {/* Supported Platforms Section */}
      <section className="py-12 border-y border-black/5 bg-white/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40 text-center mb-8">TAM ENTEGRE ÇALIŞTIĞI PLATFORMLAR</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-xl md:text-2xl font-display font-black tracking-tight">sahibinden.com</div>
            <div className="text-xl md:text-2xl font-display font-black tracking-tight">arabam.com</div>
            <div className="text-xl md:text-2xl font-display font-black tracking-tight">letgo otoplus</div>
            <div className="text-xl md:text-2xl font-display font-black tracking-tight">vavacars</div>
            <div className="text-xl md:text-2xl font-display font-black tracking-tight">carmudi</div>
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="relative z-10 py-24 px-6 bg-[#F5F5F7] shadow-inner-embossed">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full mb-8 shadow-embossed border border-black/5">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-red-600">Sistemi Canlı İzleyin</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-12">Yapay Zeka Nasıl Çalışır?</h2>
          
          <div className="relative w-full aspect-video bg-black rounded-[2rem] shadow-embossed overflow-hidden border-8 border-white group cursor-pointer">
            {/* Placeholder Image/Video Cover */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2070')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center">
              {/* Play Button */}
              <div className="w-24 h-24 bg-[#FFCC00] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,204,0,0.5)] group-hover:scale-110 transition-transform duration-300">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="black"><path d="M8 5v14l11-7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <div className="absolute bottom-6 left-8 text-left">
              <div className="text-white font-display font-black text-2xl tracking-tight drop-shadow-md">AutoCAR Kullanım Rehberi</div>
              <div className="text-white/80 font-bold text-sm">5 saniyede ilan analizi nasıl yapılır?</div>
            </div>
          </div>
          <p className="mt-8 text-black/50 font-bold text-sm tracking-wide">*(Bu alana yakında sizin çekeceğiniz tanıtım videosu eklenecektir.)*</p>
        </div>
      </section>

      {/* What is AutoCAR AI? (Features) */}
      <section className="relative z-10 py-32 px-6 bg-white shadow-[0_-30px_60px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-6">AutoCAR AI Ne Yapar?</h2>
            <p className="text-lg font-bold text-black/50 max-w-2xl mx-auto">
              Sıradan bir ekspertiz raporunun ötesine geçerek piyasa dinamiklerini, finansal verileri ve araç kondisyonunu tek bir potada eritir.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#F5F5F7] p-10 rounded-[3rem] shadow-inner-embossed flex flex-col items-center text-center group hover:bg-black hover:text-white transition-colors duration-500">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 shadow-embossed group-hover:bg-[#333] transition-colors duration-500">
                <Cpu size={32} className="text-black group-hover:text-[#D4AF37] transition-colors" />
              </div>
              <h3 className="text-2xl font-display font-black tracking-tight mb-4">Çoklu Araç Kıyaslama</h3>
              <p className="text-sm font-bold opacity-60 leading-relaxed">
                Birbiriyle alakasız sekmelerdeki 5 farklı ilanı bile saniyeler içinde yan yana getirir. Motor güçlerinden tutun, bagaj hacimlerine kadar tüm teknik verileri tek bir tabloda kıyaslar.
              </p>
            </div>

            <div className="bg-[#F5F5F7] p-10 rounded-[3rem] shadow-inner-embossed flex flex-col items-center text-center group hover:bg-black hover:text-white transition-colors duration-500">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 shadow-embossed group-hover:bg-[#333] transition-colors duration-500">
                <TrendingUp size={32} className="text-black group-hover:text-green-400 transition-colors" />
              </div>
              <h3 className="text-2xl font-display font-black tracking-tight mb-4">Piyasa Değeri & Satılma Hızı</h3>
              <p className="text-sm font-bold opacity-60 leading-relaxed">
                İlandaki fiyatın o anki piyasa şartlarına göre pahalı mı ucuz mu olduğunu anlar. Dahası, o model bir aracın ortalama kaç gün içinde nakite çevrilebileceğinin (likidite) skorunu verir.
              </p>
            </div>

            <div className="bg-[#F5F5F7] p-10 rounded-[3rem] shadow-inner-embossed flex flex-col items-center text-center group hover:bg-black hover:text-white transition-colors duration-500">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 shadow-embossed group-hover:bg-[#333] transition-colors duration-500">
                <Shield size={32} className="text-black group-hover:text-red-400 transition-colors" />
              </div>
              <h3 className="text-2xl font-display font-black tracking-tight mb-4">Veriye Dayalı Rasyonalite</h3>
              <p className="text-sm font-bold opacity-60 leading-relaxed">
                İlan açıklamalarındaki kelime oyunlarına takılmaz. Büyük veriyi okur, şeffaf skorlamalar yapar ve sadece finansal olarak en kârlı/uygun araca yatırım yapmanızı sağlar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Steps) */}
      <section className="py-32 px-6 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
          <Zap size={400} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full mb-6">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80">Kullanımı Çok Kolay</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter">Süreç Nasıl İşliyor?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[2px] bg-white/10 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-black border-4 border-[#333] rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <span className="text-3xl font-display font-black text-white">1</span>
              </div>
              <h3 className="text-xl font-display font-black mb-4">Eklentiyi Kurun</h3>
              <p className="text-sm text-black/60 font-medium leading-relaxed mt-2">
                Firefox eklentisini sitemizden tek tıkla tarayıcınıza ekleyin ve üyeliğinizle giriş yapın.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-black border-4 border-[#333] rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <span className="text-3xl font-display font-black text-white">2</span>
              </div>
              <h3 className="text-xl font-display font-black mb-4">İlanları Gezin</h3>
              <p className="text-sm font-bold text-white/60 leading-relaxed max-w-xs">
                Herhangi bir araç ilan sitesine girin. İlanın yanında beliren sihirli "AutoCAR ile Analiz Et" butonuna tıklayarak aracı havuza ekleyin.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-black border-4 border-[#D4AF37] rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                <span className="text-3xl font-display font-black text-[#D4AF37]">3</span>
              </div>
              <h3 className="text-xl font-display font-black mb-4 text-[#D4AF37]">Raporu Alın</h3>
              <p className="text-sm font-bold text-white/60 leading-relaxed max-w-xs">
                Panele dönün ve eklediğiniz araçların matematiksel olarak nasıl sıralandığını, kimin kazandığını kusursuz bir raporla görün.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Examples Section */}
      <section className="py-32 px-6 bg-[#F0F2F5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-6">Mükemmel Analiz Çıktıları</h2>
            <p className="text-lg font-bold text-black/50 max-w-2xl mx-auto">
              Yapay Zeka raporları size düz metin okutmaz. Finansal özetleri görselleştirir ve fiyatı gerçekten uygun olanı podyuma çıkarır.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mockup Card 1 */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-embossed border border-black/5 transform hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
              <div className="flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] rounded-full text-[10px] font-bold tracking-widest uppercase">
                  <LineChart size={14} className="text-green-500"/> Fiyat/Performans
                </div>
                <div className="text-[10px] font-bold tracking-widest text-black/30">ÖRNEK RAPOR</div>
              </div>
              <h3 className="text-2xl font-display font-black tracking-tight mb-4">Mercedes vs BMW Kıyaslaması</h3>
              <p className="text-sm font-bold text-black/60 mb-8 leading-relaxed">
                Algoritma, Mercedes C200'ün 204 beygirlik motoru ve hatasız kondisyonuyla BMW 320i'yi nasıl geride bıraktığını matematiksel olarak kanıtlar.
              </p>
              
              <div className="flex gap-4">
                <div className="flex-1 h-32 bg-gray-100 rounded-2xl overflow-hidden relative">
                  <img src="https://placehold.co/400x300/111/fff?text=MERCEDES" alt="MERCEDES" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                    <span className="text-white font-bold text-xs uppercase tracking-widest">Skor: 92</span>
                  </div>
                </div>
                <div className="flex-1 h-32 bg-gray-100 rounded-2xl overflow-hidden relative">
                  <img src="https://placehold.co/400x300/222/fff?text=BMW" alt="BMW" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                    <span className="text-white font-bold text-xs uppercase tracking-widest">Skor: 88</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup Card 2 */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-embossed border border-black/5 transform hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
              <div className="flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] rounded-full text-[10px] font-bold tracking-widest uppercase">
                  <AlertCircle size={14} className="text-red-500"/> Risk Analizi
                </div>
                <div className="text-[10px] font-bold tracking-widest text-black/30">ÖRNEK TESPİT</div>
              </div>
              <h3 className="text-2xl font-display font-black tracking-tight mb-4">Büyük Veri ile Şeffaflık</h3>
              <p className="text-sm font-bold text-black/60 mb-8 leading-relaxed">
                Araçların fiyatı ve teknik özelliklerinden yola çıkarak satılma hızını matematiksel formüllere döker ve sizi riskli ilanlardan uzak tutar.
              </p>
              
              <div className="bg-[#F5F5F7] p-6 rounded-2xl border-l-4 border-red-500 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5 p-4"><AlertCircle size={64}/></div>
                <div className="text-[10px] font-bold tracking-widest text-red-500 uppercase mb-2">Yapay Zeka Uyarısı</div>
                <div className="text-sm font-bold text-black/80">Bu aracın donanım paketindeki eksiklikler sebebiyle piyasada satılma hızı ortalamanın altındadır.</div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex justify-center">
            <Link to="/login" className="px-10 py-5 bg-black text-white text-xs font-bold tracking-[0.2em] uppercase rounded-full hover:bg-black/80 transition-all duration-300 shadow-2xl hover:scale-105 flex items-center gap-4">
              <MousePointerClick size={16} /> Kullanıcı Paneline Git
            </Link>
          </div>

        </div>
      </section>

      {/* Footer / Contact Section */}
      <footer id="iletisim" className="bg-[#111] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="lg:col-span-2">
            <div className="font-display font-black text-2xl tracking-[0.2em] uppercase flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg">A</div>
              AutoCAR
            </div>
            <p className="text-white/50 text-sm font-bold leading-relaxed max-w-sm">
              İkinci el araç alım satımında devrim yaratan, işletmelere özel otonom tarayıcı asistanı ve B2B SaaS platformu.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-display font-black tracking-widest uppercase text-white/40 mb-6">İletişim Bilgileri</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/80 font-bold text-sm">
                <span>📞</span> Telefon: 0541 186 95 13
              </li>
              <li className="flex items-center gap-3 text-white/80 font-bold text-sm">
                <span>✉️</span> E-posta: kagulle31@gmail.com
              </li>
              <li className="flex items-center gap-3 text-white/80 font-bold text-sm">
                <span>📍</span> Adres: Kocaeli / Darıca
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-display font-black tracking-widest uppercase text-white/40 mb-6">Hızlı Destek</h4>
            <a 
              href="https://wa.me/905411869513" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-[#25D366] text-white rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform"
            >
              <span>📱</span> WhatsApp ile İletişime Geç
            </a>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-xs font-bold text-white/30 tracking-widest uppercase">
          <p>© {new Date().getFullYear()} AutoCAR AI Technologies.</p>
          <p className="mt-4 md:mt-0">Şeffaf, faturalı ve yasal ticari altyapı güvencesiyle.</p>
        </div>
      </footer>

    </div>
  );
}
