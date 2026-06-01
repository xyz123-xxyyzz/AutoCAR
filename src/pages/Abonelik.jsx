import { useState } from 'react';
import { CreditCard, CheckCircle, Zap, RefreshCw } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function Abonelik() {
  const role = localStorage.getItem('userRole') || 'Kullanıcı';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTopup = () => {
    setLoading(true);
    setSuccess(false);
    
    // Simulate OpenAI API charge / Mock Top-up
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000); // Hide success after 3s
    }, 2000);
  };

  return (
    <DashboardLayout subscriptionType={role} userName={role === 'Sahip' ? 'Yönetici' : 'Demo'} credits={role === 'Sahip' ? '999.999' : role === 'Premium' ? '15.400' : 15}>
      <header className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-4 text-black uppercase">
          Abonelik
        </h1>
        <p className="text-black/50 font-bold tracking-[0.2em] uppercase text-xs">Mevcut Aboneliklerimiz ve Bakiye Yönetimi</p>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {role === 'Sahip' ? (
          <div className="md:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-embossed border border-white flex flex-col items-center text-center">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40 mb-6">Kurucu Hesap</div>
            <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center shadow-inner-embossed mb-6">
              <Zap className="text-black" size={24} />
            </div>
            <h2 className="text-3xl font-display font-black tracking-tight mb-2">Sahip - Bu benimki</h2>
            <div className="text-black/50 font-bold text-sm mb-12">Sınırsız Analiz Yetkisi</div>
            
            <button 
              onClick={handleTopup}
              disabled={loading || success}
              className={`w-full max-w-sm py-5 rounded-full font-display font-black tracking-[0.2em] text-[10px] uppercase transition-all duration-300 flex items-center justify-center gap-3
                ${success ? 'bg-white text-green-600 shadow-inner-embossed border border-green-100' : 'bg-black text-white hover:bg-black/80 shadow-[0_10px_30px_rgba(0,0,0,0.2)]'}
                ${loading ? 'opacity-70 cursor-wait bg-white text-black shadow-inner-embossed' : ''}
              `}
            >
              {!loading && !success && <><CreditCard size={14} /> Yükleme Yap</>}
              {loading && <><RefreshCw className="animate-spin" size={14} /> Yükleniyor...</>}
              {success && <><CheckCircle size={14} /> Başarıyla Yüklendi!</>}
            </button>
          </div>
        ) : (
          <>
            {/* Basic Plan */}
            <div className={`bg-[#F5F5F7] rounded-[2.5rem] p-10 flex flex-col items-center text-center ${role === 'Kullanıcı' ? 'border-[4px] border-black relative' : 'shadow-inner-embossed'}`}>
              {role === 'Kullanıcı' && (
                <div className="absolute -top-4 bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-embossed z-10">
                  Mevcut Plan
                </div>
              )}
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40 mb-6 mt-4">Yükleme Yap</div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-embossed mb-6">
                <CheckCircle className="text-black/30" size={24} />
              </div>
              <h2 className="text-3xl font-display font-black tracking-tight mb-2">Ücretsiz Üyelik</h2>
              <div className="text-black/50 font-bold text-sm mb-8">Standart Erişim</div>
              
              <ul className="text-xs font-bold tracking-wide text-black/70 space-y-4 mb-8 text-left w-full px-4">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-black rounded-full"></div> Bir kredi 20 TL</li>
              </ul>

              <button 
                onClick={handleTopup}
                disabled={loading || success}
                className={`w-full py-5 rounded-full font-display font-black tracking-[0.2em] text-[10px] uppercase transition-all duration-300 flex items-center justify-center gap-3 mt-auto
                  ${success ? 'bg-white text-green-600 shadow-inner-embossed border border-green-100' : 'bg-black text-white hover:bg-black/80 shadow-[0_10px_30px_rgba(0,0,0,0.2)]'}
                  ${loading ? 'opacity-70 cursor-wait bg-white text-black shadow-inner-embossed' : ''}
                `}
              >
                {!loading && !success && <><CreditCard size={14} /> Yükleme Yap</>}
                {loading && <><RefreshCw className="animate-spin" size={14} /> İşleniyor...</>}
                {success && <><CheckCircle size={14} /> Başarıyla Yüklendi!</>}
              </button>
            </div>

            {/* Premium Plan */}
            <div className={`bg-white rounded-[2.5rem] p-10 flex flex-col items-center text-center relative ${role === 'Premium' ? 'border-[4px] border-black' : 'border border-white shadow-embossed'}`}>
              {role === 'Premium' ? (
                <div className="absolute -top-4 bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-embossed z-10">
                  Mevcut Plan
                </div>
              ) : (
                <div className="absolute top-6 right-6 bg-black text-white px-3 py-1 rounded-full text-[8px] font-bold tracking-widest uppercase">
                  Önerilen
                </div>
              )}
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40 mb-6 mt-4">Abonelik Planı</div>
              <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center shadow-inner-embossed mb-6">
                <Zap className="text-black" size={24} />
              </div>
              <h2 className="text-3xl font-display font-black tracking-tight mb-2">Premium Paket</h2>
              <div className="text-black/50 font-bold text-sm mb-8">150.000 TL ödeme (Tek seferlik)</div>
              
              <ul className="text-xs font-bold tracking-wide text-black/70 space-y-4 mb-10 text-left w-full px-4">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-black rounded-full"></div> Bir kredi = 0.05 TL (5 kuruş)</li>
              </ul>

              <button 
                onClick={() => alert("Satın alma işlemleri için destek ekibiyle iletişime geçin.")}
                className="w-full py-5 rounded-full font-display font-black tracking-[0.2em] text-[10px] uppercase transition-all duration-300 flex items-center justify-center gap-3 mt-auto bg-black text-white hover:bg-black/80 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
              >
                <CreditCard size={14} /> Satın Al
              </button>
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
