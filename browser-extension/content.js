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
