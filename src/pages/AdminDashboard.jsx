import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, LogOut, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    // Gerçek uygulamada edge function veya admin yetkileri (Service Role) üzerinden yapılmalı.
    // Şimdilik demo amaçlı RLS "true" veya admin bypass ile alınıyor varsayalım.
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  const addCredit = async (id, currentCredits) => {
    await supabase.from('profiles').update({ credits: currentCredits + 10 }).eq('id', id);
    fetchUsers();
  };

  const toggleVIP = async (id, currentStatus) => {
    await supabase.from('profiles').update({ is_unlimited: !currentStatus }).eq('id', id);
    fetchUsers();
  };

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">AutoCAR Admin</h1>
            <span className="px-3 py-1 bg-[#FF453A]/10 text-[#FF453A] border border-[#FF453A]/30 rounded-lg text-xs font-bold uppercase flex items-center gap-1">
              <ShieldAlert size={14} /> Yetkili
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-[#1C1C1E] hover:bg-[#38383A] rounded-xl border border-[#38383A] transition-colors flex items-center gap-2"
          >
            <LogOut size={16} /> Çıkış
          </button>
        </header>

        <div className="bg-[#1C1C1E] rounded-2xl border border-[#38383A] overflow-hidden">
          <div className="p-6 border-b border-[#38383A] flex items-center gap-3">
            <Users className="text-[#0A84FF]" />
            <h2 className="text-xl font-semibold">Kullanıcı Yönetimi</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/50 text-[#8E8E93] text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">E-posta / ID</th>
                  <th className="p-4 font-medium">Yetki</th>
                  <th className="p-4 font-medium">Kredi</th>
                  <th className="p-4 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#38383A]">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-black/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{u.email}</div>
                      <div className="text-xs text-[#8E8E93] truncate max-w-[200px]">{u.id}</div>
                    </td>
                    <td className="p-4">
                      {u.is_admin ? (
                        <span className="text-[#FF453A]">Admin</span>
                      ) : u.is_unlimited ? (
                        <span className="text-[#FFD60A] font-semibold">VIP</span>
                      ) : (
                        <span className="text-white">Standart</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-xl font-bold">{u.is_unlimited ? '∞' : u.credits}</div>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button 
                        onClick={() => addCredit(u.id, u.credits)}
                        className="px-3 py-1.5 bg-[#0A84FF]/20 text-[#0A84FF] hover:bg-[#0A84FF]/30 rounded-lg text-sm transition-colors font-medium"
                      >
                        +10 Kredi
                      </button>
                      <button 
                        onClick={() => toggleVIP(u.id, u.is_unlimited)}
                        className="px-3 py-1.5 bg-[#FFD60A]/20 text-[#FFD60A] hover:bg-[#FFD60A]/30 rounded-lg text-sm transition-colors font-medium"
                      >
                        VIP Yap/Kaldır
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && !loading && (
              <div className="p-8 text-center text-[#8E8E93]">Sistemde kullanıcı bulunmuyor.</div>
            )}
            {loading && (
              <div className="p-8 text-center text-[#8E8E93]">Yükleniyor...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
