import { useState, useEffect } from 'react';
import { ArrowRight, Clock, PlusCircle, Car, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { supabase } from '../lib/supabase';

export default function GecmisIslemler() {
  const role = localStorage.getItem('userRole') || 'Kullanıcı';
  const userEmail = localStorage.getItem('userEmail');
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Tümü'); // Tümü, Yüklemeler, Analizler
  const [islemler, setIslemler] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('analyses_history')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Geçmiş çekme hatası:", error);
      } else if (data) {
        const formattedData = data.map(item => {
          const dateObj = new Date(item.created_at);
          const dateStr = dateObj.toLocaleDateString('tr-TR') + ' ' + dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          return {
            id: item.id,
            type: 'Analiz',
            date: dateStr,
            detail: item.car_details || 'Analiz Raporu',
            icon: Car,
            score: item.score || 0,
            report_json: item.report_json
          };
        });
        setIslemler(formattedData);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [userEmail]);

  const filteredIslemler = islemler.filter(i => {
    if (filter === 'Tümü') return true;
    if (filter === 'Yüklemeler') return i.type === 'Yükleme';
    if (filter === 'Analizler') return i.type === 'Analiz';
    return true;
  });

  const handleOpenReport = (id) => {
    // Benzersiz link yapısına yönlendir (Örn: /analiz/AC-12)
    navigate(`/analiz/AC-${id}`);
  };

  return (
    <DashboardLayout subscriptionType={role} userName={role === 'Sahip' ? 'Yönetici' : 'Demo'} credits={role === 'Sahip' ? '999.999' : role === 'Premium' ? '15.400' : 15}>
      <header className="mb-12">
        <h1 className="text-5xl font-display font-black tracking-tighter mb-4 text-black uppercase">
          Geçmiş İşlemler
        </h1>
        <p className="text-black/50 font-bold tracking-[0.2em] uppercase text-xs">Yüklemeleriniz ve Analizleriniz</p>
      </header>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        {['Tümü', 'Yüklemeler', 'Analizler'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 ${
              filter === f 
                ? 'bg-black text-white shadow-embossed' 
                : 'bg-white text-black/50 hover:text-black border border-black/5 shadow-sm'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-black/20" size={48} />
          </div>
        ) : filteredIslemler.map(islem => (
          <div 
            key={islem.id} 
            onClick={() => islem.type === 'Analiz' ? handleOpenReport(islem.id) : null}
            className={`group p-8 bg-white border border-black/5 rounded-[2rem] flex flex-col md:flex-row justify-between md:items-center shadow-embossed hover:shadow-embossed-hover transition-all duration-500 ${islem.type === 'Analiz' ? 'cursor-pointer' : ''}`}
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
                <ArrowRight size={24} className="text-black/20 group-hover:text-black group-hover:translate-x-2 transition-all" />
              </div>
            )}
          </div>
        ))}
        {!loading && filteredIslemler.length === 0 && (
          <div className="text-center p-12 text-black/40 font-bold text-sm tracking-widest uppercase">
            Gösterilecek geçmiş analiz bulunamadı.
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}
