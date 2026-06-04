import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const email = localStorage.getItem('userEmail');
      const deviceId = localStorage.getItem('autocar_device_id');
      const role = localStorage.getItem('userRole');

      if (!email || !deviceId) {
        setIsAuthorized(false);
        return;
      }

      if (allowedRoles && !allowedRoles.includes(role)) {
        setIsAuthorized(false);
        return;
      }

      try {
        // Cihaz ve e-posta eşleşmesini veritabanından anlık kontrol et
        const { data: isValid, error } = await supabase.rpc('verify_device_session', {
          p_email: email,
          p_device_id: deviceId
        });

        if (error || !isValid) {
          // Sahte giriş tespit edilirse verileri sil
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          localStorage.removeItem('autocar_isAuthenticated');
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
      } catch (err) {
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-black" size={48} />
          <p className="text-sm font-bold tracking-widest uppercase text-black/50">Güvenlik Kontrolü Yapılıyor...</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? children : <Navigate to="/login" replace />;
}
