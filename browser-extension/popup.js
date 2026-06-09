let refreshInterval;

document.addEventListener('DOMContentLoaded', () => {
  const tabList = document.getElementById('tab-list');
  const statusCounter = document.getElementById('status-counter');
  const btnReset = document.getElementById('btn-reset-memory');
  const collectedCounterText = document.getElementById('collected-counter-text');
  const btnAnalyze = document.getElementById('btn-analyze');
  const btnReport = document.getElementById('btn-report');
  const windowBtn = document.getElementById('window-btn');
  const aiLoadingContainer = document.getElementById('ai-loading');
  const circularProgress = document.getElementById('circular-progress');
  const progressValue = document.getElementById('progress-value');
  const aiText = document.getElementById('ai-text');
  
  const btnStartCollect = document.getElementById('btn-start-collect');
  const btnStopCollect = document.getElementById('btn-stop-collect');

  // Modal elements
  const modal = document.getElementById('analysis-modal');
  const modalAdsCount = document.getElementById('modal-ads-count');
  const modalTime = document.getElementById('modal-time');
  const modalCost = document.getElementById('modal-cost');
  const btnModalCancel = document.getElementById('modal-cancel');
  const btnModalConfirm = document.getElementById('modal-confirm');

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

  btnReset.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'reset_memory' }, () => {
      checkState();
    });
  });

  btnStartCollect.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'set_collecting', value: true }, () => checkState());
  });

  btnStopCollect.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'set_collecting', value: false }, () => checkState());
  });

  let currentAdsCount = 0;

  btnAnalyze.addEventListener('click', () => {
    if (currentAdsCount === 0) return;
    
    // Zaman hesabı (Her 100 ilan 1 parça, parça başı 2 dakika)
    const chunks = Math.ceil(currentAdsCount / 100);
    const estimatedTime = chunks * 2;
    
    // Maliyet hesabı (1 İlan = 0.033 TL)
    const costTL = (currentAdsCount * 0.033).toFixed(2);
    
    modalAdsCount.textContent = `Toplam Seçilen İlan: ${currentAdsCount}`;
    modalTime.textContent = `Tahmini Süre: ~${estimatedTime} dakika (${chunks} işlem parçası)`;
    modalCost.textContent = `Tahmini Maliyet: ~${costTL} TL`;
    
    modal.style.display = 'flex';
  });

  btnModalCancel.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  btnModalConfirm.addEventListener('click', () => {
    modal.style.display = 'none';
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

      const { tabs, isAnalyzing, progress, aiText: statusText, hasReport, isError, isCollecting } = response;
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

      if (response.collectedCount !== undefined) {
        currentAdsCount = response.collectedCount;
        collectedCounterText.textContent = `Toplanan İlan: ${currentAdsCount}`;
        if (currentAdsCount > 0) {
          btnAnalyze.style.display = 'block';
        } else {
          btnAnalyze.style.display = 'none';
        }
      }

      if (isAnalyzing) {
        btnReset.style.display = 'none';
        btnAnalyze.style.display = 'none';
        tabList.style.display = 'none';
        btnStartCollect.style.display = 'none';
        btnStopCollect.style.display = 'none';
        
        aiLoadingContainer.style.display = 'flex';
        document.getElementById('btn-cancel-analysis').style.display = 'block';
        
        circularProgress.style.background = `conic-gradient(var(--accent) ${progress * 3.6}deg, var(--card-bg) 0deg)`;
        progressValue.textContent = `${progress}%`;
        
        if (isError) {
          aiText.textContent = statusText;
          aiText.style.color = 'var(--danger)';
          circularProgress.style.background = `conic-gradient(var(--danger) 360deg, var(--card-bg) 0deg)`;
        } else {
          aiText.textContent = statusText;
          aiText.style.color = 'var(--text-muted)';
        }
      } else {
        btnReset.style.display = 'block';
        aiLoadingContainer.style.display = 'none';
        document.getElementById('btn-cancel-analysis').style.display = 'none';

        if (isCollecting) {
          btnStartCollect.style.display = 'none';
          btnStopCollect.style.display = 'block';
          statusCounter.textContent = "Dinleniyor...";
          statusCounter.classList.add('active');
        } else {
          btnStartCollect.style.display = 'block';
          btnStopCollect.style.display = 'none';
          statusCounter.textContent = "Durduruldu";
          statusCounter.classList.remove('active');
        }
        
        if (hasReport) {
          btnReport.style.display = 'block';
          tabList.style.display = 'none';
        } else {
          btnReport.style.display = 'none';
          tabList.style.display = 'block';
        }
      }

      if (!isAnalyzing && !hasReport && response.collectedVehicles) {
        renderTabs(response.collectedVehicles);
      }
    });
  }

  function renderTabs(tabs) {
    tabList.innerHTML = '';
    
    if (!tabs || tabs.length === 0) {
      tabList.innerHTML = '<div class="empty-state">İlanları farenin orta tuşuyla yan sekmede açın. Otomatik toplanacaktır.</div>';
      return;
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
      subtitle.style.color = 'var(--accent)';
      subtitle.textContent = tab.price || "Fiyat Bekleniyor";
      
      titleWrapper.appendChild(title);
      titleWrapper.appendChild(subtitle);
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '✕';
      removeBtn.onclick = () => {
        chrome.runtime.sendMessage({ action: 'remove_vehicle', url: tab.url }, () => {
          checkState();
        });
      };

      tabEl.appendChild(titleWrapper);
      tabEl.appendChild(removeBtn);
      
      tabList.appendChild(tabEl);
    });
  }
});
