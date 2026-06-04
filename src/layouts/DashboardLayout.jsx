import { Link, useLocation } from 'react-router-dom';

export default function DashboardLayout({ children, subscriptionType, userName, credits }) {
  const location = useLocation();

  const getSubColor = () => {
    switch(subscriptionType) {
      case 'Sahip': return 'text-black font-black uppercase tracking-widest text-[10px]';
      case 'Premium': return 'text-[#D4AF37] font-black uppercase tracking-widest text-[10px]';
      default: return 'text-black font-black uppercase tracking-widest text-[10px]';
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black overflow-hidden font-sans relative selection:bg-black selection:text-white pb-20">
      
      {/* Scroll Blur Effect at Top */}
      <div className="fixed top-0 left-0 w-full h-[120px] bg-gradient-to-b from-[#F0F2F5]/90 via-[#F0F2F5]/50 to-transparent backdrop-blur-md z-40 pointer-events-none"></div>

      {/* Devialet Style Background Elements (Very Subtle) */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#F0F0F0] to-transparent opacity-50 pointer-events-none"></div>

      {/* Floating Pill Navbar */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-white border border-white rounded-full px-8 py-4 flex items-center justify-between shadow-embossed z-50">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-xl tracking-[0.2em] uppercase">AutoCAR</span>
        </div>

        {/* Center: Links */}
        <div className="hidden md:flex items-center gap-10">
          <Link 
            to={subscriptionType === 'Sahip' ? "/sahip" : subscriptionType === 'Premium' ? "/satin-alan" : "/kullanici"} 
            className={`text-[11px] font-bold tracking-[0.15em] uppercase transition-opacity ${
              ['/sahip', '/kullanici', '/satin-alan'].includes(location.pathname) ? 'text-black' : 'text-black/50 hover:text-black'
            }`}
          >
            Kontrol Paneli
          </Link>
          
          <Link 
            to="/gecmis" 
            className={`text-[11px] font-bold tracking-[0.15em] uppercase transition-opacity ${
              location.pathname === '/gecmis' ? 'text-black' : 'text-black/50 hover:text-black'
            }`}
          >
            Geçmiş Analizler
          </Link>


          <Link 
            to="/ayarlar" 
            className={`text-[11px] font-bold tracking-[0.15em] uppercase transition-opacity ${
              location.pathname === '/ayarlar' ? 'text-black' : 'text-black/50 hover:text-black'
            }`}
          >
            Ayarlar
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className={getSubColor()}>{subscriptionType}</span>
            <span className="text-[10px] text-black/50 font-bold uppercase tracking-widest">{userName}</span>
          </div>
        </div>

      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-40 px-6">
        <div className="max-w-5xl mx-auto h-full flex flex-col">
          {children}
        </div>
      </main>

    </div>
  );
}
