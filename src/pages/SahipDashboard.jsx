import { useState } from 'react';
import { Edit3, CheckCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function SahipDashboard() {
  // Save role to persist across shared pages
  localStorage.setItem('userRole', 'Sahip');

  const [note, setNote] = useState('');

  return (
    <DashboardLayout subscriptionType="Sahip" userName="Yönetici" credits="Sınırsız">
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-5xl font-display font-black tracking-tighter mb-4 text-black uppercase">
          Yönetici Paneli
        </h1>
        <p className="text-black/50 font-bold tracking-[0.2em] uppercase text-xs">Sistem Durumu: Aktif</p>
      </header>

      <div className="grid grid-cols-1 gap-8 mb-8">
        <div className="bg-white rounded-[2rem] p-8 shadow-embossed border border-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <CheckCircle size={48} className="text-green-500" />
            <div>
               <h2 className="text-xl font-black uppercase tracking-tight">Sistem Çevrimiçi</h2>
               <p className="text-sm font-bold text-black/60">AutoCAR VIP Eklentisi ve API bağlantıları sorunsuz çalışıyor.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Notes */}
      <div className="bg-white rounded-[2rem] p-8 shadow-embossed border border-white mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#F5F5F7] rounded-full shadow-inner-embossed"><Edit3 size={16} className="text-black" /></div>
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase">Özel Yönetici Notları</h2>
        </div>
        <textarea 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Buraya önemli notlarınızı veya yapılacaklarınızı yazabilirsiniz. Notlar sadece bu tarayıcıda geçici olarak saklanır..."
          className="w-full h-48 bg-[#F5F5F7] rounded-2xl p-6 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-black/5 shadow-inner-embossed"
        />
      </div>

    </DashboardLayout>
  );
}
