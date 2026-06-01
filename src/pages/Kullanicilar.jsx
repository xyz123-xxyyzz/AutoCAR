import { useState } from 'react';
import { Filter, Info, Mail, Clock, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

export default function Kullanicilar() {
  const role = localStorage.getItem('userRole') || 'Kullanıcı';
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Tümü');

  const mockUsers = [
    { id: 1, name: 'Ali Veli', email: 'ali.veli@gmail.com', type: 'Premium', lastAction: 'Analiz Yapıldı (BMW 320i)', joinDate: '12 Mayıs 2026', totalAnalysis: 14 },
    { id: 2, name: 'Ayşe Kaya', email: 'ayse.kaya@hotmail.com', type: 'Satın Alan', lastAction: 'Paket Satın Alındı (50 Kredi)', joinDate: '08 Mayıs 2026', totalAnalysis: 3 },
    { id: 3, name: 'Burak Tekin', email: 'burakt@outlook.com', type: 'Premium', lastAction: 'Uzantı Yüklendi', joinDate: '10 Mayıs 2026', totalAnalysis: 0 },
    { id: 4, name: 'Ceren Yılmaz', email: 'cyilmaz@gmail.com', type: 'Kullanıcı', lastAction: 'Kayıt Olundu', joinDate: '15 Mayıs 2026', totalAnalysis: 0 },
    { id: 5, name: 'Demir Çelik', email: 'demir.celik@sirket.com', type: 'Satın Alan', lastAction: 'Analiz Yapıldı (Mercedes E200)', joinDate: '01 Mayıs 2026', totalAnalysis: 42 },
  ];

  const filteredUsers = mockUsers.filter(u => filter === 'Tümü' || u.type === filter);

  return (
    <DashboardLayout subscriptionType={role} userName={role === 'Sahip' ? 'Yönetici' : 'Demo'} credits={role === 'Sahip' ? '999.999' : role === 'Premium' ? '15.400' : 15}>
      <header className="mb-12 flex justify-between items-end">
        <h1 className="text-5xl font-display font-black tracking-tighter mb-4 text-black uppercase">
          Kullanıcılar
        </h1>
        <p className="text-black/50 font-bold tracking-[0.2em] uppercase text-xs">Tüm Müşteriler ve Aktivite Takibi</p>
      </header>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        {['Tümü', 'Premium', 'Kullanıcı'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${filter === f ? 'bg-black text-white shadow-[0_5px_15px_rgba(0,0,0,0.2)]' : 'bg-white text-black shadow-embossed hover:bg-black/5'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Users List */}
      <div className="bg-white rounded-[2rem] p-8 shadow-embossed border border-white">
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-[#F5F5F7] rounded-2xl gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full shadow-embossed flex items-center justify-center font-display font-black text-lg">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-black">{user.name}</div>
                  <div className="text-xs text-black/50 font-medium flex items-center gap-1"><Mail size={10} /> {user.email}</div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 flex-1">
                <div className="text-left md:text-right">
                  <div className="text-[10px] font-bold tracking-widest text-black/40 uppercase mb-1">Durum</div>
                  <div className="text-xs font-black uppercase tracking-widest">{user.type}</div>
                </div>

                <button 
                  onClick={() => navigate('/kullanici-detay')}
                  className="px-6 py-3 bg-[#F5F5F7] text-black text-[10px] font-bold tracking-[0.2em] uppercase rounded-full hover:bg-black hover:text-white transition-colors shadow-inner-embossed flex items-center gap-2"
                >
                  <Info size={12} /> Daha Fazla Bilgi
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-20 text-black/40 font-bold tracking-widest uppercase text-xs">
              Bu filtreye uygun kullanıcı bulunamadı.
            </div>
          )}
        </div>
      </div>

    </DashboardLayout>
  );
}
