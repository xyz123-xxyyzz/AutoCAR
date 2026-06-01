import { useState } from 'react';
import { Users, Bell, Edit3, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function SahipDashboard() {
  // Save role to persist across shared pages
  localStorage.setItem('userRole', 'Sahip');

  const [note, setNote] = useState('');

  const notifications = [
    { id: 1, text: 'Yeni Premium kullanıcı kaydoldu: ahmet.yilmaz@gmail.com', time: '5 dk önce', type: 'success' },
    { id: 2, text: 'Sistem API limitleri %80 seviyesine ulaştı.', time: '1 saat önce', type: 'warning' },
    { id: 3, text: 'Mehmet Demir 50 Kredi satın aldı.', time: '2 saat önce', type: 'success' },
    { id: 4, text: 'Aylık veritabanı yedeği başarıyla alındı.', time: 'Dün', type: 'info' }
  ];

  const recentUsers = [
    { name: 'Ali Veli', email: 'ali@veli.com', type: 'Premium', date: 'Bugün 10:30' },
    { name: 'Ayşe K.', email: 'ayse.k@gmail.com', type: 'Satın Alan', date: 'Dün 14:15' },
    { name: 'Burak T.', email: 'burakt@hotmail.com', type: 'Kullanıcı', date: 'Dün 09:20' }
  ];

  return (
    <DashboardLayout subscriptionType="Sahip" userName="Yönetici" credits="999.999">
      <header className="mb-12">
        <h1 className="text-5xl font-display font-black tracking-tighter mb-4 text-black uppercase">
          Kontrol Paneli
        </h1>
        <p className="text-black/50 font-bold tracking-[0.2em] uppercase text-xs">Sistem Özetiniz</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Col: User Stats & Recent */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-[2rem] p-8 shadow-embossed border border-white flex items-center justify-between">
              <div>
                <div className="text-black/40 font-bold text-[10px] tracking-[0.2em] uppercase mb-2">Toplam Kullanıcı</div>
                <div className="text-5xl font-display font-black tracking-tighter">1,248</div>
              </div>
              <div className="w-16 h-16 bg-[#F5F5F7] rounded-full shadow-inner-embossed flex items-center justify-center">
                <Users size={24} className="text-black" />
              </div>
            </div>
            <div className="bg-white rounded-[2rem] p-8 shadow-embossed border border-white flex items-center justify-between">
              <div>
                <div className="text-black/40 font-bold text-[10px] tracking-[0.2em] uppercase mb-2">Bugünkü Kullanım</div>
                <div className="text-5xl font-display font-black tracking-tighter">342</div>
              </div>
              <div className="w-16 h-16 bg-[#F5F5F7] rounded-full shadow-inner-embossed flex items-center justify-center">
                <Zap size={24} className="text-black" />
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-[2rem] p-8 shadow-embossed border border-white flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase">Son Eklenen Kullanıcılar</h2>
              <button className="text-[10px] font-bold tracking-widest text-black/50 hover:text-black uppercase flex items-center gap-1">
                Tümünü Gör <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-4">
              {recentUsers.map((user, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#F5F5F7] rounded-2xl">
                  <div>
                    <div className="font-bold text-sm">{user.name}</div>
                    <div className="text-xs text-black/50 font-medium">{user.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-widest">{user.type}</div>
                    <div className="text-[10px] text-black/40">{user.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Notifications */}
        <div className="bg-white rounded-[2rem] p-8 shadow-embossed border border-white flex flex-col h-[500px] lg:h-auto">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-black/5">
            <div className="p-2 bg-black text-white rounded-full"><Bell size={16} /></div>
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase">Bildirimler</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {notifications.map(notif => (
              <div key={notif.id} className="p-4 bg-[#F5F5F7] rounded-2xl shadow-inner-embossed border border-transparent hover:bg-white hover:border-black/5 transition-colors group">
                <p className="text-sm font-bold text-black/80 leading-relaxed mb-2 group-hover:text-black transition-colors">{notif.text}</p>
                <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">{notif.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Notes */}
      <div className="bg-white rounded-[2rem] p-8 shadow-embossed border border-white mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#F5F5F7] rounded-full shadow-inner-embossed"><Edit3 size={16} className="text-black" /></div>
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase">Yönetici Notları</h2>
        </div>
        <textarea 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Buraya önemli notlarınızı veya yapılacaklarınızı yazabilirsiniz..."
          className="w-full h-32 bg-[#F5F5F7] rounded-2xl p-6 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-black/5 shadow-inner-embossed"
        />
      </div>

    </DashboardLayout>
  );
}
