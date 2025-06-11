const emailBox = document.getElementById('current-email');
const inboxList = document.getElementById('inbox-list');
const historySelect = document.getElementById('email-history');

const API_BASE = 'https://temp-email-backend-rebejrkif-andrews-projects-1c1fa461.vercel.app/api/index';

function generateEmail() {
  const name = Math.random().toString(36).substring(2, 8);
  return `${name}@cinnory.com`;
}

function saveHistory(email) {
  chrome.storage.local.get(['history'], (res) => {
    let history = res.history || [];
    if (!history.includes(email)) {
      history.unshift(email);
      if (history.length > 5) history = history.slice(0, 5);
      chrome.storage.local.set({ history });
    }
    loadHistoryDropdown();
  });
}

function loadHistoryDropdown() {
  chrome.storage.local.get(['history'], (res) => {
    const history = res.history || [];
    historySelect.innerHTML = '';
    history.forEach(email => {
      const opt = document.createElement('option');
      opt.value = email;
      opt.textContent = email;
      historySelect.appendChild(opt);
    });
  });
}

function updateEmail(email) {
  emailBox.textContent = email;
  chrome.storage.local.set({ email });
  saveHistory(email);
  loadInbox(email);
}

function loadInbox(email) {
  inboxList.innerHTML = '<li>Loading...</li>';
  fetch(`${API_BASE}?email=${encodeURIComponent(email)}`)
    .then(res => res.json())
    .then(data => {
      inboxList.innerHTML = '';
      (data.messages || []).forEach(msg => {
        const li = document.createElement('li');
        li.textContent = `📧 ${msg.subject} – from ${msg.from}`;
        inboxList.appendChild(li);
      });
      if ((data.messages || []).length === 0) {
        inboxList.innerHTML = '<li>No messages</li>';
      }
    })
    .catch(() => {
      inboxList.innerHTML = '<li>Error loading inbox</li>';
    });
}

document.getElementById('refresh-email').onclick = () => {
  const newEmail = generateEmail();
  updateEmail(newEmail);
};

document.getElementById('refresh-inbox').onclick = () => {
  chrome.storage.local.get(['email'], (res) => {
    if (res.email) loadInbox(res.email);
  });
};

historySelect.onchange = (e) => {
  const selected = e.target.value;
  updateEmail(selected);
};

chrome.storage.local.get(['email'], (res) => {
  const saved = res.email || generateEmail();
  updateEmail(saved);
});
