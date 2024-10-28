document.getElementById('save').addEventListener('click', () => {
  const highlightArbitration = document.getElementById('highlightArbitration').checked;
  chrome.storage.sync.set({ highlightArbitration }, () => {
      document.getElementById('status').textContent = 'Settings saved';
      setTimeout(() => {
          document.getElementById('status').textContent = '';
      }, 1000);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['highlightArbitration'], (data) => {
      document.getElementById('highlightArbitration').checked = data.highlightArbitration || false;
  });
});