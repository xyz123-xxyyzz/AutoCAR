// content.js
const syncApiKey = () => {
  try {
    const apiKey = window.localStorage.getItem('openai_api_key');
    if (apiKey && apiKey.trim().length > 0) {
      chrome.storage.local.get(['openai_api_key'], (res) => {
        if (res.openai_api_key !== apiKey) {
          chrome.storage.local.set({ openai_api_key: apiKey }, () => {
            console.log("AutoCAR Extension: API Key successfully synced from Web Portal.");
          });
        }
      });
    }
  } catch (e) {
    console.error("AutoCAR Extension Error:", e);
  }
};

// İlk açılışta kontrol et
syncApiKey();

// Giriş yapılması ihtimaline karşı periyodik olarak kontrol et
setInterval(syncApiKey, 2000);

// Sayfadaki araç verilerini çeken ana fonksiyon
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

      // Sadece temizlenmiş saf metni (HTML etiketleri olmadan) alıyoruz
      let fullText = document.body.innerText;
      
      // OpenAI'ye gideceği için gereksiz başlıkları kırpıp ilk 10.000 karakteri (en dolu kısmı) alıyoruz
      fullText = fullText.slice(0, 10000);

      const result = {
        title: title.trim().replace(/\s+/g, ' '),
        price: price.trim(),
        url: window.location.href,
        fullText: fullText
      };

      sendResponse(result);
    } catch (error) {
      console.error("AutoCAR Scraping Error:", error);
      sendResponse({ error: error.toString() });
    }
  }
  return true;
});
