let refreshInterval;

document.addEventListener('DOMContentLoaded', () => {
  const tabList = document.getElementById('tab-list');
  const statusCounter = document.getElementById('status-counter');
  const btnStart = document.getElementById('btn-start');
  const btnDeepScan = document.getElementById('btn-deep-scan');
  const btnAnalyze = document.getElementById('btn-analyze');
  const btnReport = document.getElementById('btn-report');
  const windowBtn = document.getElementById('window-btn');
  const aiLoadingContainer = document.getElementById('ai-loading');
  const circularProgress = document.getElementById('circular-progress');
  const progressValue = document.getElementById('progress-value');
  const aiText = document.getElementById('ai-text');

  // Checkboxes removed as system is Data-Only now


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

  // E-Posta bilgisini ekrana yansıt
  chrome.storage.local.get(['userEmail'], (res) => {
    const emailDisplay = document.getElementById('user-email-display');
    if (res.userEmail) {
      emailDisplay.textContent = res.userEmail;
    } else {
      emailDisplay.textContent = "Giriş Yapılmadı";
    }
  });

  checkState();
  if (!refreshInterval) {
    refreshInterval = setInterval(checkState, 500);
  }

  btnStart.addEventListener('click', () => {
    if (btnStart.textContent === 'Manuel Çalıştır') {
      chrome.runtime.sendMessage({ action: 'start_system' }, () => {
        checkState();
      });
    } else {
      chrome.runtime.sendMessage({ action: 'stop_system' }, () => {
        checkState();
      });
    }
  });

  btnDeepScan.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'start_deep_scan' }, () => {
      checkState();
    });
  });

  btnAnalyze.addEventListener('click', () => {
    chrome.runtime.sendMessage({ 
      action: 'start_analysis', 
      options: { runData: true } 
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
        btnDeepScan.style.display = 'none';
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
          btnDeepScan.style.display = 'none';
          tabList.style.display = 'block';
          
          renderTabs(tabs);
        } else {
          btnStart.textContent = 'Manuel Çalıştır';
          statusCounter.textContent = 'Sistem Kapalı';
          statusCounter.className = 'status';
          btnStart.style.display = 'block';
          btnDeepScan.style.display = 'block';
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
      if (tabs.length > 50) {
        btnAnalyze.disabled = true;
        btnAnalyze.textContent = 'Maks. 50 İlan Aşılmıştır';
      } else {
        btnAnalyze.disabled = false;
        btnAnalyze.textContent = 'Analiz Et';
      }
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
