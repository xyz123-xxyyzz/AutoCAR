import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Key, Clock, Download } from 'lucide-react';

export default function UserDashboard() {
  const [profile, setProfile] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [browserType, setBrowserType] = useState('Chrome');

  useEffect(() => {
    fetchProfile();
    fetchAnalyses();
    detectBrowser();
  }, []);

  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.match(/firefox|fxios/i)) {
      setBrowserType('Firefox');
    }
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);
      if (data?.api_key) setApiKey(data.api_key);
    }
  };

  const fetchAnalyses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setAnalyses(data || []);
    }
  };

  const handleSaveApiKey = async () => {
    setSavingKey(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ api_key: apiKey })
        .eq('id', user.id);
      await fetchProfile();
    }
    setSavingKey(false);
  };

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AutoCAR Portal</h1>
            <p className="text-[#8E8E93] mt-1">Hoş geldiniz, yetkili kullanıcı.</p>
          </div>
          <div className="flex gap-4">
            {profile?.is_unlimited ? (
              <span className="px-4 py-2 bg-[#FFD60A]/10 text-[#FFD60A] rounded-xl border border-[#FFD60A]/30 text-sm font-semibold">
                VIP Premium
              </span>
            ) : (
              <span className="px-4 py-2 bg-[#1C1C1E] text-white rounded-xl border border-[#38383A] text-sm">
                Krediniz: <strong className="text-[#0A84FF]">{profile?.credits || 0}</strong>
              </span>
            )}
            <button 
              onClick={handleLogout}
              className="p-2 bg-[#1C1C1E] hover:bg-[#38383A] rounded-xl border border-[#38383A] text-[#FF453A] transition-colors"
              title="Çıkış Yap"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {/* Eklenti Yükleme Kartı */}
            <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-[#38383A]">
              <div className="flex items-center gap-3 mb-4">
                <Download className="text-[#0A84FF]" />
                <h2 className="text-xl font-semibold">Sistem Eklentisi</h2>
              </div>
              <p className="text-sm text-[#8E8E93] mb-6">
                Araç ilanlarını analiz edebilmek için AutoCAR {browserType} eklentisini kurmalısınız.
              </p>
              <button className="w-full py-3 px-4 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-semibold rounded-xl transition-colors">
                {browserType}'a Ekle
              </button>
            </div>

            {/* BYOK - API Key Kartı */}
            <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-[#38383A]">
              <div className="flex items-center gap-3 mb-4">
                <Key className="text-[#32D74B]" />
                <h2 className="text-xl font-semibold">API Anahtarınız</h2>
              </div>
              <p className="text-sm text-[#8E8E93] mb-4">
                Kendi Gemini / OpenAI API anahtarınızı girerek maliyet avantajı sağlayın.
              </p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 bg-black border border-[#38383A] rounded-xl text-white mb-4 focus:outline-none focus:border-[#32D74B] transition-colors"
              />
              <button 
                onClick={handleSaveApiKey}
                disabled={savingKey}
                className="w-full py-3 px-4 bg-black border border-[#38383A] hover:bg-[#38383A] text-white font-semibold rounded-xl transition-colors"
              >
                {savingKey ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-[#38383A] min-h-[500px]">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-white" />
                <h2 className="text-xl font-semibold">Geçmiş Analizler</h2>
              </div>
              
              {analyses.length === 0 ? (
                <div className="text-center py-20 text-[#8E8E93]">
                  Henüz bir analiz gerçekleştirmediniz.
                </div>
              ) : (
                <div className="space-y-4">
                  {analyses.map(analysis => (
                    <div key={analysis.id} className="p-4 bg-black border border-[#38383A] rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{analysis.car_title}</div>
                        <div className="text-sm text-[#8E8E93]">{new Date(analysis.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-xl font-bold text-[#0A84FF]">
                        {analysis.overall_score}/100
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
