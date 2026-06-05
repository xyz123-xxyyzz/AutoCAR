import DashboardLayout from '../layouts/DashboardLayout';
import { Download, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SatinAlanDashboard() {
  const navigate = useNavigate();
  localStorage.setItem('userRole', 'Premium');
  
  const analyses = [
    { title: 'BMW 320i M Sport', date: 'Bugün, 14:30', score: 92 },
    { title: 'Mercedes C200d AMG', date: 'Bugün, 11:15', score: 88 },
  ];

  return (
    <DashboardLayout subscriptionType="Premium" userName="VIP" credits="15.400">
      <header className="mb-24 text-center">
        <h1 className="text-7xl md:text-8xl font-display font-black tracking-tighter mb-6 text-black uppercase">
          Premium
        </h1>
        <p className="text-black/50 font-bold tracking-[0.2em] uppercase text-xs">Daha uygun fiyatlı analiz kredilerinizle sınırları kaldırın.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[2rem] border border-black/5 shadow-embossed group hover:shadow-embossed-hover transition-all duration-500 text-center">
            <div className="mx-auto w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-8 group-hover:scale-110 shadow-inner transition-transform duration-500">
              <Download className="text-black" size={24} strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-display font-black tracking-tight text-black mb-4 uppercase">Eklenti</h2>
            <p className="text-xs text-black/50 mb-10 font-bold tracking-widest leading-relaxed uppercase">
              AutoCAR analizlerini doğrudan ilan sitelerinde başlatın.
            </p>
            <div className="flex flex-col gap-3">
              <a 
                href="/autocar.xpi" 
                className="w-full py-5 bg-black text-white font-display font-black tracking-[0.2em] text-[10px] uppercase rounded-full hover:bg-black/80 transition-colors flex items-center justify-center gap-3 shadow-embossed"
              >
                Firefox'a Ekle <ArrowRight size={14} strokeWidth={3} />
              </a>
              <button 
                onClick={() => navigate('/ayarlar')}
                className="w-full py-5 bg-[#F5F5F7] text-black font-display font-black tracking-[0.2em] text-[10px] uppercase rounded-full hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-3 shadow-inner-embossed"
              >
                Kurulum Kılavuzu <ArrowRight size={14} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8 px-4">
              <Clock className="text-black" size={20} strokeWidth={2} />
              <h2 className="text-sm font-display font-black tracking-[0.2em] text-black uppercase">Geçmiş Analizler</h2>
            </div>
            
            <div className="space-y-4 flex-1">
              {analyses.map((a, i) => (
                <div key={i} className="group p-8 bg-white border border-black/5 rounded-[2rem] flex flex-col md:flex-row justify-between md:items-center shadow-embossed hover:shadow-embossed-hover transition-all duration-500 cursor-pointer">
                  <div className="mb-4 md:mb-0">
                    <div className="font-display font-black tracking-tight text-xl text-black mb-2">{a.title}</div>
                    <div className="text-[10px] text-black/40 font-bold tracking-[0.2em] uppercase">{a.date}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em]">VIP Puan</span>
                    <div className="text-5xl font-display font-black text-black tracking-tighter">{a.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
