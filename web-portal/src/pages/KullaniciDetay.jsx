import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Star, Clock, Car, PlusCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function KullaniciDetay() {
  const role = localStorage.getItem('userRole') || 'Sahip';
  const navigate = useNavigate();

  // Mock user data
  const user = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    type: 'Premium',
    joinDate: '15.05.2026'
  };

  const userHistory = [
    { type: 'Analiz', date: 'Bugün, 14:30', detail: 'BMW 320i M Sport Analizi', icon: Car, score: 92, id: 1 },
    { type: 'Yükleme', date: 'Bugün, 10:00', detail: '+100 Kredi Yüklendi', icon: PlusCircle, id: 2 },
    { type: 'Analiz', date: 'Dün, 16:45', detail: 'Mercedes C200d AMG Analizi', icon: Car, score: 88, id: 3 },
  ];

  return (
    <DashboardLayout subscriptionType={role} userName="Yönetici" credits="999.999">
      
      {/* Top Bar with Back Button */}
      <div className="mb-12 flex items-center justify-between">
        <button 
          onClick={() => navigate('/kullanicilar')}
          className="flex items-center gap-3 px-6 py-3 bg-white border border-black/5 rounded-full shadow-embossed hover:shadow-embossed-hover transition-all duration-300 group"
        >
          <div className="w-8 h-8 bg-[#F5F5F7] rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Geri Dön</span>
        </button>
      </div>

      {/* User Profile Header */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-embossed border border-white mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col">
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-black mb-2">{user.name}</h1>
          <div className="flex items-center gap-2 text-black/50 font-bold text-xs uppercase tracking-widest">
            <Mail size={12} /> {user.email}
          </div>
        </div>

        <div className="px-6 py-3 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-inner-embossed flex items-center gap-2 bg-[#F5F5F7] text-black">
          {user.type === 'Premium' && <Star size={12} className="text-[#D4AF37]" />}
          {user.type}
        </div>
      </div>

      {/* User History */}
      <div>
        <div className="flex items-center gap-4 mb-8 px-4">
          <Clock className="text-black" size={20} strokeWidth={2} />
          <h2 className="text-sm font-display font-black tracking-[0.2em] text-black uppercase">Kullanıcı Geçmişi</h2>
        </div>

        <div className="space-y-4">
          {userHistory.map(islem => (
            <div 
              key={islem.id} 
              className="group p-8 bg-white border border-black/5 rounded-[2rem] flex flex-col md:flex-row justify-between md:items-center shadow-embossed hover:shadow-embossed-hover transition-all duration-500"
            >
              <div className="flex items-center gap-6 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center shadow-inner-embossed group-hover:scale-110 transition-transform">
                  <islem.icon size={20} className="text-black" />
                </div>
                <div>
                  <div className="font-display font-black tracking-tight text-xl text-black mb-1">{islem.detail}</div>
                  <div className="text-[10px] text-black/40 font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                    <Clock size={10} /> {islem.date}
                  </div>
                </div>
              </div>
              
              {islem.type === 'Analiz' && (
                <div className="flex items-center gap-6">
                  <span className="text-[10px] text-black/30 font-bold uppercase tracking-[0.2em]">Puan</span>
                  <div className="text-5xl font-display font-black text-black tracking-tighter">{islem.score}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </DashboardLayout>
  );
}
