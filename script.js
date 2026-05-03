// ===== GITHUB USERNAME =====
const GITHUB_USERNAME = 'ayushrai-cm';
// ===== LOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2000);
});
// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const html = document.documentElement;
let isDark = true;
themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  html.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeIcon.textContent = isDark ? '🌙' : '☀️';
});
// ===== SIDEBAR TOGGLE =====
const sidebar = document.querySelector('[data-sidebar]');
const sidebarBtn = document.querySelector('[data-sidebar-btn]');
if (sidebarBtn) {
  sidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    const span = sidebarBtn.querySelector('span');
    span.textContent = sidebar.classList.contains('active') ? 'Hide Contacts' : 'Show Contacts';
  });
}
// ===== NAVBAR =====
const navLinks = document.querySelectorAll('[data-nav-link]');
const articles = document.querySelectorAll('[data-page]');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    const page = link.textContent.trim().toLowerCase();
    navLinks.forEach(l => l.classList.remove('active'));
    articles.forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    const target = document.querySelector(`[data-page="${page}"]`);
    if (target) target.classList.add('active');
  });
});
// ===== PORTFOLIO FILTER =====
const filterBtns = document.querySelectorAll('[data-filter-btn]');
const filterItems = document.querySelectorAll('[data-filter-item]');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.textContent.trim().toLowerCase();
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterItems.forEach(item => {
      const itemCategory = item.dataset.category.toLowerCase();
      if (category === 'all' || itemCategory === category) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  });
});
// ===== CONTACT FORM — GMAIL =====
const gmailInputIds = ['senderName', 'senderEmail', 'msgSubject', 'msgBody'];
function checkGmailForm() {
  const btn = document.getElementById('gmailSendBtn');
  if (!btn) return;
  const allFilled = gmailInputIds.every(id => {
    const el = document.getElementById(id);
    return el && el.value.trim() !== '';
  });
  btn.disabled = !allFilled;
}
// Attach listeners after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  gmailInputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', checkGmailForm);
  });
});
function sendViaGmail() {
  const name    = document.getElementById('senderName')?.value.trim();
  const email   = document.getElementById('senderEmail')?.value.trim();
  const subject = document.getElementById('msgSubject')?.value.trim();
  const body    = document.getElementById('msgBody')?.value.trim();
  if (!name || !email || !subject || !body) {
    alert('Please fill in all fields before sending.');
    return;
  }
  const to = 'ayushrai2689@gmail.com';
  const fullSubject = encodeURIComponent(`[Portfolio Contact] ${subject}`);
  const fullBody = encodeURIComponent(
    `Hi Ayush,\n\nYou have a new message from your portfolio:\n\n` +
    `Name   : ${name}\nEmail  : ${email}\n\nMessage:\n${body}\n\n` +
    `-- Sent via your Portfolio Contact Form`
  );
  const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${fullSubject}&body=${fullBody}`;
  window.open(gmailURL, '_blank');
  // Show success feedback
  const btn = document.getElementById('gmailSendBtn');
  if (btn) {
    btn.innerHTML = '<ion-icon name="checkmark-circle-outline"></ion-icon><span>Gmail Opened!</span>';
    btn.style.background = 'linear-gradient(135deg, #34c759, #28a745)';
    setTimeout(() => {
      btn.innerHTML = '<ion-icon name="mail-outline"></ion-icon><span>Send via Gmail</span>';
      btn.style.background = '';
    }, 3000);
  }
}
// ===== GITHUB API =====
async function fetchGitHubData() {
  try {
    // Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
    if (!userRes.ok) throw new Error('GitHub user not found');
    const user = await userRes.json();
    // Update stats
    document.getElementById('totalRepos').textContent = user.public_repos || 0;
    document.getElementById('totalFollowers').textContent = user.followers || 0;
    document.getElementById('totalFollowing').textContent = user.following || 0;
    document.getElementById('miniRepos').textContent = `${user.public_repos || 0} repos`;
    document.getElementById('miniFollowers').textContent = `${user.followers || 0} followers`;
    // Fetch repos
    const reposRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`);
    if (!reposRes.ok) throw new Error('Could not fetch repos');
    const repos = await reposRes.json();
    // Calculate total stars
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    document.getElementById('totalStars').textContent = totalStars;
    // Language analysis
    analyzeLangauges(repos);
    // Render GitHub repos
    renderGitHubRepos(repos);
  } catch (err) {
    console.warn('GitHub API error:', err.message);
    showGitHubFallback();
  }
}
function analyzeLangauges(repos) {
  const langCount = {};
  repos.forEach(repo => {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
    }
  });
  const sorted = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const total = sorted.reduce((sum, [, count]) => sum + count, 0);
  const langBars = document.getElementById('langBars');
  if (!sorted.length) {
    langBars.innerHTML = '<div class="lang-loading">No language data found.</div>';
    return;
  }
  const langColors = {
    'Python': '#3776AB',
    'JavaScript': '#F0DB4F',
    'HTML': '#E34F26',
    'CSS': '#1572B6',
    'C': '#A8B9CC',
    'C++': '#00599C',
    'TypeScript': '#3178C6',
    'Java': '#F89820',
  };
  langBars.innerHTML = sorted.map(([lang, count]) => {
    const percent = Math.round((count / total) * 100);
    const color = langColors[lang] || '#4f8ef7';
    return `
      <div class="lang-bar-item">
        <span class="lang-name">${lang}</span>
        <div class="lang-bar-outer">
          <div class="lang-bar-inner" style="width: ${percent}%; background: ${color};"></div>
        </div>
        <span class="lang-percent">${percent}%</span>
      </div>
    `;
  }).join('');
}
function renderGitHubRepos(repos) {
  const container = document.getElementById('githubRepos');
  const topRepos = repos
    .filter(r => !r.fork)
    .slice(0, 6);
  if (!topRepos.length) {
    container.innerHTML = '<div class="repo-loading">No public repositories found.</div>';
    return;
  }
  container.innerHTML = topRepos.map(repo => `
    <a href="${repo.html_url}" target="_blank" class="repo-card" style="text-decoration:none">
      <div class="repo-name">
        <ion-icon name="folder-outline"></ion-icon>
        ${repo.name}
      </div>
      <div class="repo-desc">${repo.description || 'No description provided.'}</div>
      ${repo.language ? `<span class="repo-lang">${repo.language}</span>` : ''}
      <div class="repo-stats">
        <span class="repo-stat"><ion-icon name="star-outline"></ion-icon> ${repo.stargazers_count}</span>
        <span class="repo-stat"><ion-icon name="git-branch-outline"></ion-icon> ${repo.forks_count}</span>
        <span class="repo-stat"><ion-icon name="time-outline"></ion-icon> ${timeSince(repo.updated_at)}</span>
      </div>
    </a>
  `).join('');
}
function showGitHubFallback() {
  const statsIds = ['totalRepos', 'totalFollowers', 'totalFollowing', 'totalStars'];
  statsIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = 'N/A';
  });
  const langBars = document.getElementById('langBars');
  if (langBars) {
    langBars.innerHTML = `
      <div class="lang-bar-item">
        <span class="lang-name">Python</span>
        <div class="lang-bar-outer"><div class="lang-bar-inner" style="width:60%; background:#3776AB;"></div></div>
        <span class="lang-percent">60%</span>
      </div>
      <div class="lang-bar-item">
        <span class="lang-name">HTML</span>
        <div class="lang-bar-outer"><div class="lang-bar-inner" style="width:25%; background:#E34F26;"></div></div>
        <span class="lang-percent">25%</span>
      </div>
      <div class="lang-bar-item">
        <span class="lang-name">CSS</span>
        <div class="lang-bar-outer"><div class="lang-bar-inner" style="width:15%; background:#1572B6;"></div></div>
        <span class="lang-percent">15%</span>
      </div>
    `;
  }
  const reposContainer = document.getElementById('githubRepos');
  if (reposContainer) {
    reposContainer.innerHTML = `
      <div class="repo-card">
        <div class="repo-name"><ion-icon name="folder-outline"></ion-icon> password-generator</div>
        <div class="repo-desc">A secure random password generator built with Python.</div>
        <span class="repo-lang">Python</span>
        <div class="repo-stats">
          <span class="repo-stat"><ion-icon name="star-outline"></ion-icon> 0</span>
          <span class="repo-stat"><ion-icon name="git-branch-outline"></ion-icon> 0</span>
        </div>
      </div>
      <div class="repo-card">
        <div class="repo-name"><ion-icon name="folder-outline"></ion-icon> portfolio-website</div>
        <div class="repo-desc">Personal portfolio website built with HTML5, CSS3 & JavaScript.</div>
        <span class="repo-lang">HTML</span>
        <div class="repo-stats">
          <span class="repo-stat"><ion-icon name="star-outline"></ion-icon> 0</span>
          <span class="repo-stat"><ion-icon name="git-branch-outline"></ion-icon> 0</span>
        </div>
      </div>
    `;
  }
}
function timeSince(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}
// ===== INIT =====
fetchGitHubData();
