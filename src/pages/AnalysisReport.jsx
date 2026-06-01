import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Zap, CheckCircle, Star, Settings, Shield, Gauge, Maximize, AlertTriangle, AlertCircle, XCircle, Minus, HelpCircle, Trophy, Target, Sparkles, ArrowRight, Table2, Image as ImageIcon } from 'lucide-react';

export default function AnalysisReport() {
  const mockResults = [
    {
      title: '2023 Mercedes-Benz C200 4MATIC AMG - Hatasız Boyasız',
      price: '3.150.000 TL',
      url: '#',
      market_speed_score: 95,
      price_perf_score: 82,
      condition_score: 98,
      overall_score: 92,
      ai_report: 'Araç tamamen hatasız ve yetkili servis bakımlı görünüyor. Fiyatı piyasa ortalamasının sadece %2 üzerinde, donanım seviyesi (Burmester, Gece Paketi) eklendiğinde fiyatı oldukça makul. İlan açıklaması çok şeffaf, gizli bir kusur sezilmiyor. Bu kondisyondaki araçlar ortalama 7-10 gün içinde satılmaktadır.',
      detailed_specs: [
        { name: 'Motor Hacmi', value: '1496 cc', status: 'good', comment: 'Rakiplerine göre düşük hacimli olması vergi avantajı sağlarken, performans kaybı yaşatmıyor.', note: '(Audi A4 2.0 motorlara göre avantajlı)' },
        { name: 'Motor Gücü', value: '204 HP', status: 'good', comment: '1.5 litrelik bir motor için sınıfının en iddialı beygir güçlerinden biri.', note: '(BMW 320i 170 HP sunmaktadır)' },
        { name: 'Tork', value: '300 Nm', status: 'good', comment: 'Alt devirlerdeki çekişi hafif hibrit sistemiyle desteklendiği için gayet atik.', note: '(BMW 320i 250 Nm)' },
        { name: 'Şanzıman', value: '9G-TRONIC', status: 'average', comment: 'Yumuşak ve sarsıntısız geçişleriyle konfor odaklı, ancak sportif sürüşte ZF kadar keskin değil.', note: '(BMW ZF 8 İleri şanzımanı daha sportif hissettirir)' },
        { name: 'Çekiş', value: '4MATIC (4x4)', status: 'good', comment: 'Kış aylarında ve kaygan zeminlerde muazzam bir yol tutuş avantajı sağlar.', note: '(BMW 320i genellikle arkadan itişlidir)' },
        { name: 'Yakıt Tüketimi (Ş.İçi)', value: '8.5 lt / 100km', status: 'mixed', comment: 'Ağırlığı ve dört çeker sistemi göz önüne alındığında makul bir tüketim sunuyor.', note: '(D Sınıfı ortalaması 8.0 - 9.0 lt arasıdır)' },
        { name: 'Yakıt Tüketimi (Ş.Dışı)', value: '5.4 lt / 100km', status: 'good', comment: 'Uzun yolda hafif hibrit desteğiyle çok ekonomik olabiliyor.', note: '(Sınıfının en iyi değerlerinden)' },
        { name: 'Hızlanma (0-100)', value: '7.1 saniye', status: 'good', comment: 'D segmenti lüks bir sedan için oldukça tatminkar ve ivmelenmesi akıcı.', note: '(Audi A4 40 TDI 7.3 saniye)' },
        { name: 'Hasar Kaydı', value: 'Hatasız / Boyasız', status: 'good', comment: 'İkinci elde değerini maksimum seviyede korumasını sağlayacak kusursuz bir kondisyon.', note: '(Boyasız araçlar ortalama %5-7 daha pahalıdır)' },
        { name: 'Kilometre', value: '15.000 km', status: 'good', comment: 'Fiyatına göre çok ideal ve henüz rodajı yeni bitmiş sayılır.', note: '(Emsalleri genelde 30.000+ km bandındadır)' },
        { name: 'Model Yılı', value: '2023', status: 'good', comment: 'Fiyatına göre model yılı gayet güncel ve garanti kapsamında.', note: '' }
      ],
      competitor_analysis: {
        pros: ['Segmentinin en iyi iç malzeme kalitesi', 'Çok düşük ikinci el değer kaybı', 'Gelişmiş MBUX teknolojisi', '4MATIC ile her koşulda üstün yol tutuş'],
        cons: ['BMW 3 Serisine göre daha az sportif sürüş hissiyatı', 'Yüksek yetkili servis ve kasko maliyetleri', 'Arka yaşam alanı rakiplerinden dar'],
        text: 'Bu Mercedes-Benz C200 4MATIC AMG, lüks D segmentinde Audi A4 ve BMW 3 Serisi ile doğrudan rekabet etmektedir. Rakipleriyle kıyaslandığında en büyük avantajı, muazzam kalitedeki iç mekanı ve ambiyans aydınlatması ile sunduğu o eşsiz "premium" hissidir. BMW 320i M Sport daha sportif ve rijit bir sürüş sunarken, C200 tamamen konfor ve prestij odaklıdır.\n\nİkinci el pazarına baktığımızda, C Serisinin satılma hızı (likiditesi) Audi A4\'ten açık ara daha yüksektir. Ayrıca bu araçta yer alan 4MATIC dört çeker sistemi, arkadan itişli 320i\'ye kıyasla kış şartlarının çetin geçtiği bölgelerde fiyat avantajı yaratır. Aracın fiyatı, eşdeğer donanımlı ve kilometredeki bir BMW 320i\'den yaklaşık %5 daha yüksek konumlandırılmış olsa da, "Hatasız/Boyasız" olması ve 204 beygirlik motor gücü düşünüldüğünde bu farkı hak etmektedir. Kesinlikle al-sat değil, uzun vadeli binici aracıdır.'
      },
      images: {
        front: [
          'https://placehold.co/800x600/111111/ffffff?text=Mercedes+Front+1',
          'https://placehold.co/800x600/111111/ffffff?text=Mercedes+Front+2',
          'https://placehold.co/800x600/111111/ffffff?text=Mercedes+Front+3'
        ],
        interior: [
          'https://placehold.co/800x600/222222/ffffff?text=Mercedes+Interior+1',
          'https://placehold.co/800x600/222222/ffffff?text=Mercedes+Interior+2',
          'https://placehold.co/800x600/222222/ffffff?text=Mercedes+Interior+3'
        ],
        rear: [
          'https://placehold.co/800x600/1a1a1a/ffffff?text=Mercedes+Rear+1',
          'https://placehold.co/800x600/1a1a1a/ffffff?text=Mercedes+Rear+2',
          'https://placehold.co/800x600/1a1a1a/ffffff?text=Mercedes+Rear+3'
        ]
      }
    },
    {
      title: '2020 Volkswagen Passat 1.5 TSI Business (Lokal Boyalı)',
      price: '1.450.000 TL',
      url: '#',
      market_speed_score: 85,
      price_perf_score: 88,
      condition_score: 75,
      overall_score: 83,
      ai_report: 'Açıklamada sağ arka çamurlukta lokal boya belirtilmiş ancak tramer kaydı 12.000 TL olarak girilmiş. Bu durum lokal boya için yüksek, muhtemelen plastik aksam (tampon) değişimi de mevcut. Yine de Passat D segmentinin en hızlı satılan aracıdır. Fiyatı emsallerinden 40.000 TL daha uygun tutulmuş, al-sat için fırsat yaratabilir.',
      detailed_specs: [
        { name: 'Motor Hacmi', value: '1498 cc', status: 'good', comment: 'Düşük hacmine rağmen turbo desteğiyle kasayı rahatlıkla taşıyor, vergi avantajı mükemmel.', note: '(Skoda Superb 1.5 TSI ile aynı motor)' },
        { name: 'Motor Gücü', value: '150 HP', status: 'average', comment: 'Günlük kullanım ve otoyol sürüşleri için son derece yeterli bir güç.', note: '(Peugeot 508 1.6 PureTech 180 HP sunar)' },
        { name: 'Tork', value: '250 Nm', status: 'neutral', comment: 'Rampa çıkışlarında üzmeyen, standart kullanım için optimize edilmiş bir tork.', note: '(Opel Insignia 1.5 dizeller 300 Nm torka sahiptir)' },
        { name: 'Şanzıman', value: '7 İleri DSG', status: 'mixed', comment: 'Vites geçişleri sınıfının en iyilerinden, ancak kuru kavrama olduğu için trafiğe dikkat edilmeli.', note: '(Peugeot EAT8 tam otomatik şanzımanı daha sorunsuzdur)' },
        { name: 'Çekiş', value: 'Önden Çekiş', status: 'neutral', comment: 'Standart D segmenti çekiş sistemi, kışın iyi kış lastiğiyle sorun yaratmaz.', note: '(Premium rakipleri arkadan veya dört çekerdir)' },
        { name: 'Yakıt Tüketimi', value: '6.5 lt / 100km (Karma)', status: 'good', comment: 'Benzinli bir D segmenti araca göre oldukça cimri, ACT (silindir kapatma) teknolojisi işe yarıyor.', note: '(Dizel rakipleri 5.0 lt civarı yakar)' },
        { name: 'Bagaj Hacmi', value: '586 Litre', status: 'good', comment: 'Geniş aileler ve uzun yolculuklar için devasa bir alan sunuyor.', note: '(Skoda Superb 625 Litre ile bu alanda liderdir)' },
        { name: 'Hasar Kaydı', value: '1 Lokal Boya (12.000 TL)', status: 'bad', comment: 'Tramer tutarı lokal boyaya göre yüksek, plastik aksam değişimi veya şişirme olabilir. Dikkat edilmeli.', note: '(Fiyatı bu yüzden %8 civarı uygun tutulmuş)' },
        { name: 'Kilometre', value: '84.000 km', status: 'average', comment: 'Yıllık ortalama 20 bin km yapmış, şirket veya uzun yol aracı olma ihtimali yüksek.', note: '(Emsallerine göre ortalama sayılır)' },
        { name: 'Model Yılı', value: '2020', status: 'average', comment: 'Fiyat/Performans aralığı olarak Business donanımlı B8.5 kasanın en çok tercih edilen yılı.', note: '' }
      ],
      competitor_analysis: {
        pros: ['D segmentinin en hızlı nakite çevrilebilen aracı (Altın gibi)', 'Çok geniş iç ve bagaj hacmi', 'Düşük yakıt tüketimi (ACT teknolojisi)'],
        cons: ['Business donanımında baz model hissiyatı (Eksik opsiyonlar)', 'DSG şanzıman mekatronik riski', 'Sağ arka çamurluktaki uyumsuz tramer kaydı'],
        text: 'Volkswagen Passat, Türkiye pazarında adeta bir yatırım aracı olarak görülmektedir. Skoda Superb, Peugeot 508 ve Opel Insignia gibi rakipleriyle kıyaslandığında; Superb kadar arka diz mesafesi sunmasa da veya 508 kadar sportif bir tasarıma sahip olmasa da, ikinci el piyasasında onlardan çok daha dominanttır.\n\nİlandaki aracın fiyatının piyasadan yaklaşık 40.000 TL ucuz olması ilk bakışta cazip gelse de, lokal boya için girilen 12.000 TL\'lik tramer kaydı soru işaretleri yaratmaktadır. Bu durum aracı alıp hızlıca kar elde etmek isteyen (al-sat) kullanıcılar için bir fırsatken, binici için kurumsal bir ekspertizde tampon, far veya radyatör gibi önemsenmeyecek ancak pahalı parçaların değişip değişmediğinin kontrolünü zorunlu kılar. Bütçeye göre mantıklı bir tercih.'
      },
      images: {
        front: [
          'https://placehold.co/800x600/111111/ffffff?text=Passat+Front+1',
          'https://placehold.co/800x600/111111/ffffff?text=Passat+Front+2',
          'https://placehold.co/800x600/111111/ffffff?text=Passat+Front+3'
        ],
        interior: [
          'https://placehold.co/800x600/222222/ffffff?text=Passat+Interior+1',
          'https://placehold.co/800x600/222222/ffffff?text=Passat+Interior+2',
          'https://placehold.co/800x600/222222/ffffff?text=Passat+Interior+3'
        ],
        rear: [
          'https://placehold.co/800x600/1a1a1a/ffffff?text=Passat+Rear+1',
          'https://placehold.co/800x600/1a1a1a/ffffff?text=Passat+Rear+2',
          'https://placehold.co/800x600/1a1a1a/ffffff?text=Passat+Rear+3'
        ]
      }
    },
    {
      title: '2021 BMW 320i M Sport - İlk Sahibinden',
      price: '2.850.000 TL',
      url: '#',
      market_speed_score: 90,
      price_perf_score: 85,
      condition_score: 88,
      overall_score: 88,
      ai_report: 'Boya veya değişen yok, ancak tampon çiziklerinden ufak tramerleri var. İlan fiyatı piyasadan %3 daha ucuz, hızlı satılabilir bir araç. M Sport donanımı ikinci elde en çok aranan pakettir.',
      detailed_specs: [
        { name: 'Motor Hacmi', value: '1598 cc', status: 'good', comment: 'Vergi avantajlı ancak arkadan itişli yapısıyla harika bir uyum içinde.', note: '(Mercedes C200 1.5 lt)' },
        { name: 'Motor Gücü', value: '170 HP', status: 'average', comment: 'Rakiplerine göre beygir gücü biraz düşük kalsa da ZF şanzıman açığı kapatıyor.', note: '(Mercedes C200 204 HP)' },
        { name: 'Tork', value: '250 Nm', status: 'neutral', comment: 'Günlük kullanım için yeterli, alt devirlerde canlı.', note: '(Mercedes 300 Nm)' },
        { name: 'Şanzıman', value: 'ZF 8 İleri', status: 'good', comment: 'Sınıfının tartışmasız en iyi şanzımanı, hem sportif hem sorunsuz.', note: '' },
        { name: 'Çekiş', value: 'Arkadan İtiş', status: 'mixed', comment: 'Sürüş keyfi olarak rakipsiz, ancak kış şartlarında dikkat gerektirir.', note: '(Mercedes 4MATIC sunuyor)' },
        { name: 'Yakıt Tüketimi (Ş.İçi)', value: '9.2 lt / 100km', status: 'bad', comment: 'Performanslı kullanımda yakıt tüketimi oldukça artıyor.', note: '' },
        { name: 'Bagaj Hacmi', value: '480 Litre', status: 'neutral', comment: 'D segmenti standartlarını karşılıyor, aile kullanımı için yeterli.', note: '(Passat 586 Litre)' },
        { name: 'Hasar Kaydı', value: '3.500 TL (Plastik Aksam)', status: 'average', comment: 'Metal aksamda sorun olmadığı sürece ikinci elde değer kaybettirmez.', note: '' },
        { name: 'Kilometre', value: '45.000 km', status: 'average', comment: 'Yıllık 15.000 km ortalamasıyla kullanılmış, normal seviyede.', note: '' },
        { name: 'Model Yılı', value: '2021', status: 'average', comment: 'Garantisi bitmiş olması tek dezavantajı.', note: '' }
      ],
      competitor_analysis: {
        pros: ['Sınıfının en iyi sürüş dinamikleri (ZF + Arkadan İtiş)', 'Agresif ve sportif M Sport tasarımı', 'İkinci elde nakite dönme hızı'],
        cons: ['Rakiplerine göre daha sert süspansiyon (Konfor kaybı)', 'İç mekanda C serisi kadar premium hissettirmemesi'],
        text: 'BMW 320i M Sport, D segmentinin en sportif aracıdır. Mercedes C200 lüks ve konfor odaklıyken, 320i tamamen sürücü odaklı bir makinedir. İkinci el piyasasında genç kitlenin favorisidir ve satılma hızı çok yüksektir.\n\nEğer kış şartlarının çetin olmadığı bir bölgede yaşıyorsanız ve sürüş keyfi (direksiyon hissiyatı, şanzıman tepkileri) sizin için konfordan daha ön plandaysa 320i kesinlikle doğru tercihtir. Aracın fiyatı, ufak tramerinden dolayı piyasa ortalamasının altında tutulmuş, bu da al-sat için oldukça mantıklı bir marj bırakmaktadır.'
      },
      images: {
        front: [
          'https://placehold.co/800x600/111111/ffffff?text=BMW+Front+1',
          'https://placehold.co/800x600/111111/ffffff?text=BMW+Front+2',
          'https://placehold.co/800x600/111111/ffffff?text=BMW+Front+3'
        ],
        interior: [
          'https://placehold.co/800x600/222222/ffffff?text=BMW+Interior+1',
          'https://placehold.co/800x600/222222/ffffff?text=BMW+Interior+2',
          'https://placehold.co/800x600/222222/ffffff?text=BMW+Interior+3'
        ],
        rear: [
          'https://placehold.co/800x600/1a1a1a/ffffff?text=BMW+Rear+1',
          'https://placehold.co/800x600/1a1a1a/ffffff?text=BMW+Rear+2',
          'https://placehold.co/800x600/1a1a1a/ffffff?text=BMW+Rear+3'
        ]
      }
    }
  ];

  const summaryData = {
    title: 'Çoklu Araç Kıyaslama ve Karar Raporu',
    logic: 'Mercedes (92) > BMW (88) > Passat (83)',
    podium: [
      { rank: 1, car: mockResults[0], medal: 'Altın', color: 'text-yellow-500', bg: 'bg-yellow-500/10', reason: 'Mercedes-Benz C200, sınıfındaki en yüksek araç durumu skoru (98) ile zirveye oturuyor. Hatasız ve boyasız kondisyonu, ikinci el pazarında araca anında nakite çevrilebilme (likidite) garantisi veriyor. 204 beygirlik motoruyla hem BMW hem de Passat’tan çok daha güçlü olmasına rağmen hafif hibrit sistemi sayesinde makul yakıt tüketimi sunuyor. 4MATIC çekiş sistemi ise kış aylarında veya zorlu yol şartlarında BMW 320i’nin arkadan itişli yapısına göre çok daha güvenli ve risksiz bir profil çiziyor. Fiyatının piyasa ortalamasına oldukça yakın olması (sadece %2 pahalı), sunduğu donanım seviyesi ve hasarsızlık dikkate alındığında onu en mantıklı ve prestijli yatırım aracı yapıyor.' },
      { rank: 2, car: mockResults[2], medal: 'Gümüş', color: 'text-gray-400', bg: 'bg-gray-400/10', reason: 'Sürüş dinamikleri ve şasi rijitliği konusunda tartışmasız lider olan BMW 320i M Sport, C200’ün hemen arkasında yer alıyor. ZF 8 ileri şanzımanı ve arkadan itiş mimarisi sürüş keyfini maksimize etse de, konfor anlamında Mercedes’in gerisinde kalıyor. Aracın 170 HP’lik gücü Mercedes’in (204 HP) gerisinde; ayrıca kaporta üzerindeki ufak tramer (3.500 TL plastik aksam) aracı "kusursuz" statüsünden düşürüyor. Buna rağmen genç kitleye hitap etmesi, M Sport paketi ve agresif fiyatlandırması (piyasanın %3 altında), onun ikinci elde Passat kadar hızlı satılmasını sağlıyor.' },
      { rank: 3, car: mockResults[1], medal: 'Bronz', color: 'text-amber-600', bg: 'bg-amber-600/10', reason: 'Volkswagen Passat, 1.450.000 TL gibi oldukça ulaşılabilir bir bütçeyle "Fiyat/Performans" kategorisini domine etmesine rağmen, kurumsal risk analizinde 3. sırada kalıyor. Aracın sağ arka çamurluğundaki lokal boyaya rağmen 12.000 TL gibi yüksek bir tramer yansıtılması ekspertiz tarafında soru işaretleri yaratıyor. Ayrıca kuru kavramalı 7 ileri DSG şanzımanın uzun vadeli mekatronik riskleri ve sadece 150 HP güç üretmesi, onu C200 ve 320i’nin premium dinamiklerinden ayırıyor. Fakat "Altın" gibi hızlı nakite dönen yapısı ve devasa bagaj hacmi (586L), onu bütçe kısıtı olanlar veya hızlı al-sat yapmak isteyenler için hala çok cazip bir tercih kılıyor.' }
    ],
    details: [
      { title: 'Performans Lideri', winner: 'Mercedes-Benz (204 HP / 300 Nm)', icon: <Zap className="text-blue-500"/>, desc: '1.5 litrelik motorundan elde ettiği 204 HP güç ile BMW 320i (170 HP) ve Passat (150 HP) modellerini açık ara geride bırakıyor. Hafif hibrit desteği kalkışlarda turbo boşluğunu yok ederek 0-100 km/s hızlanmasını (7.1 sn) pürüzsüz hale getiriyor.' },
      { title: 'Fiyat/Performans Lideri', winner: 'Volkswagen Passat (1.450.000 TL)', icon: <TrendingUp className="text-green-500"/>, desc: 'D segmentine giriş için en mantıklı bütçeyi sunuyor. Mercedes ve BMW\'nin neredeyse yarı fiyatına devasa bir iç hacim, ACT destekli çok düşük yakıt tüketimi (6.5 lt) ve anında nakite dönebilen bir ikinci el piyasası vaat ediyor.' },
      { title: 'Sürüş Dinamikleri', winner: 'BMW 320i (ZF 8 İleri + Arkadan İtiş)', icon: <Gauge className="text-red-500"/>, desc: 'Viraj performansı, ağırlık dağılımı (50:50) ve ZF şanzımanın kusursuz vites küçültme tepkileriyle sürüş keyfi arayanların rakipsiz seçeneği. Direksiyon hissiyatı ve şasi dengesi konusunda Mercedes ve VW’den çok daha sportif bir DNA sunuyor.' }
    ],
    logic_text: 'Sistem algoritması; sadece beygir gücünü veya fiyatı değil, "Hasar Kaydı / Fiyat Orantısı", "Satılma Hızı" ve "Kronik Sorun Riski" metriklerini de çaprazlamaktadır. Mercedes-Benz C200, hatasız gövdesi ve dört çeker sisteminin yarattığı güven hissiyle 92 puan alarak liderliğe yerleşiyor. BMW 320i sürüş keyfinde zirvede olsa da, konfor eksiklikleri ve ufak tramer kaydıyla 88 puana düşüyor. Passat ise ikinci el piyasasında çok hızlı el değiştiren "altın" değerinde bir araç olmasına karşın, lokal boyasındaki tramer uyumsuzluğu ve DSG şanzıman riskleri sebebiyle araç durumu skorundan ciddi ceza yiyerek (75 puan) genel sıralamada 83 puanla son sıraya yerleşiyor.',
    tableData: [
      { feature: 'Fiyat', merc: '3.150.000 TL', bmw: '2.850.000 TL', passat: '1.450.000 TL' },
      { feature: 'Motor Gücü', merc: '204 HP', bmw: '170 HP', passat: '150 HP' },
      { feature: 'Tork', merc: '300 Nm', bmw: '250 Nm', passat: '250 Nm' },
      { feature: 'Şanzıman', merc: '9 İleri G-Tronic', bmw: '8 İleri ZF', passat: '7 İleri DSG' },
      { feature: 'Çekiş', merc: '4MATIC (4x4)', bmw: 'Arkadan İtiş', passat: 'Önden Çekiş' },
      { feature: '0-100 km/s', merc: '7.1 sn', bmw: '8.1 sn', passat: '8.7 sn' },
      { feature: 'Yakıt Tüketimi', merc: '8.5 lt / 100km', bmw: '9.2 lt / 100km', passat: '6.5 lt / 100km' },
      { feature: 'Bagaj Hacmi', merc: '455 Litre', bmw: '480 Litre', passat: '586 Litre' },
      { feature: 'Araç Durumu Puanı', merc: '98 (Hatasız)', bmw: '88 (Ufak Tramer)', passat: '75 (Lokal Boya + Tramer)' },
    ]
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cars, setCars] = useState([]);
  
  // Supabase Veritabanından Veri Çekme Simülasyonu (Eklenti -> AI -> React döngüsü)
  useEffect(() => {
    // Gerçekte burada: supabase.from('analyzed_cars').select('*').eq('user_id', currentUser) çalışacak.
    // Şimdilik API anahtarları girilmediği için Simülasyon modunda testimizi yapıyoruz.
    const fetchFromDatabase = async () => {
      setIsLoading(true);
      // Gerçekçilik katmak için 2.5 saniyelik bir veritabanı/AI bekleme süresi koyalım
      setTimeout(() => {
        setCars(mockResults);
        setIsLoading(false);
      }, 2500);
    };
    
    fetchFromDatabase();
  }, []);

  const totalSlides = cars.length > 0 ? cars.length + 1 : 1; // 1 for Summary + 3 Cars

  const nextCar = () => {
    setCurrentIndex(prev => (prev < totalSlides - 1 ? prev + 1 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const prevCar = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="text-green-500 shrink-0" size={18} />;
      case 'bad':
        return <XCircle className="text-red-500 shrink-0" size={18} />;
      case 'mixed':
      case 'neutral':
        return <HelpCircle className="text-gray-400 shrink-0" size={18} />;
      case 'average':
        return <Star className="text-yellow-500 fill-yellow-500 shrink-0" size={18} />;
      default:
        return <Minus className="text-gray-400 shrink-0" size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black overflow-hidden font-sans relative selection:bg-black selection:text-white pt-10 pb-20">
      <div className="flex flex-col h-full items-center justify-center relative max-w-7xl mx-auto">
        
        {/* Nav Controls */}
        <div className="absolute top-0 w-full flex justify-between items-center px-4">
          <button 
            onClick={prevCar} 
            disabled={currentIndex === 0}
            className="p-4 text-black hover:scale-110 disabled:opacity-20 transition-all duration-300"
          >
            <ChevronLeft size={48} strokeWidth={1} />
          </button>
          
          <div className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
            {currentIndex === 0 ? '⭐ GENEL KIYASLAMA' : `ARAÇ 0${currentIndex} —————— 0${cars.length}`}
          </div>

          <button 
            onClick={nextCar} 
            disabled={currentIndex === totalSlides - 1 || isLoading}
            className="p-4 text-black hover:scale-110 disabled:opacity-20 transition-all duration-300"
          >
            <ChevronRight size={48} strokeWidth={1} />
          </button>
        </div>

        <style>{`
          @keyframes slideIn {
            0% { opacity: 0; transform: translateX(20px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in {
            animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.98); }
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }
        `}</style>

        {isLoading ? (
          <div className="w-full max-w-6xl mt-24 border-2 border-black/5 rounded-[3rem] p-16 md:p-32 bg-white/50 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center animate-pulse-slow">
            <div className="bg-black text-white p-6 rounded-full mb-8 shadow-2xl">
              <Sparkles size={48} className="text-[#D4AF37]" />
            </div>
            <h2 className="text-3xl font-display font-black tracking-tight text-black mb-4">Veritabanına Bağlanılıyor...</h2>
            <p className="text-black/50 font-bold tracking-widest text-sm uppercase text-center max-w-md">
              Eklenti üzerinden gönderilen araçlar Supabase'den çekiliyor ve yapay zeka tarafından analiz ediliyor.
              <br/><br/>
              (Sistem Simülasyon Modunda Test Ediliyor)
            </p>
          </div>
        ) : (
          <div key={currentIndex} className="w-full max-w-6xl mt-24 border-2 border-black/5 rounded-[3rem] p-8 md:p-12 bg-white/50 backdrop-blur-sm animate-slide-in shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative">
            
            {currentIndex === 0 ? (
              /* YILDIZ SAYFASI (GENEL KIYASLAMA) */
              <div className="flex flex-col gap-16">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-8 shadow-xl shadow-black/20">
                    <Sparkles size={16} className="text-[#D4AF37]" /> AI Kıyaslama Raporu
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-4 text-black">Hangi Aracı Almalısınız?</h2>
                  <p className="text-black/50 font-bold tracking-wider max-w-2xl mx-auto">Sisteme yüklediğiniz {cars.length} aracın yapay zeka tarafından yapılan çapraz analizi ve sıralaması aşağıdadır.</p>
                </div>

              {/* Podium (Top 3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {summaryData.podium.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-[2rem] p-8 border border-black/5 shadow-embossed relative overflow-hidden group hover:shadow-embossed-hover transition-all duration-500 flex flex-col">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-700">
                      <Trophy size={80} className={item.color} />
                    </div>
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 ${item.bg} ${item.color}`}>
                      <span className="font-display font-black text-2xl">{item.rank}</span>
                    </div>
                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase mb-2">
                      {item.medal} Madalya — {item.car.overall_score} Puan
                    </h3>
                    <h4 className="text-xl font-display font-black tracking-tight text-black mb-4 pr-12 line-clamp-2">
                      {item.car.title}
                    </h4>
                    <p className="text-sm font-bold text-black/70 leading-relaxed relative z-10 flex-1">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>

              {/* Scoring Logic & Math */}
              <div className="bg-black text-white rounded-[2.5rem] p-10 md:p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-8">Matematiksel Puanlama Mantığı</h3>
                <div className="flex flex-wrap justify-center items-center gap-4 text-3xl md:text-5xl font-display font-black tracking-tighter">
                  <span className="text-white">MERCEDES (92)</span>
                  <span className="text-[#D4AF37]">&gt;</span>
                  <span className="text-white/80">BMW (88)</span>
                  <span className="text-[#D4AF37]">&gt;</span>
                  <span className="text-white/50">PASSAT (83)</span>
                </div>
                <p className="text-white/70 mt-8 max-w-3xl mx-auto text-sm md:text-base font-bold leading-loose tracking-wide">
                  {summaryData.logic_text}
                </p>
              </div>

              {/* Details Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryData.details.map((detail, idx) => (
                  <div key={idx} className="bg-[#F5F5F7] rounded-[2rem] p-8 shadow-inner-embossed flex flex-col justify-between">
                    <div>
                      <div className="mb-4">{detail.icon}</div>
                      <div className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase mb-2">{detail.title}</div>
                      <div className="text-lg font-display font-black tracking-tight text-black mb-4">{detail.winner}</div>
                    </div>
                    <div className="text-sm font-bold text-black/60">{detail.desc}</div>
                  </div>
                ))}
              </div>

              <div className="w-full h-[1px] bg-black/10 my-4"></div>

              {/* Teknik Kıyaslama Tablosu */}
              <div>
                <h3 className="text-2xl font-display font-black tracking-tight text-black mb-8 flex items-center gap-4">
                  <Table2 className="text-black/30" /> Teknik Özellik Kıyaslama Tablosu
                </h3>
                <div className="bg-white rounded-[2rem] border border-black/5 shadow-embossed overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#F5F5F7] border-b border-black/5">
                        <th className="p-6 text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase rounded-tl-[2rem]">Özellik</th>
                        <th className="p-6 text-[10px] font-bold tracking-[0.2em] text-black/80 uppercase">Mercedes C200</th>
                        <th className="p-6 text-[10px] font-bold tracking-[0.2em] text-black/80 uppercase">BMW 320i</th>
                        <th className="p-6 text-[10px] font-bold tracking-[0.2em] text-black/80 uppercase rounded-tr-[2rem]">VW Passat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.tableData.map((row, idx) => (
                        <tr key={idx} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                          <td className="p-6 text-sm font-bold text-black/70">{row.feature}</td>
                          <td className={`p-6 font-display font-black text-black ${row.merc.includes('98') || row.merc.includes('204') || row.merc.includes('4MATIC') ? 'text-green-600' : ''}`}>{row.merc}</td>
                          <td className={`p-6 font-display font-black text-black ${row.bmw.includes('Arkadan') ? 'text-blue-600' : ''}`}>{row.bmw}</td>
                          <td className={`p-6 font-display font-black text-black ${row.passat.includes('1.450') || row.passat.includes('586') || row.passat.includes('6.5') ? 'text-green-600' : ''}`}>{row.passat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="w-full h-[1px] bg-black/10 my-4"></div>

              {/* Görsel Kıyaslama */}
              <div>
                <h3 className="text-2xl font-display font-black tracking-tight text-black mb-12 flex items-center gap-4">
                  <ImageIcon className="text-black/30" /> Görsel Kıyaslama
                </h3>
                <div className="space-y-16">
                  
                  {/* Önden Görünüm */}
                  <div>
                    <h4 className="text-xs font-bold tracking-[0.2em] text-black/40 uppercase mb-6 pl-4 border-l-4 border-black/20">Önden Görünüm Kıyaslaması</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {cars.map((car, idx) => (
                        <div key={idx} className="rounded-2xl overflow-hidden shadow-embossed bg-white p-2">
                          <img src={car.images.front[0]} alt={car.title} className="w-full h-48 object-cover rounded-xl hover:scale-105 transition-transform duration-500" />
                          <div className="text-center pt-4 pb-2 text-[10px] font-bold tracking-widest text-black/60 uppercase">{idx === 0 ? 'MERCEDES' : idx === 1 ? 'PASSAT' : 'BMW'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* İç Mekan */}
                  <div>
                    <h4 className="text-xs font-bold tracking-[0.2em] text-black/40 uppercase mb-6 pl-4 border-l-4 border-black/20">İç Mekan Kıyaslaması</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {cars.map((car, idx) => (
                        <div key={idx} className="rounded-2xl overflow-hidden shadow-embossed bg-white p-2">
                          <img src={car.images.interior[0]} alt={car.title} className="w-full h-48 object-cover rounded-xl hover:scale-105 transition-transform duration-500" />
                          <div className="text-center pt-4 pb-2 text-[10px] font-bold tracking-widest text-black/60 uppercase">{idx === 0 ? 'MERCEDES' : idx === 1 ? 'PASSAT' : 'BMW'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arkadan Görünüm */}
                  <div>
                    <h4 className="text-xs font-bold tracking-[0.2em] text-black/40 uppercase mb-6 pl-4 border-l-4 border-black/20">Arkadan Görünüm Kıyaslaması</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {cars.map((car, idx) => (
                        <div key={idx} className="rounded-2xl overflow-hidden shadow-embossed bg-white p-2">
                          <img src={car.images.rear[0]} alt={car.title} className="w-full h-48 object-cover rounded-xl hover:scale-105 transition-transform duration-500" />
                          <div className="text-center pt-4 pb-2 text-[10px] font-bold tracking-widest text-black/60 uppercase">{idx === 0 ? 'MERCEDES' : idx === 1 ? 'PASSAT' : 'BMW'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Next Slide CTA */}
              <div className="flex justify-center mt-12 mb-8">
                <button 
                  onClick={nextCar}
                  className="bg-black text-white px-10 py-5 rounded-full font-bold tracking-widest text-xs uppercase flex items-center gap-4 hover:scale-105 transition-all shadow-2xl shadow-black/30"
                >
                  Araçları Tek Tek İncele <ArrowRight size={18} />
                </button>
              </div>

            </div>
          ) : (
            /* TEKİL ARAÇ İNCELEME SAYFASI */
            (function() {
              const currentCar = cars[currentIndex - 1];
              return (
                <div>
                  {/* Main Hero & Metrics */}
                  <div className="flex flex-col xl:flex-row gap-20 mb-20">
                    <div className="flex-1">
                      <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-8 leading-[1.1] text-black">{currentCar.title}</h2>
                      <div className="text-3xl font-display font-black tracking-tight text-black mb-16">
                        {currentCar.price}
                      </div>
                      
                      <div className="relative pl-8 border-l-4 border-black">
                        <h3 className="text-black font-display font-black tracking-[0.2em] text-[10px] uppercase mb-4 flex items-center gap-3">
                          <Star size={14} /> AI Analizi
                        </h3>
                        <p className="text-sm font-bold text-black/60 leading-loose tracking-wider">
                          {currentCar.ai_report}
                        </p>
                      </div>
                    </div>

                    <div className="w-full xl:w-[350px] flex flex-col gap-4">
                      <div className="bg-[#F5F5F7] rounded-[2rem] p-10 text-center relative overflow-hidden group shadow-inner-embossed">
                        <div className="text-black/40 font-bold text-[10px] tracking-[0.2em] uppercase mb-4">Genel Skor</div>
                        <div className="text-8xl md:text-9xl font-display font-black tracking-tighter text-black">
                          {currentCar.overall_score}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 mt-4">
                        <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 flex justify-between items-center shadow-embossed hover:shadow-embossed-hover transition-all duration-500">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-[#F5F5F7] rounded-full shadow-inner-embossed"><Zap className="text-black" size={16} strokeWidth={2} /></div>
                            <span className="font-bold tracking-widest text-[10px] text-black uppercase">Satış Hızı</span>
                          </div>
                          <div className="text-2xl font-display font-black tracking-tighter text-black">{currentCar.market_speed_score}</div>
                        </div>

                        <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 flex justify-between items-center shadow-embossed hover:shadow-embossed-hover transition-all duration-500">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-[#F5F5F7] rounded-full shadow-inner-embossed"><TrendingUp className="text-black" size={16} strokeWidth={2} /></div>
                            <span className="font-bold tracking-widest text-[10px] text-black uppercase">Fiyat Performans</span>
                          </div>
                          <div className="text-2xl font-display font-black tracking-tighter text-black">{currentCar.price_perf_score}</div>
                        </div>

                        <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 flex justify-between items-center shadow-embossed hover:shadow-embossed-hover transition-all duration-500">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-[#F5F5F7] rounded-full shadow-inner-embossed"><CheckCircle className="text-black" size={16} strokeWidth={2} /></div>
                            <span className="font-bold tracking-widest text-[10px] text-black uppercase">Araç Durumu</span>
                          </div>
                          <div className="text-2xl font-display font-black tracking-tighter text-black">{currentCar.condition_score}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-black/10 mb-20"></div>

                  {/* Section 2: Detaylı Araç Özellikleri */}
                  <div className="mb-20">
                    <h3 className="text-2xl font-display font-black tracking-tight text-black mb-8 flex items-center gap-4">
                      <Settings className="text-black/30" /> Detaylı Araç Özellikleri
                    </h3>
                    
                    <div className="flex flex-col gap-4">
                      {currentCar.detailed_specs.map((spec, index) => (
                        <div key={index} className="bg-white border border-black/5 p-6 md:p-8 rounded-[2rem] shadow-embossed hover:shadow-embossed-hover transition-all duration-300 flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                          <div className="w-full md:w-1/3 shrink-0">
                            <div className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase mb-2">{spec.name}</div>
                            <div className="text-xl font-display font-black tracking-tight text-black">{spec.value}</div>
                          </div>
                          
                          <div className="w-full md:w-2/3 border-t md:border-t-0 md:border-l border-black/5 pt-4 md:pt-0 md:pl-8">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">{renderStatusIcon(spec.status)}</div>
                              <div>
                                <p className="text-sm font-bold text-black/70 leading-relaxed mb-2">
                                  {spec.comment}
                                </p>
                                {spec.note && (
                                  <p className="text-[11px] font-bold tracking-wider text-black/40 italic">
                                    {spec.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-black/10 mb-20"></div>

                  {/* Section 3: Kıyaslama ve Rakip Analizi */}
                  <div className="mb-20">
                    <h3 className="text-2xl font-display font-black tracking-tight text-black mb-8 flex items-center gap-4">
                      <Maximize className="text-black/30" /> Rakiplerine Göre Analiz
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                      <div className="bg-[#F5F5F7] p-8 rounded-[2rem] shadow-inner-embossed">
                        <div className="text-[10px] font-bold tracking-[0.2em] text-green-600 uppercase mb-6 flex items-center gap-2"><CheckCircle size={14}/> Avantajlı Yönleri</div>
                        <ul className="space-y-4">
                          {currentCar.competitor_analysis.pros.map((p, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm font-bold text-black/70">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-[#F5F5F7] p-8 rounded-[2rem] shadow-inner-embossed">
                        <div className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase mb-6 flex items-center gap-2"><AlertTriangle size={14}/> Zayıf Yönleri</div>
                        <ul className="space-y-4">
                          {currentCar.competitor_analysis.cons.map((p, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm font-bold text-black/70">
                              <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0"></div>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-black text-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Maximize size={120} />
                      </div>
                      <div className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-6 relative z-10 flex items-center gap-3">
                        <Star size={14} className="text-[#D4AF37]" /> AI Rakip Kıyaslaması
                      </div>
                      <div className="relative z-10 space-y-6">
                        {currentCar.competitor_analysis.text.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="text-sm md:text-base font-bold leading-loose tracking-wide text-white/90">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-black/10 mb-20"></div>

                  {/* Section 4: Araç Resimleri (Yeni Galeri Bölümü) */}
                  <div>
                    <h3 className="text-2xl font-display font-black tracking-tight text-black mb-8 flex items-center gap-4">
                      <ImageIcon className="text-black/30" /> Araç Görselleri
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-2 rounded-2xl shadow-embossed group cursor-pointer">
                        <div className="rounded-xl overflow-hidden relative">
                          <img src={currentCar.images.front[0]} alt="Ön Görünüm" className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white font-bold tracking-widest text-xs uppercase">
                            <Maximize className="mb-2" size={32} />
                            Önden Görünüm
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-2 rounded-2xl shadow-embossed group cursor-pointer">
                        <div className="rounded-xl overflow-hidden relative">
                          <img src={currentCar.images.interior[0]} alt="İç Mekan" className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white font-bold tracking-widest text-xs uppercase">
                            <Maximize className="mb-2" size={32} />
                            İç Mekan
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-2 rounded-2xl shadow-embossed group cursor-pointer">
                        <div className="rounded-xl overflow-hidden relative">
                          <img src={currentCar.images.rear[0]} alt="Arka Görünüm" className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white font-bold tracking-widest text-xs uppercase">
                            <Maximize className="mb-2" size={32} />
                            Arkadan Görünüm
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                      <button className="bg-[#F5F5F7] text-black px-10 py-5 rounded-full font-bold tracking-widest text-xs uppercase hover:bg-black hover:text-white transition-all duration-300 shadow-inner-embossed border border-black/5 hover:shadow-2xl hover:shadow-black/20 flex items-center justify-center gap-3">
                        <ImageIcon size={18} /> Daha Fazla Görsel Göster
                      </button>
                      <a href={currentCar.url} target="_blank" rel="noopener noreferrer" className="bg-[#FFCC00] text-black px-10 py-5 rounded-full font-bold tracking-widest text-xs uppercase hover:scale-105 transition-all duration-300 shadow-xl shadow-[#FFCC00]/20 flex items-center justify-center gap-3">
                        İlan Linkine Git <ArrowRight size={18} />
                      </a>
                    </div>
                  </div>

                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
