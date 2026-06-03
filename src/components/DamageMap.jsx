import React from 'react';

const STATUS_COLORS = {
  orijinal: 'bg-[#9E9E9E] text-white border-[#757575]',
  boyali: 'bg-[#2196F3] text-white border-[#1976D2]',
  lokal_boyali: 'bg-[#FF9800] text-white border-[#F57C00]',
  degisen: 'bg-[#F44336] text-white border-[#D32F2F]',
  bilinmiyor: 'bg-[#E0E0E0] text-[#555555] border-[#C2C2C2]'
};

const STATUS_LABELS = {
  orijinal: 'Orijinal',
  boyali: 'Boyalı',
  lokal_boyali: 'Lokal Boyalı',
  degisen: 'Değişen',
  bilinmiyor: 'Bilinmiyor'
};

const STATUS_SHORT = {
  orijinal: '',
  boyali: 'B',
  lokal_boyali: 'LB',
  degisen: 'D',
  bilinmiyor: '?'
};

const Part = ({ id, label, className, damageMap }) => {
  const status = damageMap[id] || 'bilinmiyor';
  const colorClass = STATUS_COLORS[status];
  const shortText = STATUS_SHORT[status];
  
  return (
    <div 
      className={`absolute flex flex-col items-center justify-center rounded-lg transition-colors border shadow-sm text-center p-1 ${colorClass} ${className}`}
      title={`${label}: ${STATUS_LABELS[status]}`}
    >
      {shortText && <span className="text-sm font-black">{shortText}</span>}
      <span className="text-[8px] font-bold uppercase tracking-wider opacity-80">{label}</span>
    </div>
  );
};

