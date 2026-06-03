let refreshInterval;

document.addEventListener('DOMContentLoaded', () => {
  const tabList = document.getElementById('tab-list');
  const statusCounter = document.getElementById('status-counter');
  const btnStart = document.getElementById('btn-start');
  const btnAnalyze = document.getElementById('btn-analyze');
  const btnReport = document.getElementById('btn-report');
  const windowBtn = document.getElementById('window-btn');
  const aiLoadingContainer = document.getElementById('ai-loading');
  const circularProgress = document.getElementById('circular-progress');
  const progressValue = document.getElementById('progress-value');
  const aiText = document.getElementById('ai-text');
  
  const btnSettings = document.getElementById('btn-settings');
  const settingsView = document.getElementById('settings-view');
  const apiKeyInput = document.getElementById('api-key-input');
  const btnSaveSettings = document.getElementById('btn-save-settings');

  // Load saved API key
  chrome.storage.local.get(['openai_api_key'], (res) => {
    if (res.openai_api_key) {
      apiKeyInput.value = res.openai_api_key;
    }
  });

  btnSettings.addEventListener('click', () => {
    settingsView.style.display = settingsView.style.display === 'none' ? 'block' : 'none';
  });

  btnSaveSettings.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    chrome.storage.local.set({ openai_api_key: key }, () => {
      alert('API Anahtarı kaydedildi!');
      settingsView.style.display = 'none';
    });
  });


  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'window') {
    windowBtn.style.display = 'none';
  }

  windowBtn.addEventListener('click', () => {
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html?mode=window"),
      type: "popup",
      width: 360,
      height: 480
    });
    window.close();
  });

  checkState();
  if (!refreshInterval) {
    refreshInterval = setInterval(checkState, 500);
  }

  btnStart.addEventListener('click', () => {
    if (btnStart.textContent === 'Çalıştır') {
      chrome.runtime.sendMessage({ action: 'start_system' }, () => {
        checkState();
      });
    } else {
      chrome.runtime.sendMessage({ action: 'stop_system' }, () => {
        checkState();
      });
    }
  });

  btnAnalyze.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'start_analysis' }, () => {
      checkState();
    });
  });

  btnReport.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'show_report' }, () => {
      if (urlParams.get('mode') !== 'window') {
        window.close();
      } else {
        checkState();
      }
    });
  });

  function checkState() {
    chrome.runtime.sendMessage({ action: 'get_state' }, (response) => {
      if (!response) return;

      const { tabs, isAnalyzing, progress, aiText: statusText, hasReport, isError } = response;
      const btnLastReport = document.getElementById('btn-last-report');

      if (hasReport) {
        btnLastReport.style.display = 'block';
        btnLastReport.onclick = () => {
          chrome.runtime.sendMessage({ action: 'show_report' }, () => {
            if (urlParams.get('mode') !== 'window') window.close();
          });
        };
      } else {
        btnLastReport.style.display = 'none';
      }

      if (isAnalyzing || isError) {
        btnStart.style.display = 'none';
        tabList.style.display = 'none';
        btnAnalyze.style.display = 'none';
        
        statusCounter.textContent = isError ? 'Sistem Hatası' : 'Yapay Zeka Devrede';
        statusCounter.className = isError ? 'status' : 'status active';
        
        aiLoadingContainer.style.display = 'flex';
        
        if (isError) {
          circularProgress.style.background = `conic-gradient(var(--danger) 360deg, var(--card-bg) 0deg)`;
          progressValue.textContent = 'Hata';
          aiText.textContent = statusText;
          btnReport.style.display = 'none';
          btnStart.textContent = 'Başa Dön';
          btnStart.style.display = 'block';
        } else {
          circularProgress.style.background = `conic-gradient(var(--accent) ${progress * 3.6}deg, var(--card-bg) 0deg)`;
          progressValue.textContent = `${progress}%`;
          aiText.textContent = statusText;
          btnReport.style.display = 'none';
        }
        return;
      }

      // Not analyzing, no error
      aiLoadingContainer.style.display = 'none';
      btnReport.style.display = 'none';

      chrome.storage.local.get(['autocar_running'], (res) => {
        if (res.autocar_running) {
          btnStart.textContent = 'Sistemi Durdur';
          statusCounter.textContent = 'Bekleniyor...';
          statusCounter.className = 'status active';
          btnStart.style.display = 'block';
          tabList.style.display = 'block';
          
          renderTabs(tabs);
        } else {
          btnStart.textContent = 'Çalıştır';
          statusCounter.textContent = 'Sistem Kapalı';
          statusCounter.className = 'status';
          btnStart.style.display = 'block';
          tabList.style.display = 'none';
          btnAnalyze.style.display = 'none';
        }
      });
    });
  }

  function renderTabs(tabs) {
    tabList.innerHTML = '';
    
    if (!tabs || tabs.length === 0) {
      tabList.innerHTML = '<div class="empty-state">İlanları yeni sekmede açın. Sistem otomatik yükleyecektir.</div>';
      btnAnalyze.style.display = 'none';
      return;
    }

    const readyCount = tabs.filter(t => t.status === 'Yüklendi').length;
    statusCounter.textContent = `Toplandı (${readyCount}/${tabs.length})`;
    
    if (readyCount > 0) {
      btnAnalyze.style.display = 'block';
    } else {
      btnAnalyze.style.display = 'none';
    }

    tabs.forEach((tab) => {
      const tabEl = document.createElement('div');
      tabEl.className = 'tab-item';
      
      const titleWrapper = document.createElement('div');
      titleWrapper.style.flex = '1';
      titleWrapper.style.overflow = 'hidden';

      const title = document.createElement('div');
      title.className = 'tab-title';
      title.textContent = tab.title;

      const subtitle = document.createElement('div');
      subtitle.style.fontSize = '11px';
      subtitle.style.marginTop = '2px';
      subtitle.style.fontWeight = 'bold';
      subtitle.style.color = tab.status === 'Yüklendi' ? 'var(--accent)' : 'var(--text-muted)';
      subtitle.textContent = tab.status;
      
      titleWrapper.appendChild(title);
      titleWrapper.appendChild(subtitle);
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '✕';
      removeBtn.onclick = () => {
        chrome.runtime.sendMessage({ action: 'remove_tab', tabId: tab.tabId }, () => {
          checkState();
        });
      };
      
      tabEl.appendChild(titleWrapper);
      tabEl.appendChild(removeBtn);
      tabList.appendChild(tabEl);
    });
  }
});
