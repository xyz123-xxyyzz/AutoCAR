let processedTabs = new Set();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Sadece sahibinden veya arabam.com ilan detay sayfalarında çalışsın
    if (tab.url.includes('sahibinden.com/ilan/') || tab.url.includes('arabam.com/ilan/')) {
      
      chrome.storage.local.get(['autocar_running'], (res) => {
        if (res.autocar_running && !processedTabs.has(tabId)) {
          // Bu sekmeyi işlendi olarak işaretle
          processedTabs.add(tabId);
          
          // Content script'i enjekte et ve veriyi çek
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          }, () => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            } else {
              // Biraz bekle (sayfanın DOM tam otursun diye)
              setTimeout(() => {
                chrome.tabs.sendMessage(tabId, { action: "extract_data" }, (response) => {
                  if (response && response.title) {
                    // Veriyi çektik, Vercel portalını aç
                    openPortalWithData([response]);
                    
                    // İsteğe bağlı: Bir kere çalıştıktan sonra eklentiyi "Durdur" moduna al
                    // ki kullanıcı sayfada gezerken sürekli popup açılmasın
                    chrome.storage.local.set({ autocar_running: false });
                  }
                });
              }, 1000);
            }
          });
        }
      });
    }
  }
});

// Eski manuel analiz isteği için fallback (eğer popup'tan tetiklenirse diye)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze_tabs') {
    // (Manuel kullanım artık pek olmayacak ama kalabilir)
    sendResponse({ success: true });
  }
});

function openPortalWithData(results) {
  const portalUrl = "https://auto-car-gold.vercel.app/analiz";
  
  chrome.tabs.create({ url: portalUrl }, (tab) => {
    // Sayfanın yüklenmesini bekleyip veriyi enjekte et
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (data) => {
            window.localStorage.setItem('autocar_pending_analysis', JSON.stringify(data));
            // React uygulamasının veriyi alması için event fırlat
            window.dispatchEvent(new Event('autocar_data_ready'));
          },
          args: [results]
        });
      }
    });
  });
}

// Sekme kapandığında processed set'inden temizle
chrome.tabs.onRemoved.addListener((tabId) => {
  processedTabs.delete(tabId);
});
