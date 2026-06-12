import { useState, useEffect } from 'react';
import { ArrowRight, Clock, PlusCircle, Car, Loader2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { supabase } from '../lib/supabase';

export default function GecmisIslemler() {
  const role = localStorage.getItem('userRole') || 'Kullanıcı';
  const userEmail = localStorage.getItem('userEmail');
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Tümü');
  const [islemler, setIslemler] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }
      
      let query = supabase
        .from('analyses_history')
        .select('id, created_at, user_email, role, car_details, score, report_json')
        .order('created_at', { ascending: false })
        .limit(200); // Kasmayı önlemek için son 200 analizi getirir

      // Sadece 'Kullanıcı' rolünde olanları kendi e-postasına göre filtrele
      if (role !== 'Sahip') {
        query = query.eq('user_email', userEmail);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Geçmiş çekme hatası:", error);
      } else if (data) {
        const formattedData = data.map(item => {
          const dateObj = new Date(item.created_at);
          const dateStr = dateObj.toLocaleDateString('tr-TR') + ' ' + dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          
          let totalAds = 0;
          let topCarName = item.car_details || 'Analiz Raporu';
          let topCarScore = item.score || 0;

          if (item.report_json) {
            // Toplam İlan Sayısı Hesaplama
            if (Array.isArray(item.report_json.groups)) {
              item.report_json.groups.forEach(g => {
                if (Array.isArray(g.cars)) {
                  totalAds += g.cars.length;
                }
              });
            }

            // En Yüksek Puanlı Araç Bilgilerini Alma
            if (item.report_json.summaryData && Array.isArray(item.report_json.summaryData.top_10) && item.report_json.summaryData.top_10.length > 0) {
              const top1 = item.report_json.summaryData.top_10[0];
              topCarName = top1.title || topCarName;
              topCarScore = top1.score || topCarScore;
            } else if (Array.isArray(item.report_json.groups)) {
              let maxScore = -1;
              let bestCar = null;
              item.report_json.groups.forEach(g => {
                if (Array.isArray(g.cars)) {
                  g.cars.forEach(c => {
                    let s = parseInt(c.overall_score, 10) || 0;
                    if (s > maxScore) {
                      maxScore = s;
                      bestCar = c;
                    }
                  });
                }
              });
              if (bestCar) {
                topCarName = bestCar.title || topCarName;
                topCarScore = maxScore || topCarScore;
              }
            }
          }

          if (totalAds === 0) totalAds = 1;

          return {
            id: item.id,
            type: 'Analiz',
            date: dateStr,
            topCarName: topCarName,
            topCarScore: topCarScore,
            totalAds: totalAds,
            icon: Car,
            ownerEmail: item.user_email
          };
        });
        setIslemler(formattedData);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [userEmail, role]);

  const filteredIslemler = islemler.filter(i => {
    if (filter === 'Tümü') return true;
    if (filter === 'Yüklemeler') return i.type === 'Yükleme';
    if (filter === 'Analizler') return i.type === 'Analiz';
    return true;
  });

  const handleOpenReport = (id) => {
    navigate(`/analiz/AC-${id}`);
  };

  return (
    <DashboardLayout subscriptionType={role} userName={role === 'Sahip' ? 'Yönetici' : 'Demo'} credits={role === 'Sahip' ? 'Sınırsız' : 15}>
      <header className="mb-12">
        <h1 className="text-5xl font-display font-black tracking-tighter mb-4 text-black uppercase">
          Geçmiş İşlemler
        </h1>
        <p className="text-black/50 font-bold tracking-[0.2em] uppercase text-xs">
          {role === 'Sahip' ? 'SİSTEMDEKİ BÜTÜN ANALİZLER (GENEL BAKIŞ)' : 'Yüklemeleriniz ve Analizleriniz'}
        </p>
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
                <div className="font-display font-black tracking-tight text-xl text-black mb-1">{islem.topCarName}</div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-black/40 font-bold tracking-[0.2em] uppercase">
                  <span className="flex items-center gap-1"><Clock size={10} /> {islem.date}</span>
                  <span className="bg-black/5 text-black px-2 py-0.5 rounded-full">{islem.totalAds} İlan Analiz Edildi</span>
                  {role === 'Sahip' && (
                    <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"><User size={10} /> {islem.ownerEmail}</span>
                  )}
                </div>
              </div>
            </div>
            
            {islem.type === 'Analiz' && (
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <span className="text-[10px] text-black/30 font-bold uppercase tracking-[0.2em]">En Yüksek Puan</span>
                <div className="text-5xl font-display font-black text-black tracking-tighter">{islem.topCarScore}</div>
                <ArrowRight size={24} className="text-black/20 group-hover:text-black group-hover:translate-x-2 transition-all hidden md:block" />
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
