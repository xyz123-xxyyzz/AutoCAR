import { Link } from 'react-router-dom';
import { ArrowRight, Zap, CheckCircle, Star, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black overflow-hidden font-sans selection:bg-black selection:text-white">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-[#F5F5F7] to-transparent pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-10 py-8">
        <div className="font-display font-black text-2xl tracking-[0.2em] uppercase">AutoCAR</div>
        
        <div className="flex items-center gap-6">
          <Link to="/login" className="px-8 py-4 bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-full hover:bg-black/80 transition-colors shadow-embossed hover:shadow-embossed-hover">
            Giriş Yap / Kaydol
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#F5F5F7] rounded-full mb-10 shadow-embossed border border-white/50">
          <Star size={16} className="text-black" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Gemini AI Destekli</span>
        </div>

        <h1 className="text-7xl md:text-9xl font-display font-black tracking-tighter leading-[0.9] mb-8">
          GELECEĞİN <br/>
          OTOMOBİL <br/>
          ANALİZİ.
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl font-bold tracking-wide text-black/50 mb-16 leading-relaxed">
          İlan sitelerindeki araçları saniyeler içinde analiz edin. Gizli kusurları bulun, fiyat-performans indeksini öğrenin ve en karlı yatırımı yapın.
        </p>

        <Link to="/login" className="group px-12 py-6 bg-white border border-white rounded-full flex items-center gap-6 shadow-embossed hover:shadow-embossed-hover transition-all duration-500 hover:-translate-y-2">
          <span className="text-xs font-bold tracking-[0.2em] uppercase">Sistemi Keşfet</span>
          <div className="w-10 h-10 bg-[#F5F5F7] shadow-inner-embossed rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
            <ArrowRight size={18} strokeWidth={2} />
          </div>
        </Link>
      </main>

      {/* Features Showcase */}
      <section className="relative z-10 py-32 px-6 bg-white shadow-[0_-30px_60px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="bg-white p-12 rounded-[3rem] shadow-embossed border border-white">
              <div className="w-16 h-16 bg-white shadow-embossed rounded-full flex items-center justify-center mb-8 border border-white">
                <Zap size={24} strokeWidth={2} className="text-black" />
              </div>
              <h3 className="text-2xl font-display font-black tracking-tight mb-4">Anında Analiz</h3>
              <p className="text-sm font-bold text-black/50 tracking-wide leading-relaxed">
                Eklentimiz sayesinde sahibinden veya arabam.com üzerindeki herhangi bir ilanı tek tıkla okuyun ve derinlemesine inceleyin.
              </p>
            </div>

            <div className="bg-white p-12 rounded-[3rem] shadow-embossed border border-white">
              <div className="w-16 h-16 bg-white shadow-embossed rounded-full flex items-center justify-center mb-8 border border-white">
                <TrendingUp size={24} strokeWidth={2} className="text-black" />
              </div>
              <h3 className="text-2xl font-display font-black tracking-tight mb-4">Fiyat Endeksi</h3>
              <p className="text-sm font-bold text-black/50 tracking-wide leading-relaxed">
                Aracın istenen fiyatının piyasa koşullarına göre şişirilip şişirilmediğini net bir skor ile görün.
              </p>
            </div>

            <div className="bg-white p-12 rounded-[3rem] shadow-embossed border border-white">
              <div className="w-16 h-16 bg-white shadow-embossed rounded-full flex items-center justify-center mb-8 border border-white">
                <CheckCircle size={24} strokeWidth={2} className="text-black" />
              </div>
              <h3 className="text-2xl font-display font-black tracking-tight mb-4">Gizli Kusurlar</h3>
              <p className="text-sm font-bold text-black/50 tracking-wide leading-relaxed">
                İlan açıklamalarındaki satır aralarını okuyan yapay zeka, potansiyel sorunları (tramer uyumsuzluğu, ekspertiz farkları) önceden tespit eder.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
