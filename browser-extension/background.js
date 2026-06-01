chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze_tabs') {
    const tabs = request.tabs;
    let results = [];
    let completedCount = 0;

    tabs.forEach(tab => {
      // Content script enjekte edip veri topla
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          checkCompletion();
        } else {
          chrome.tabs.sendMessage(tab.id, { action: "extract_data" }, (response) => {
            if (response && response.title) {
              results.push(response);
            }
            checkCompletion();
          });
        }
      });
    });

    function checkCompletion() {
      completedCount++;
      if (completedCount === tabs.length) {
        processResults(results);
        sendResponse({ success: true });
      }
    }
    
    return true; // Asenkron yanıt için
  }
});

function processResults(results) {
  // Web Portalına yönlendir ve verileri LocalStorage üzerinden aktar (geçici çözüm)
  // Prod ortamında veriler önce DB'ye yazılıp analiz ID'si ile portal açılabilir.
  const portalUrl = "http://localhost:5174/analysis";
  
  chrome.tabs.create({ url: portalUrl }, (tab) => {
    // Sayfanın yüklenmesini bekleyip veriyi enjekte et
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (data) => {
            window.localStorage.setItem('autocar_pending_analysis', JSON.stringify(data));
            // Sayfada bir custom event tetikle ki React uygulaması hemen algılasın
            window.dispatchEvent(new Event('autocar_data_ready'));
          },
          args: [results]
        });
      }
    });
  });
}
