let refreshInterval;

document.addEventListener('DOMContentLoaded', () => {
  const tabList = document.getElementById('tab-list');
  const emptyState = document.getElementById('empty-state');
  const statusCounter = document.getElementById('status-counter');
  
  const btnStart = document.getElementById('btn-start-collect');
  const btnStop = document.getElementById('btn-stop-collect');
  const btnAnalyze = document.getElementById('btn-analyze');
  const btnReport = document.getElementById('btn-report');
  
  const confirmModal = document.getElementById('confirm-modal');
  const confirmText = document.getElementById('confirm-text');
  const btnConfirmYes = document.getElementById('btn-confirm-yes');
  const btnConfirmNo = document.getElementById('btn-confirm-no');
  
  const mainContent = document.getElementById('main-content');
  const aiLoadingContainer = document.getElementById('ai-loading');
  const reportContainer = document.getElementById('report-container');
  const btnCancelAi = document.getElementById('btn-cancel-ai');
  
  const circularProgress = document.getElementById('circular-progress');
  const progressValue = document.getElementById('progress-value');
  const aiText = document.getElementById('ai-text');
  const windowBtn = document.getElementById('window-btn');

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
    chrome.runtime.sendMessage({ action: 'set_collecting', value: true }, () => { checkState(); });
  });

  btnStop.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'reset_memory' }, () => { checkState(); });
  });

  btnCancelAi.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'cancel_analysis' }, () => { checkState(); });
  });

  let currentAdsCount = 0;

  let isConfirming = false;

  btnAnalyze.addEventListener('click', () => {
    if (currentAdsCount === 0) return;
    
    isConfirming = true;
    btnAnalyze.style.display = 'none';
    
    chrome.storage.local.get(['trackedTabs'], (res) => {
      const tabs = res.trackedTabs || [];
      const extractedCount = tabs.filter(t => t.data !== null).length;
      
      const chunkCount = Math.ceil(extractedCount / 100);
      const estimatedMinutes = chunkCount * 2;
      const estimatedCost = (extractedCount * 0.001).toFixed(3);
      
      confirmText.innerHTML = `Analiz edilecek ilan sayısı: <b style="color:var(--success)">${extractedCount}</b><br><br>
                               Tahmini işlem süresi: <b>${estimatedMinutes} dk</b><br>
                               Tahmini API Maliyeti: <b>$${estimatedCost}</b><br><br>
                               Onaylıyor musunuz?`;
      confirmModal.style.display = 'flex';
    });
  });

  btnConfirmYes.addEventListener('click', () => {
    isConfirming = false;
    confirmModal.style.display = 'none';
    chrome.runtime.sendMessage({ action: 'start_analysis', options: { runData: true } }, () => { checkState(); });
  });

  btnConfirmNo.addEventListener('click', () => {
    isConfirming = false;
    confirmModal.style.display = 'none';
    btnAnalyze.style.display = 'block';
  });

  btnReport.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'show_report' }, () => {
      if (urlParams.get('mode') !== 'window') window.close();
    });
  });

  chrome.storage.local.get(['userEmail'], (res) => {
    if (res.userEmail) {
      document.getElementById('logged-in-user').innerText = res.userEmail;
    } else {
      document.getElementById('logged-in-user').innerText = "Portal'dan giriş yapın.";
    }
  });

  function checkState() {
    chrome.storage.local.get(['trackedTabs', 'isAnalyzing', 'analysisProgress', 'aiStatusText', 'finalReport', 'isCollecting'], (res) => {
      const tabs = res.trackedTabs || [];
      currentAdsCount = tabs.length;
      const isCollecting = res.isCollecting || false;

      // Handle main buttons
      if (isCollecting) {
        btnStart.style.display = 'none';
        btnStop.style.display = 'block';
        const extractedCountForBtn = tabs.filter(t => t.data !== null).length;
        if (extractedCountForBtn > 0 && !isConfirming) {
          btnAnalyze.style.display = 'block';
        } else {
          btnAnalyze.style.display = 'none';
        }
      } else {
        btnStart.style.display = 'block';
        btnStop.style.display = 'none';
        btnAnalyze.style.display = 'none';
      }

      // If we are confirming, don't re-render tabs and break layout
      if (isConfirming) return;

      // Handle Views (Main vs Loading vs Report)
      if (res.isAnalyzing) {
        mainContent.style.display = 'none';
        reportContainer.style.display = 'none';
        aiLoadingContainer.style.display = 'flex';
        
        if (res.aiError) {
          aiText.textContent = res.aiStatusText || 'Bir hata oluştu!';
          aiText.style.color = "var(--danger)";
          circularProgress.style.background = `var(--card-bg)`;
          btnCancelAi.textContent = "Kapat";
        } else {
          let p = res.analysisProgress || 0;
          progressValue.textContent = `${p}%`;
          circularProgress.style.background = `conic-gradient(var(--accent) ${p * 3.6}deg, var(--card-bg) 0deg)`;
          aiText.textContent = res.aiStatusText || 'Araçlar analiz ediliyor...';
          aiText.style.color = "var(--text)";
          btnCancelAi.textContent = "İptal Et";
        }
      } else {
        aiLoadingContainer.style.display = 'none';
        
        if (res.finalReport) {
          mainContent.style.display = 'none';
          reportContainer.style.display = 'block';
        } else {
          mainContent.style.display = 'block';
          reportContainer.style.display = 'none';
          
          if (tabs.length === 0) {
            tabList.style.display = 'none';
            emptyState.style.display = 'block';
            statusCounter.textContent = 'SİSTEM BEKLİYOR';
            statusCounter.classList.remove('active');
            if (res.aiError) {
              emptyState.innerHTML = `<span style="color:var(--danger)">${res.aiStatusText || "Bir hata oluştu."}</span>`;
            } else {
              emptyState.innerHTML = `İlanları farenin orta tuşuyla yan sekmede açın.<br>Otomatik toplanacaktır.`;
            }
          } else {
            tabList.style.display = 'block';
            emptyState.style.display = res.aiError ? 'block' : 'none';
            
            if (res.aiError) {
               emptyState.innerHTML = `<span style="color:var(--danger); margin-top: 10px; display: block;">${res.aiStatusText || "Bir hata oluştu."}</span>`;
            }

            const extractedCount = tabs.filter(t => t.data !== null).length;
            statusCounter.textContent = `Veri: ${extractedCount} / ${tabs.length} İlan`;
            statusCounter.classList.add('active');
            renderTabs(tabs);
          }
        }
      }
    });
  }

  function renderTabs(tabs) {
    tabList.innerHTML = '';
    tabs.forEach(t => {
      const d = document.createElement('div');
      d.className = 'tab-item';
      
      const info = document.createElement('div');
      info.className = 'tab-title';
      info.textContent = t.title || t.url;
      info.title = t.url;

      const btn = document.createElement('button');
      btn.className = 'remove-btn';
      btn.innerHTML = '×';
      btn.onclick = () => {
        chrome.runtime.sendMessage({ action: 'remove_tab', tabId: t.tabId }, () => checkState());
      };

      d.appendChild(info);
      d.appendChild(btn);
      tabList.appendChild(d);
    });
  }
});
