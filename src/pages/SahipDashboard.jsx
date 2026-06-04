import { useState, useEffect } from 'react';
import { Edit3, CheckCircle, Users, Loader2, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { supabase } from '../lib/supabase';

export default function SahipDashboard() {
  localStorage.setItem('userRole', 'Sahip');
  const adminEmail = localStorage.getItem('userEmail');

  const [note, setNote] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!adminEmail) return;
      
      // Özel RPC fonksiyonumuz ile kullanıcıları güvenle çekiyoruz
      const { data, error } = await supabase.rpc('get_vip_users_for_admin', {
        admin_email: adminEmail
      });

      if (error) {
        console.error("Kullanıcıları çekerken hata:", error);
      } else if (data) {
        setUsers(data);
      }
      setLoadingUsers(false);
    };

    fetchUsers();
  }, [adminEmail]);

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

      {/* Users List */}
      <div className="bg-white rounded-[2rem] p-8 shadow-embossed border border-white mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#F5F5F7] rounded-full shadow-inner-embossed"><Users size={16} className="text-black" /></div>
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase">VIP Kullanıcı Yönetimi (Cihaz Aktiviteleri)</h2>
        </div>
        
        {loadingUsers ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-black/20" size={48} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="pb-4 text-[10px] font-bold tracking-[0.2em] uppercase text-black/40">E-Posta</th>
                  <th className="pb-4 text-[10px] font-bold tracking-[0.2em] uppercase text-black/40">Rol</th>
                  <th className="pb-4 text-[10px] font-bold tracking-[0.2em] uppercase text-black/40 text-right">Cihaz Durumu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {users.map((user, idx) => {
                  // Admin veya Customer device ID doluysa (sisteme ilk cihazdan girildiyse) aktif sayıyoruz
                  const isActive = user.role === 'sahip' ? !!user.admin_device_id : !!user.customer_device_id;
                  
                  return (
                    <tr key={idx} className="hover:bg-[#F5F5F7]/50 transition-colors">
                      <td className="py-4 text-sm font-bold">{user.email}</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${user.role === 'sahip' ? 'bg-black text-white' : 'bg-black/5 text-black'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {isActive ? (
                          <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
                            <CheckCircle2 size={12} /> Aktif
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-black/20">
                            Bekliyor
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-[10px] font-bold uppercase tracking-widest text-black/30">
                      Sistemde kullanıcı bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
