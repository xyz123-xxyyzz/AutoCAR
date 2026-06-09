import { Link } from 'react-router-dom';
import { ArrowRight, Zap, CheckCircle, Star, TrendingUp, Shield, Gauge, Maximize, MousePointerClick, Cpu, LineChart, AlertCircle, Users, Activity, BarChart3, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black overflow-hidden font-sans selection:bg-black selection:text-white">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-200 via-[#F0F2F5] to-[#F0F2F5] pointer-events-none"></div>

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
            Müşteri Girişi
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-16 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full mb-10 shadow-embossed border border-black/5 animate-slide-in">
          <Star size={16} className="text-[#D4AF37]" fill="#D4AF37" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Galericiler ve Al-Sat Uzmanları İçin Geliştirildi</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-[0.9] mb-8 text-black drop-shadow-sm">
          PİYASANIN <br/>
          RÖNTGENİNİ <br/>
          ÇEKİN.
        </h1>
        
        <p className="max-w-3xl text-base md:text-xl font-bold tracking-wide text-black/50 mb-12 leading-relaxed">
          Türkiye'nin ilk ve tek "Büyük Veri" destekli otonom araç analiz asistanı. İlan sitelerindeki binlerce aracı saniyeler içinde tarayın, fiyat/performans hesaplamasını yapın ve Master AI'ın sizin için seçtiği en kârlı "İlk 10" araca yatırım yapın.
        </p>

        {/* Hero Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mb-16 w-full">
          <div className="bg-white p-6 rounded-3xl shadow-embossed flex flex-col items-center">
            <div className="text-3xl font-display font-black tracking-tighter mb-1">1000+</div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40">Tek Seferde Tarama</div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-embossed flex flex-col items-center">
            <div className="text-3xl font-display font-black tracking-tighter mb-1">15-20 Dk</div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40">Ortalama Analiz Süresi</div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-embossed flex flex-col items-center">
            <div className="text-3xl font-display font-black tracking-tighter mb-1 text-[#32D74B]">%100</div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40">Ban Koruması</div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-embossed flex flex-col items-center">
            <div className="text-3xl font-display font-black tracking-tighter mb-1 text-[#D4AF37]">Top 10</div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40">Rafine Edilmiş Liste</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => document.getElementById('iletisim')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-5 bg-black text-white text-[12px] font-bold tracking-[0.2em] uppercase rounded-full hover:bg-black/80 transition-all duration-300 shadow-2xl hover:scale-105 flex items-center gap-4"
          >
            Kurumsal Demo Talep Et <ArrowRight size={16} />
          </button>
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
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-12">Büyük Veri Nasıl Çalışır?</h2>
          
          <div className="w-full max-w-4xl mx-auto mb-8 flex flex-col items-center">
            <div className="w-full rounded-[2rem] overflow-hidden shadow-embossed border-8 border-white mb-6 bg-black relative">
              {/* VIDEO PLACEHOLDER (Do not remove this video tag) */}
              <video 
                controls 
                className="w-full h-auto aspect-video object-cover"
                poster=""
              >
                <source src="/autocar-tanitim.mp4" type="video/mp4" />
                Tarayıcınız video etiketini desteklemiyor.
              </video>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-embossed border border-black/5 w-full">
              <p className="text-sm md:text-base text-black/70 font-bold leading-relaxed text-center">
                Bir araç arama sayfasındaki 1000 ilanı tek tek incelemek, ekspertizlerine bakıp fiyat/performans hesabı yapmak saatlerinizi ve günlerinizi alır. <br/>
                <span className="text-black font-black">AutoCAR Yapay Zeka Sistemi</span> ile ilanların güvenlik sınırlarına takılmadan eş zamanlı çekilip, kötülerin elenmesi ve sadece en kârlı 'İlk 10' aracın masanıza gelmesi <span className="text-green-600 font-black">sadece 15-20 dakika</span> sürüyor!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Overview */}
      <section className="relative z-10 py-32 px-6 bg-white shadow-[0_-30px_60px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#F5F5F7] rounded-full mb-6">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-black">Neden AutoCAR?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-6">Rakiplerinizin Göremediğini Görün</h2>
            <p className="text-lg font-bold text-black/50 max-w-2xl mx-auto">
              Sadece hasar durumuna bakan standart yazılımları unutun. AutoCAR, finansal bir algoritmadır. Bir aracın ne kadar sürede satılabileceğini ve gerçek piyasa değerini hesaplar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#F5F5F7] p-8 rounded-[2.5rem] shadow-inner-embossed flex flex-col items-start group hover:bg-black hover:text-white transition-colors duration-500">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 shadow-embossed group-hover:bg-[#333] transition-colors duration-500">
                <Cpu size={24} className="text-black group-hover:text-[#D4AF37] transition-colors" />
              </div>
              <h3 className="text-xl font-display font-black tracking-tight mb-3">Hayalet Tarayıcı</h3>
              <p className="text-xs font-bold opacity-60 leading-relaxed">
                İlan sitelerinin bot korumalarına yakalanmadan, "Derin Tarama" modülü ile yüzlerce ilanı asenkron sekmelerde paralel olarak çeker. Hesabınız %100 güvendedir.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F5F5F7] p-8 rounded-[2.5rem] shadow-inner-embossed flex flex-col items-start group hover:bg-black hover:text-white transition-colors duration-500">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 shadow-embossed group-hover:bg-[#333] transition-colors duration-500">
                <Activity size={24} className="text-black group-hover:text-blue-400 transition-colors" />
              </div>
              <h3 className="text-xl font-display font-black tracking-tight mb-3">100'lü AI Paketleme</h3>
              <p className="text-xs font-bold opacity-60 leading-relaxed">
                OpenAI API limitlerine çarpmadan, toplanan verileri yüzerlik (100) paketler halinde gönderir. Dakikada yüzlerce aracı analiz eder ve maliyeti dibe çeker.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F5F5F7] p-8 rounded-[2.5rem] shadow-inner-embossed flex flex-col items-start group hover:bg-black hover:text-white transition-colors duration-500">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 shadow-embossed group-hover:bg-[#333] transition-colors duration-500">
                <LineChart size={24} className="text-black group-hover:text-green-400 transition-colors" />
              </div>
              <h3 className="text-xl font-display font-black tracking-tight mb-3">Piyasa Skorlaması</h3>
              <p className="text-xs font-bold opacity-60 leading-relaxed">
                Her ilana "Satılma Hızı", "Fiyat/Performans", "Araç Kondisyonu" gibi metriklerle 100 üzerinden şeffaf ve matematiksel puanlar verir.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#F5F5F7] p-8 rounded-[2.5rem] shadow-inner-embossed flex flex-col items-start group hover:bg-black hover:text-white transition-colors duration-500">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 shadow-embossed group-hover:bg-[#333] transition-colors duration-500">
                <Star size={24} className="text-black group-hover:text-[#D4AF37] transition-colors" />
              </div>
              <h3 className="text-xl font-display font-black tracking-tight mb-3">Master AI Top 10</h3>
              <p className="text-xs font-bold opacity-60 leading-relaxed">
                Yorulmadan karar verin. Sistem tüm piyasayı eledikten sonra sadece yatırım yapılmaya değer en iyi İlk 10 Aracı satış-odaklı özetlerle önünüze dizer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Examples / Output Section */}
      <section className="py-32 px-6 bg-[#F0F2F5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-6">Mükemmel Analiz Çıktıları</h2>
            <p className="text-lg font-bold text-black/50 max-w-2xl mx-auto">
              AutoCAR, size düz metinler okutmaz. En çok kazandıracak araçları doğrudan yüzdelik skorlar ve rekabet analizleriyle sunar.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mockup Card 1: Top 10 List */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-embossed border border-black/5 transform hover:scale-[1.02] transition-transform duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] rounded-full text-[10px] font-bold tracking-widest uppercase">
                  <Star size={14} className="text-[#D4AF37]" fill="#D4AF37"/> Top 10 Karar Sistemi
                </div>
              </div>
              <h3 className="text-2xl font-display font-black tracking-tight mb-4">Gereksiz İlanları Eler</h3>
              <p className="text-sm font-bold text-black/60 mb-8 leading-relaxed">
                778 ilanın tamamını inceleyen Yapay Zeka, size yorucu bir liste sunmak yerine puanı düşük ilanları atar ve zirvedeki 10 aracı listeler.
              </p>
              
              <div className="bg-[#F5F5F7] p-6 rounded-2xl border-l-4 border-[#32D74B] relative overflow-hidden flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-display font-black text-2xl shadow-lg">1</div>
                  <div className="flex-1">
                    <h4 className="font-black text-lg text-black">Volkswagen Passat 2015</h4>
                    <p className="text-xs font-bold text-black/50">Skor: <span className="text-[#32D74B] text-lg">94</span></p>
                  </div>
                </div>
                <p className="text-xs font-bold text-black/70 italic border-l-2 border-[#D4AF37] pl-3">
                  "Düşük kilometresi ve temiz ekspertizi ile fiyatının çok üzerinde bir performans. Hızlı satılma potansiyeli yüksek."
                </p>
              </div>
            </div>

            {/* Mockup Card 2: Risk and Spec Analysis */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-embossed border border-black/5 transform hover:scale-[1.02] transition-transform duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] rounded-full text-[10px] font-bold tracking-widest uppercase">
                  <AlertCircle size={14} className="text-red-500"/> Yapay Zeka Ekspertizi
                </div>
              </div>
              <h3 className="text-2xl font-display font-black tracking-tight mb-4">Açıklamalardaki Yalanları Yakalar</h3>
              <p className="text-sm font-bold text-black/60 mb-8 leading-relaxed">
                Satıcının "Tertemiz, Çizik Yok" yazdığı ilan açıklamasını okur, ancak teknik veri tablosundaki tramer/değişen bilgileriyle eşleşmiyorsa sizi derhal uyarır.
              </p>
              
              <div className="bg-[#F5F5F7] p-6 rounded-2xl border-l-4 border-red-500 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5 p-4"><AlertCircle size={64}/></div>
                <div className="text-[10px] font-bold tracking-widest text-red-500 uppercase mb-2">Güvenlik Uyarısı</div>
                <div className="text-sm font-bold text-black/80 mb-2">Bu aracın açıklamasında hatasız olduğu belirtilmiş ancak hasar sorgusunda 2 değişen görünmektedir. Fiyat/Performans skoru bu sebeple düşürülmüştür.</div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Footer / Contact Section */}
      <footer id="iletisim" className="bg-[#111] text-white py-16 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="lg:col-span-2">
            <div className="font-display font-black text-2xl tracking-[0.2em] uppercase flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg">A</div>
              AutoCAR
            </div>
            <p className="text-white/50 text-sm font-bold leading-relaxed max-w-sm">
              İkinci el araç alım satımında devrim yaratan, işletmelere özel Büyük Veri tarayıcı asistanı ve B2B SaaS platformu.
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
            <h4 className="text-sm font-display font-black tracking-widest uppercase text-white/40 mb-6">Hızlı Başvuru</h4>
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
