document.getElementById('save').addEventListener('click', () => {
  const highlightArb = document.getElementById('highlightArb').checked;
  const arbColor = document.getElementById('arbColor').value;
  const highlightPreArb = document.getElementById('highlightPreArb').checked;
  const preArbColor = document.getElementById('preArbColor').value;
  const highlightLessThanOneYear = document.getElementById('highlightLessThanOneYear').checked;
  const lessThanOneYearColor = document.getElementById('lessThanOneYearColor').value;

  chrome.storage.sync.set({
    highlightArb,
    arbColor,
    highlightPreArb,
    preArbColor,
    highlightLessThanOneYear,
    lessThanOneYearColor }, () => {
      document.getElementById('status').textContent = 'Settings saved';
      setTimeout(() => {
          document.getElementById('status').textContent = '';
      }, 1000);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get([
    'highlightArb',
    'arbColor',
    'highlightPreArb',
    'preArbColor',
    'highlightLessThanOneYear',
    'lessThanOneYearColor'
  ], (data) => {
    document.getElementById('highlightArb').checked = data.highlightArb || false;
    document.getElementById('arbColor').value = data.arbColor || '#ff0000';
    document.getElementById('highlightPreArb').checked = data.highlightPreArb || false;
    document.getElementById('preArbColor').value = data.preArbColor || '#00ff00';
    document.getElementById('highlightLessThanOneYear').checked = data.highlightLessThanOneYear || false;
    document.getElementById('lessThanOneYearColor').value = data.lessThanOneYearColor || '#0000ff';
  });
});