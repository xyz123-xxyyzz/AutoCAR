let activeTabs = [];

document.addEventListener('DOMContentLoaded', async () => {
  const tabList = document.getElementById('tab-list');
  const statusCounter = document.getElementById('status-counter');
  const analyzeBtn = document.getElementById('analyze-btn');

  // Sadece sahibinden ve arabam.com sekmelerini bul
  const tabs = await chrome.tabs.query({ 
    url: [
      "*://*.sahibinden.com/*", 
      "*://*.arabam.com/*"
    ] 
  });

  activeTabs = tabs.slice(0, 10); // Maksimum 10 ilan
  
  updateUI();

  analyzeBtn.addEventListener('click', () => {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analiz Ediliyor...';
    
    // Background scripte gönder
    chrome.runtime.sendMessage({
      action: 'analyze_tabs',
      tabs: activeTabs
    }, (response) => {
      window.close(); // İşlem bitince popup'ı kapat
    });
  });

  function updateUI() {
    tabList.innerHTML = '';
    
    if (activeTabs.length === 0) {
      tabList.innerHTML = '<div class="empty-state">İlan sayfası bulunamadı. Lütfen ilanları yeni sekmede açın.</div>';
      analyzeBtn.disabled = true;
      statusCounter.textContent = 'Bekleniyor... 0/10';
      return;
    }

    statusCounter.textContent = `Bekleniyor... ${activeTabs.length}/10`;
    analyzeBtn.disabled = false;

    activeTabs.forEach((tab, index) => {
      const tabEl = document.createElement('div');
      tabEl.className = 'tab-item';
      
      const title = document.createElement('div');
      title.className = 'tab-title';
      title.textContent = tab.title || tab.url;
      title.title = tab.title || tab.url;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '✕';
      removeBtn.onclick = () => {
        activeTabs.splice(index, 1);
        updateUI();
      };
      
      tabEl.appendChild(title);
      tabEl.appendChild(removeBtn);
      tabList.appendChild(tabEl);
    });
  }
});
