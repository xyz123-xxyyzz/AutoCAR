import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Kullanicilar() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Gerçek kullanıcı yönetimi tablosu Dashboard'a taşındığı için 
    // buraya tıklayanları direkt oraya yönlendiriyoruz.
    navigate('/sahip');
  }, [navigate]);

  return null;
}