const DamageMap = ({ damageMap }) => {
  if (!damageMap) return null;

  const isAllUnknown = Object.values(damageMap).every(v => v === 'bilinmiyor');

  return (
    <div className="bg-[#FDFBF7] rounded-[2.5rem] p-8 md:p-12 shadow-inner-embossed flex flex-col items-center justify-center mt-12 mb-12 relative overflow-hidden group">
      
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-black/5 rounded-full blur-3xl group-hover:bg-black/10 transition-colors"></div>

      <h3 className="text-2xl font-display font-black tracking-tight text-black mb-8 flex items-center gap-3 relative z-10">
         Araç Ekspertiz (Hasar) Haritası
      </h3>
      
      {isAllUnknown && (
        <div className="bg-black/5 text-black/60 px-6 py-3 rounded-2xl text-sm font-bold mb-8 relative z-10">
          Satıcı ekspertiz verisi girmemiş veya hasar durumu anlaşılamadı. Lütfen ilan açıklamasını okuyun.
        </div>
      )}

      <div className="flex flex-col xl:flex-row items-center xl:items-start justify-center gap-12 w-full z-10">
        
        {/* The Car Body (Absolute Positioning for perfect shape) */}
        <div className="relative w-[400px] h-[550px] transform scale-90 md:scale-100 shrink-0">
          
          {/* Wheels */}
          <div className="absolute top-[80px] left-[30px] w-10 h-20 bg-gray-800 rounded-xl border-4 border-gray-900 shadow-lg"></div>
          <div className="absolute top-[80px] right-[30px] w-10 h-20 bg-gray-800 rounded-xl border-4 border-gray-900 shadow-lg"></div>
          <div className="absolute bottom-[80px] left-[30px] w-10 h-20 bg-gray-800 rounded-xl border-4 border-gray-900 shadow-lg"></div>
          <div className="absolute bottom-[80px] right-[30px] w-10 h-20 bg-gray-800 rounded-xl border-4 border-gray-900 shadow-lg"></div>

          {/* Central Body (Hood, Roof, Trunk) */}
          <Part id="kaput" label="Kaput" className="top-[60px] left-[130px] w-[140px] h-[100px]" damageMap={damageMap} />
          <Part id="tavan" label="Tavan" className="top-[170px] left-[130px] w-[140px] h-[180px]" damageMap={damageMap} />
          <Part id="bagaj" label="Bagaj" className="top-[360px] left-[130px] w-[140px] h-[100px]" damageMap={damageMap} />

          {/* Bumpers */}
          <Part id="on_tampon" label="Ön Tmp." className="top-0 left-[110px] w-[180px] h-[50px] rounded-t-[2rem]" damageMap={damageMap} />
          <Part id="arka_tampon" label="Arka Tmp." className="bottom-0 left-[110px] w-[180px] h-[50px] rounded-b-[2rem]" damageMap={damageMap} />

          {/* Fenders (Çamurluklar) */}
          <Part id="sol_on_camurluk" label="Sol Ön Çam." className="top-[60px] left-[70px] w-[50px] h-[100px] rounded-tl-[2rem]" damageMap={damageMap} />
          <Part id="sag_on_camurluk" label="Sağ Ön Çam." className="top-[60px] right-[70px] w-[50px] h-[100px] rounded-tr-[2rem]" damageMap={damageMap} />
          
          <Part id="sol_arka_camurluk" label="Sol Arka Çam." className="top-[360px] left-[70px] w-[50px] h-[100px] rounded-bl-[2rem]" damageMap={damageMap} />
          <Part id="sag_arka_camurluk" label="Sağ Arka Çam." className="top-[360px] right-[70px] w-[50px] h-[100px] rounded-br-[2rem]" damageMap={damageMap} />

          {/* Doors (Kapılar - Protruding outwards) */}
          <Part id="sol_on_kapi" label="Sol Ön Kapı" className="top-[170px] left-[55px] w-[65px] h-[85px]" damageMap={damageMap} />
          <Part id="sag_on_kapi" label="Sağ Ön Kapı" className="top-[170px] right-[55px] w-[65px] h-[85px]" damageMap={damageMap} />
          
          <Part id="sol_arka_kapi" label="Sol Arka Kapı" className="top-[265px] left-[55px] w-[65px] h-[85px]" damageMap={damageMap} />
          <Part id="sag_arka_kapi" label="Sağ Arka Kapı" className="top-[265px] right-[55px] w-[65px] h-[85px]" damageMap={damageMap} />
        </div>

        {/* Status List on the right */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 w-full xl:w-80 shrink-0">
          <h4 className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase mb-6 border-b border-black/5 pb-4">Ekspertiz Özeti</h4>
          <div className="space-y-6">
            
            {['degisen', 'boyali', 'lokal_boyali'].map((statusKey) => {
              const parts = Object.keys(damageMap).filter(k => damageMap[k] === statusKey);
              if (parts.length === 0) return null;
              
              const title = STATUS_LABELS[statusKey] + ' Parçalar';
              const colorBg = STATUS_COLORS[statusKey].split(' ')[0]; // extract bg color
              
              return (
                <div key={statusKey}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${colorBg} shadow-inner`}></div>
                    <span className="text-sm font-bold text-black/80">{title}</span>
                  </div>
                  <ul className="pl-5 space-y-1">
                    {parts.map(p => (
                      <li key={p} className="text-xs font-bold text-black/50 capitalize list-disc">
                        {p.replace(/_/g, ' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            
            {Object.values(damageMap).filter(v => ['degisen', 'boyali', 'lokal_boyali'].includes(v)).length === 0 && (
              <div className="text-sm font-bold text-green-600 bg-green-50 p-4 rounded-xl">
                Harika! Araçta boyalı veya değişen parça tespit edilmedi (veya bilgi girilmemiş).
              </div>
            )}
            
          </div>
        </div>

      </div>

      <div className="flex flex-wrap justify-center gap-6 mt-12 relative z-10 bg-white px-8 py-4 rounded-3xl shadow-sm border border-black/5 w-full max-w-3xl">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#B4D3B2] border border-[#8FB88D]"></div><span className="text-xs font-bold text-black/70">Orijinal</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#82B1FF] border border-[#5C93ED]"></div><span className="text-xs font-bold text-black/70">Boyalı</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#FFCC80] border border-[#F2B252]"></div><span className="text-xs font-bold text-black/70">Lokal Boyalı</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#FF8A80] border border-[#E8675D]"></div><span className="text-xs font-bold text-black/70">Değişen</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#E0E0E0] border border-[#C2C2C2]"></div><span className="text-xs font-bold text-black/70">Bilinmiyor</span></div>
      </div>
    </div>
  );
};

export default DamageMap;
