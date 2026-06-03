import React from 'react';

const STATUS_COLORS = {
  orijinal: 'bg-green-500',
  boyali: 'bg-yellow-400',
  lokal_boyali: 'bg-orange-400',
  degisen: 'bg-red-500',
  bilinmiyor: 'bg-gray-300'
};

const STATUS_LABELS = {
  orijinal: 'Orijinal',
  boyali: 'Boyalı',
  lokal_boyali: 'Lokal Boyalı',
  degisen: 'Değişen',
  bilinmiyor: 'Bilinmiyor'
};

const DamageMap = ({ damageMap }) => {
  if (!damageMap) return null;

  const isAllUnknown = Object.values(damageMap).every(v => v === 'bilinmiyor');

  const Part = ({ id, label, className }) => {
    const status = damageMap[id] || 'bilinmiyor';
    const colorClass = STATUS_COLORS[status];
    
    return (
      <div 
        className={`flex items-center justify-center text-[9px] md:text-[10px] font-bold text-white uppercase tracking-wider rounded-lg transition-colors border-2 border-white/20 shadow-inner text-center leading-tight p-1 ${colorClass} ${className}`}
        title={`${label}: ${STATUS_LABELS[status]}`}
      >
        {label}
      </div>
    );
  };

  return (
    <div className="bg-[#F5F5F7] rounded-[2.5rem] p-8 md:p-12 shadow-inner-embossed flex flex-col items-center justify-center mt-12 mb-12 relative overflow-hidden group">
      
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-black/5 rounded-full blur-3xl group-hover:bg-black/10 transition-colors"></div>

      <h3 className="text-2xl font-display font-black tracking-tight text-black mb-8 flex items-center gap-3 relative z-10">
         Araç Ekspertiz (Hasar) Haritası
      </h3>
      
      {isAllUnknown && (
        <div className="bg-black/5 text-black/60 px-6 py-3 rounded-2xl text-sm font-bold mb-8 relative z-10">
          Satıcı ekspertiz verisi girmemiş veya hasar durumu anlaşılamadı. Lütfen ilan açıklamasını okuyun.
        </div>
      )}

      {/* The Car Body */}
      <div className="relative w-[320px] h-[520px] bg-white rounded-[4rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-4 grid grid-cols-3 gap-2 z-10 border-[8px] border-[#F5F5F7]">
        
        {/* Row 1: Front Bumper */}
        <div className="col-span-3 h-14">
          <Part id="on_tampon" label="Ön Tmp." className="w-full h-full rounded-t-[2.5rem]" />
        </div>
        
        {/* Row 2: Hood and Front Fenders */}
        <div className="col-span-1 h-24">
          <Part id="sol_on_camurluk" label="Sol Ön Çam." className="w-full h-full" />
        </div>
        <div className="col-span-1 h-24">
          <Part id="kaput" label="Kaput" className="w-full h-full" />
        </div>
        <div className="col-span-1 h-24">
          <Part id="sag_on_camurluk" label="Sağ Ön Çam." className="w-full h-full" />
        </div>

        {/* Row 3: Front Doors and Roof */}
        <div className="col-span-1 h-28">
          <Part id="sol_on_kapi" label="Sol Ön Kapı" className="w-full h-full" />
        </div>
        <div className="col-span-1 h-28">
          <Part id="tavan" label="Tavan" className="w-full h-full" />
        </div>
        <div className="col-span-1 h-28">
          <Part id="sag_on_kapi" label="Sağ Ön Kapı" className="w-full h-full" />
        </div>

        {/* Row 4: Rear Doors and Middle space */}
        <div className="col-span-1 h-28">
          <Part id="sol_arka_kapi" label="Sol Arka Kapı" className="w-full h-full" />
        </div>
        <div className="col-span-1 h-28 flex items-center justify-center">
           <div className="w-3/4 h-3/4 border-4 border-dashed border-black/5 rounded-2xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-black/20 uppercase">İç Mekan</span>
           </div>
        </div>
        <div className="col-span-1 h-28">
          <Part id="sag_arka_kapi" label="Sağ Arka Kapı" className="w-full h-full" />
        </div>

        {/* Row 5: Rear Fenders and Trunk */}
        <div className="col-span-1 h-24">
          <Part id="sol_arka_camurluk" label="Sol Arka Çam." className="w-full h-full" />
        </div>
        <div className="col-span-1 h-24">
          <Part id="bagaj" label="Bagaj" className="w-full h-full" />
        </div>
        <div className="col-span-1 h-24">
          <Part id="sag_arka_camurluk" label="Sağ Arka Çam." className="w-full h-full" />
        </div>

        {/* Row 6: Rear Bumper */}
        <div className="col-span-3 h-14">
          <Part id="arka_tampon" label="Arka Tmp." className="w-full h-full rounded-b-[2.5rem]" />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 mt-12 relative z-10 bg-white px-8 py-4 rounded-3xl shadow-sm border border-black/5">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500 shadow-inner"></div><span className="text-xs font-bold text-black/70">Orijinal</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-400 shadow-inner"></div><span className="text-xs font-bold text-black/70">Boyalı</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-orange-400 shadow-inner"></div><span className="text-xs font-bold text-black/70">Lokal Boyalı</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500 shadow-inner"></div><span className="text-xs font-bold text-black/70">Değişen</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gray-300 shadow-inner"></div><span className="text-xs font-bold text-black/70">Bilinmiyor</span></div>
      </div>
    </div>
  );
};

export default DamageMap;
