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

  // Analysis Toggles
  const analysisOptions = document.getElementById('analysis-options');
  const toggleData = document.getElementById('toggle-data');
  const toggleVision = document.getElementById('toggle-vision');

  // Load saved toggles
  chrome.storage.local.get(['toggle_data', 'toggle_vision'], (res) => {
    if (res.toggle_data !== undefined) toggleData.checked = res.toggle_data;
    if (res.toggle_vision !== undefined) toggleVision.checked = res.toggle_vision;
    validateAnalyzeBtn();
  });

  const saveToggles = () => {
    chrome.storage.local.set({
      toggle_data: toggleData.checked,
      toggle_vision: toggleVision.checked
    });
    validateAnalyzeBtn();
  };

  toggleData.addEventListener('change', saveToggles);
  toggleVision.addEventListener('change', saveToggles);

  function validateAnalyzeBtn() {
    if (!toggleData.checked && !toggleVision.checked) {
      btnAnalyze.disabled = true;
      btnAnalyze.style.opacity = '0.5';
      btnAnalyze.textContent = 'Lütfen Bir Seçenek İşaretleyin';
    } else {
      btnAnalyze.disabled = false;
      btnAnalyze.style.opacity = '1';
      btnAnalyze.textContent = 'Analiz Et';
    }
  }

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
    if (!toggleData.checked && !toggleVision.checked) return;
    chrome.runtime.sendMessage({ 
      action: 'start_analysis', 
      options: { 
        runData: toggleData.checked, 
        runVision: toggleVision.checked 
      } 
    }, () => {
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

  document.getElementById('btn-cancel-analysis').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stop_system' }, () => {
      checkState();
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
        analysisOptions.style.display = 'none';
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
          document.getElementById('btn-cancel-analysis').style.display = 'block';
        }
        return;
      }

      // Not analyzing, no error
      aiLoadingContainer.style.display = 'none';
      btnReport.style.display = 'none';
      document.getElementById('btn-cancel-analysis').style.display = 'none';

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
          analysisOptions.style.display = 'none';
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
      analysisOptions.style.display = 'none';
      return;
    }

    const readyCount = tabs.filter(t => t.status === 'Yüklendi').length;
    statusCounter.textContent = `Toplandı (${readyCount}/${tabs.length})`;
    
    if (readyCount > 0) {
      btnAnalyze.style.display = 'block';
      analysisOptions.style.display = 'block';
      validateAnalyzeBtn();
    } else {
      btnAnalyze.style.display = 'none';
      analysisOptions.style.display = 'none';
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
