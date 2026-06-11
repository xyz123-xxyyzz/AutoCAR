// content.js
const syncApiKey = () => {
  // Sadece kendi web portal─▒m─▒zdaysak senkronizasyon yap
  if (!window.location.href.includes('vercel.app') && !window.location.href.includes('localhost')) {
    return;
  }

  try {
    const email = window.localStorage.getItem('userEmail');
    const deviceId = window.localStorage.getItem('autocar_device_id');

    if (email && deviceId) {
      chrome.storage.local.get(['userEmail', 'deviceId'], (res) => {
        let updates = {};
        if (res.userEmail !== email) updates.userEmail = email;
        if (res.deviceId !== deviceId) updates.deviceId = deviceId;

        if (Object.keys(updates).length > 0) {
          chrome.storage.local.set(updates, () => {
            console.log("AutoCAR Extension: Email & Device ID successfully synced.");
          });
        }
      });
    }
  } catch (e) {
    console.error("AutoCAR Extension Error:", e);
  }
};

// Sadece portaldayken periyodik kontrol et
if (window.location.href.includes('vercel.app') || window.location.href.includes('localhost')) {
  syncApiKey();
  setInterval(syncApiKey, 2000);
}

function extractPageData() {
  const isSahibinden = window.location.href.includes('sahibinden.com');
  const isArabam = window.location.href.includes('arabam.com');

  if (!isSahibinden && !isArabam) return null;

  let title = document.title;
  let price = '';
  
  if (isSahibinden) {
    title = document.querySelector('.classifiedDetailTitle h1')?.innerText || title;
    price = document.querySelector('.classifiedInfo h3')?.innerText || '';
  } else if (isArabam) {
    title = document.querySelector('.product-name-container h1')?.innerText || title;
    price = document.querySelector('.product-price')?.innerText || '';
  }

  let fullText = document.body.innerText;
  fullText = fullText.slice(0, 10000);

  let cleanPrice = price.trim();
  if (cleanPrice.includes('Kredi')) {
    cleanPrice = cleanPrice.split('Kredi')[0].trim();
  }

  // Sadece ba┼şl─▒─ş─▒ veya fiyat─▒ olan (ger├ğek bir ilan) sayfalar─▒ kabul et
  if (!cleanPrice && !document.querySelector('.classifiedDetailTitle h1')) {
     return null;
  }

  return {
    title: title.trim().replace(/\s+/g, ' '),
    price: cleanPrice,
    url: window.location.href,
    fullText: fullText
  };
}

// Pasif Toplay─▒c─▒: Sayfa a├ğ─▒ld─▒─ş─▒nda otomatik veriyi ├ğek ve background'a g├Ânder
if (window.location.href.includes('/ilan/')) {
  // DOM'un y├╝klenmesini biraz bekle ki fiyat vs. tam dolsun
  setTimeout(() => {
    const data = extractPageData();
    if (data && data.title) {
      chrome.runtime.sendMessage({ action: 'passive_extract', data: data });
    }
  }, 1000);
}

// Sayfadaki ara├ğ verilerini ├ğeken ana fonksiyon
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_data') {
    try {
      const isSahibinden = window.location.href.includes('sahibinden.com');
      const isArabam = window.location.href.includes('arabam.com');

      let title = document.title;
      let price = '';
      
      if (isSahibinden) {
        title = document.querySelector('.classifiedDetailTitle h1')?.innerText || title;
        price = document.querySelector('.classifiedInfo h3')?.innerText || '';
      } else if (isArabam) {
        title = document.querySelector('.product-name-container h1')?.innerText || title;
        price = document.querySelector('.product-price')?.innerText || '';
      }

      // Sadece temizlenmi┼ş saf metni (HTML etiketleri olmadan) al─▒yoruz
      let fullText = document.body.innerText;
      
      // OpenAI'ye gidece─şi i├ğin gereksiz ba┼şl─▒klar─▒ k─▒rp─▒p ilk 10.000 karakteri (en dolu k─▒sm─▒) al─▒yoruz
      fullText = fullText.slice(0, 10000);

      let cleanPrice = price.trim();
      if (cleanPrice.includes('Kredi')) {
        cleanPrice = cleanPrice.split('Kredi')[0].trim();
      }

      const result = {
        title: title.trim().replace(/\s+/g, ' '),
        price: cleanPrice,
        url: window.location.href,
        fullText: fullText
      };

      sendResponse(result);
    } catch (error) {
      console.error("AutoCAR Scraping Error:", error);
      sendResponse({ error: error.toString() });
    }
  }

  if (request.action === 'extract_urls') {
    try {
      const isSahibinden = window.location.href.includes('sahibinden.com');
      const isArabam = window.location.href.includes('arabam.com');
      let vehicles = [];
      let nextPageUrl = null;

      if (isSahibinden) {
        // Sahibinden arama sonu├ğ sayfas─▒ndaki ilan linkleri ve sat─▒r verileri
        const rows = document.querySelectorAll('tr.searchResultsItem, .searchResultsItem');
        rows.forEach(row => {
          const a = row.querySelector('a.classifiedTitle');
          if (a && a.href && a.href.includes('/ilan/')) {
            // Sadece benzersiz URL'leri ekle
            if (!vehicles.find(v => v.url === a.href)) {
              let priceEl = row.querySelector('.searchResultsPriceValue');
              let rawText = row.innerText.replace(/\s+/g, ' ').trim();
              vehicles.push({
                url: a.href,
                title: a.innerText.trim(),
                price: priceEl ? priceEl.innerText.trim() : '',
                fullText: rawText // Sat─▒rdaki Model, Y─▒l, KM, Fiyat gibi ├Âzet bilgileri bar─▒nd─▒r─▒r
              });
            }
          }
        });
        
        // Sonraki sayfa linkini bul (Pagination)
        const nextBtn = document.querySelector('a.prevNextBut[title="Sonraki"]');
        if (nextBtn && nextBtn.href) {
          nextPageUrl = nextBtn.href;
        }
      } else if (isArabam) {
        // Arabam.com arama sonu├ğ sayfas─▒ndaki ilan linkleri
        const rows = document.querySelectorAll('.listing-list-item, .list-item, tr'); 
        rows.forEach(row => {
          const a = row.querySelector('a.link-default-blue, a.listing-text-new');
          if (a && a.href && a.href.includes('/ilan/')) {
            if (!vehicles.find(v => v.url === a.href)) {
              let rawText = row.innerText.replace(/\s+/g, ' ').trim();
              let priceEl = row.querySelector('.product-price, .price');
              vehicles.push({
                url: a.href,
                title: a.innerText.trim() || rawText.substring(0, 50),
                price: priceEl ? priceEl.innerText.trim() : '',
                fullText: rawText
              });
            }
          }
        });
        
        // Sonraki sayfa linkini bul
        const nextBtn = document.querySelector('a.page-link.next') || document.querySelector('a[aria-label="Next"]');
        if (nextBtn && nextBtn.href) {
          nextPageUrl = nextBtn.href;
        }
      }

      sendResponse({ vehicles: vehicles, nextPageUrl: nextPageUrl });
    } catch (error) {
      console.error("AutoCAR Extract URLs Error:", error);
      sendResponse({ error: error.toString(), vehicles: [], nextPageUrl: null });
    }
  }

  return true;
});
