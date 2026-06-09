// AutoCAR Master AI - Content Script

function syncApiKey() {
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
            console.log("AutoCAR Master AI: Kullanıcı verileri Supabase bağlantısı için eşitlendi.");
          });
        }
      });
    }
  } catch (e) {
    console.error("AutoCAR Sync Error:", e);
  }
}

// Portal senkronizasyonu
if (window.location.href.includes('vercel.app') || window.location.href.includes('localhost')) {
  syncApiKey();
  setInterval(syncApiKey, 2000);
}

// Pasif Veri Toplayıcı Fonksiyon
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

  // Sadece gerçek ilan detay sayfalarını kabul et
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

// Pasif Toplama
if (window.location.href.includes('/ilan/')) {
  setTimeout(() => {
    const data = extractPageData();
    if (data && data.title) {
      chrome.runtime.sendMessage({ action: 'passive_extract', data: data });
    }
  }, 1000);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_data') {
    sendResponse(extractPageData());
  }
});
