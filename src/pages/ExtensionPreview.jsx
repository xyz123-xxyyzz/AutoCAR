import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Car, Loader2, Power } from 'lucide-react';

export default function ExtensionPreview() {
  const navigate = useNavigate();
  // states: 'inactive' | 'waiting' | 'ready' | 'analyzing' | 'done'
  const [extensionState, setExtensionState] = useState('inactive');
  const [slotsFilled, setSlotsFilled] = useState(0);

  // When 'analyzing', start a timer
  useEffect(() => {
    if (extensionState === 'analyzing') {
      const timer = setTimeout(() => {
        setExtensionState('done');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [extensionState]);

  const handleSimulateAddCar = () => {
    if (extensionState === 'waiting' || extensionState === 'ready') {
      if (slotsFilled < 10) {
        setSlotsFilled(prev => prev + 1);
        setExtensionState('ready');
      }
    }
  };

  const handleButtonClick = () => {
    if (extensionState === 'inactive') {
      setExtensionState('waiting');
    } else if (extensionState === 'waiting') {
      // Toggle off
      setExtensionState('inactive');
      setSlotsFilled(0);
    } else if (extensionState === 'ready') {
      setExtensionState('analyzing');
    } else if (extensionState === 'done') {
      navigate('/analiz');
    }
  };

  return (
    <DashboardLayout subscriptionType="Kullanıcı" userName="Demo" credits={15}>
      <header className="mb-20 text-center flex flex-col items-center">
        <h1 className="text-7xl md:text-8xl font-display font-black tracking-tighter mb-6 text-black uppercase">
          Eklenti
        </h1>
        <p className="text-black/50 font-bold tracking-[0.2em] uppercase text-xs">
          Uzantının tarayıcıda nasıl duracağını gösteren prototip.
        </p>
        
        {/* Simulator Button */}
        {(extensionState === 'waiting' || extensionState === 'ready') && (
          <button 
            onClick={handleSimulateAddCar}
            className="mt-8 px-8 py-4 bg-black text-white rounded-full text-[10px] font-bold tracking-widest uppercase shadow-embossed hover:bg-black/80 transition-all"
          >
            + Araba Sayfasına Gir (Simüle Et)
          </button>
        )}
      </header>

      <div className="flex items-center justify-center">
        {/* Chrome Extension Container Mock */}
        <div className="w-[360px] bg-white text-black p-8 rounded-[2.5rem] shadow-embossed border border-white font-sans relative overflow-hidden flex flex-col items-center">
          
          {/* Top Center: AutoCAR */}
          <h1 className="text-3xl font-display font-black tracking-widest uppercase text-black mb-2 text-center">
            AutoCAR
          </h1>
          
          {/* Below it: 0/10 */}
          <div className="text-[10px] text-black/40 font-bold tracking-[0.2em] uppercase mb-8 text-center">
            {slotsFilled}/10 Kullanım
          </div>
          
          {/* Below it: 10 empty small boxes (2 rows of 5) */}
          <div className="grid grid-cols-5 gap-3 mb-12 w-full px-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                className={`aspect-square rounded-[0.8rem] border overflow-hidden ${i < slotsFilled ? 'border-black shadow-[0_5px_15px_rgba(0,0,0,0.2)]' : 'bg-[#F5F5F7] border-black/5'} shadow-inner-embossed transition-all duration-500 relative`}
              >
                {i < slotsFilled && (
                  <img 
                    src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=200" 
                    alt="Car Thumbnail" 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
            ))}
          </div>

          {/* Bottom center: Analiz Et Area */}
          <div className="w-full relative bg-[#FDFDFD] rounded-[2rem] p-6 shadow-inner-embossed flex flex-col items-center justify-center mt-auto min-h-[160px] border border-black/5">

            <div className="text-center w-full">
              
              {/* Icon & Status Message Area (Stable Height) */}
              <div className="h-[60px] flex flex-col items-center justify-center mb-2">
                {extensionState === 'inactive' && (
                  <div className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
                    Sistem Kapalı
                  </div>
                )}
                {extensionState === 'waiting' && (
                  <div className="flex flex-col items-center gap-2">
                    <Car className="text-black/30" size={20} />
                    <div className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
                      İlan Bekleniyor...
                    </div>
                  </div>
                )}
                {extensionState === 'ready' && (
                  <div className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
                    {slotsFilled} İlan Eklendi
                  </div>
                )}
                {extensionState === 'analyzing' && (
                  <div className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
                    Yapay Zeka Devrede
                  </div>
                )}
                {extensionState === 'done' && (
                  <div className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
                    İşlem Tamamlandı
                  </div>
                )}
              </div>

              {/* Main Action Button */}
              <button
                onClick={handleButtonClick}
                disabled={extensionState === 'analyzing'}
                className={`w-full py-5 rounded-full font-display font-black tracking-[0.2em] text-[10px] uppercase transition-all duration-300 flex items-center justify-center gap-2
                  ${['inactive', 'waiting', 'ready', 'done'].includes(extensionState) ? 'bg-black text-white hover:bg-black/80 shadow-[0_10px_30px_rgba(0,0,0,0.2)]' : ''}
                  ${extensionState === 'analyzing' ? 'opacity-70 cursor-wait bg-black text-white shadow-inner-embossed' : ''}
                `}
              >
                {extensionState === 'inactive' && <><Power size={14} /> ÇALIŞTIR</>}
                {extensionState === 'waiting' && <><Loader2 size={14} className="animate-spin text-white/50" /> BEKLENİYOR (DURDUR)</>}
                {extensionState === 'ready' && 'ANALİZ ET'}
                {extensionState === 'analyzing' && <><Loader2 className="animate-spin text-white" size={14} /> ANALİZ EDİLİYOR</>}
                {extensionState === 'done' && 'RAPORU GÖSTER'}
              </button>

            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
