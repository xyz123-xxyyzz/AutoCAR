import DashboardLayout from '../layouts/DashboardLayout';
import { ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function KullaniciDashboard() {
  const navigate = useNavigate();
  localStorage.setItem('userRole', 'Kullanıcı');

  return (
    <DashboardLayout subscriptionType="Kullanıcı" userName="Müşteri" credits={15}>
      <header className="mb-24 text-center">
        <h1 className="text-7xl md:text-8xl font-display font-black tracking-tighter mb-6 text-black uppercase">
          Kullanıcı
        </h1>
        <p className="text-black/50 font-bold tracking-[0.2em] uppercase text-xs">Aracınızı analiz etmek için hazırsınız</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] p-12 shadow-embossed border border-black/5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#FFCC00]"></div>
          
          <div className="flex justify-center mb-6">
             <Zap size={64} className="text-[#FFCC00]" />
          </div>

          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight text-black mb-6 uppercase">
            AutoCAR VIP Sistemine <br/><span className="text-black/30">Hoş Geldiniz</span>
          </h2>
          
          <p className="text-sm md:text-base font-bold text-black/60 leading-relaxed max-w-2xl mx-auto mb-10">
            Yapay zeka destekli analiz asistanınız kullanıma hazır. Sahibinden veya Arabam.com'a girerek ilan detay sayfasındayken sağ üstteki AutoCAR eklenti simgesine tıklayın ve analizleri başlatın.
          </p>

          <div className="bg-[#F5F5F7] rounded-3xl p-8 shadow-inner-embossed flex flex-col md:flex-row items-center justify-between gap-6 text-left">
            <div>
              <div className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase mb-2">Başlangıç Rehberi</div>
              <h3 className="text-xl font-black tracking-tight text-black">Uzantıyı Tarayıcınıza Eklediniz mi?</h3>
            </div>
            <button 
              onClick={() => window.open('https://www.sahibinden.com', '_blank')}
              className="group flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full shadow-embossed hover:scale-105 transition-all duration-300"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Sahibinden.com'a Git</span>
              <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
