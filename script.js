/**
 * Dr. Sharad Chandra Tripathi - Academic Portal Script
 * Provides: Theme Switcher, Email Obfuscation/Reveal, Smooth Scrolling, Year Auto-update
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Auto-update copyright year
  const yearSpans = document.querySelectorAll('.current-year');
  const currentYear = new Date().getFullYear();
  yearSpans.forEach(span => {
    span.textContent = currentYear;
  });

  // 2. Anti-Scraper Email Reveal
  const emailRevealBtn = document.getElementById('reveal-emails-btn');
  const emailContainer = document.getElementById('secure-email-container');
  if (emailRevealBtn && emailContainer) {
    emailRevealBtn.addEventListener('click', () => {
      // Obfuscated email parts to thwart automated web spiders
      const addresses = [
        { label: 'Academic & Research', u: 'drsharadctripathi', d: 'gmail.com' },
        { label: 'Institutional (Faculty)', u: 'sharadchandra.tripathi', d: 'vitbhopal.ac.in' },
        { label: 'Outreach & University', u: 'ad.studentoutreach', d: 'vitbhopal.ac.in' }
      ];

      const listHtml = addresses.map(item => {
        const full = `${item.u}@${item.d}`;
        return `
          <div class="email-row">
            <span class="email-label">${item.label}:</span>
            <a href="mailto:${full}" class="email-link">${full}</a>
            <button class="copy-btn" onclick="navigator.clipboard.writeText('${full}').then(()=>alert('Copied ${full} to clipboard!'))" title="Copy to clipboard">📋</button>
          </div>
        `;
      }).join('');

      emailContainer.innerHTML = listHtml;
      emailContainer.style.display = 'block';
      emailRevealBtn.style.display = 'none';
    });
  }

  // 3. Theme Toggle (Dark / Light Mode)
  const themeToggle = document.getElementById('theme-toggle-btn');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const target = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', target);
      localStorage.setItem('theme', target);
      updateThemeIcon(target);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    themeToggle.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }

  // 4. Smooth scroll for anchor tags
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          targetElem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});
