document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  const btnStart = document.getElementById('btn-start');
  const btnStop = document.getElementById('btn-stop');

  // Check current state from storage
  chrome.storage.local.get(['autocar_running'], (res) => {
    if (res.autocar_running) {
      setRunningState(true);
    } else {
      setRunningState(false);
    }
  });

  btnStart.addEventListener('click', () => {
    chrome.storage.local.set({ autocar_running: true }, () => {
      setRunningState(true);
    });
  });

  btnStop.addEventListener('click', () => {
    chrome.storage.local.set({ autocar_running: false }, () => {
      setRunningState(false);
    });
  });

  function setRunningState(isRunning) {
    if (isRunning) {
      statusEl.textContent = 'Bekleniyor...';
      statusEl.className = 'status-text active';
      btnStart.style.display = 'none';
      btnStop.style.display = 'block';
    } else {
      statusEl.textContent = 'Duraklatıldı';
      statusEl.className = 'status-text';
      btnStart.style.display = 'block';
      btnStop.style.display = 'none';
    }
  }
});
