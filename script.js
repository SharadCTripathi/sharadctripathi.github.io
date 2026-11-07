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

      // Build DOM safely using createElement — avoids innerHTML injection antipattern
      emailContainer.textContent = '';
      addresses.forEach(item => {
        const full = `${item.u}@${item.d}`;

        const row = document.createElement('div');
        row.className = 'email-row';

        const labelSpan = document.createElement('span');
        labelSpan.className = 'email-label';
        labelSpan.textContent = `${item.label}:`;

        const link = document.createElement('a');
        link.href = `mailto:${full}`;
        link.className = 'email-link';
        link.textContent = full;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.title = 'Copy to clipboard';
        copyBtn.textContent = '📋';
        copyBtn.addEventListener('click', () => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(full).then(() => {
              copyBtn.textContent = '✅';
              setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
            }).catch(() => {
              copyBtn.textContent = '❌';
            });
          }
        });

        row.appendChild(labelSpan);
        row.appendChild(link);
        row.appendChild(copyBtn);
        emailContainer.appendChild(row);
      });

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

  // 5. Interactive Live Solar Observatory (NASA SDO)
  const sunImg = document.getElementById('liveSunImg');
  const sunCaption = document.getElementById('solarCaption');
  const waveBtns = document.querySelectorAll('.wave-btn');
  const refreshSunBtn = document.getElementById('refreshSunBtn');

  if (sunImg && waveBtns.length > 0) {
    let currentSrc = 'latest_512_HMIIC.jpg';

    waveBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        waveBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentSrc = btn.dataset.src;
        sunImg.style.opacity = '0.35';

        // Cache-busting timestamp ensures real-time fresh frame from NASA CDN
        const timestamp = Date.now();
        sunImg.src = `https://sdo.gsfc.nasa.gov/assets/img/latest/${currentSrc}?t=${timestamp}`;

        if (sunCaption && btn.dataset.desc) {
          // Use textContent for the caption text; formatting is applied via CSS
          // data-desc contains plain-text descriptions (HTML tags stripped for safety)
          sunCaption.textContent = btn.dataset.desc;
        }

        sunImg.onload = () => { sunImg.style.opacity = '1'; };
        sunImg.onerror = () => {
          sunImg.style.opacity = '1';
          console.warn('Could not load SDO frame:', currentSrc);
        };
      });
    });

    if (refreshSunBtn) {
      refreshSunBtn.addEventListener('click', () => {
        refreshSunBtn.textContent = 'Refreshing...';
        sunImg.style.opacity = '0.35';
        const timestamp = Date.now();
        sunImg.src = `https://sdo.gsfc.nasa.gov/assets/img/latest/${currentSrc}?t=${timestamp}`;
        sunImg.onload = () => {
          sunImg.style.opacity = '1';
          refreshSunBtn.textContent = '✅ Updated';
          setTimeout(() => { refreshSunBtn.textContent = '🔄 Refresh Latest Frame'; }, 2000);
        };
      });
    }
  }
});


/* ==========================================================================
   Space Weather Monitor — NOAA SWPC Live Data
   ========================================================================== */

(function () {
  'use strict';

  // ── Helpers ──────────────────────────────────────────────────────────────

  function el(id) { return document.getElementById(id); }

  function setText(id, val) {
    var node = el(id);
    if (node) node.textContent = val;
  }

  function setDot(id, state) {       // state: 'ok' | 'warn' | 'err'
    var d = el(id);
    if (!d) return;
    d.className = 'sw-status-dot ' + state;
  }

  function fmt(val, digits) {
    if (val === null || val === undefined || val === '' || isNaN(+val)) return '—';
    return (+val).toFixed(digits !== undefined ? digits : 2);
  }

  function fmtSI(val) {              // e.g. 0.000012 → "1.20 × 10⁻⁵ W/m²"
    if (val === null || val === undefined || isNaN(+val)) return '—';
    var v = +val;
    if (v === 0) return '0';
    var exp = Math.floor(Math.log10(Math.abs(v)));
    var mantissa = (v / Math.pow(10, exp)).toFixed(2);
    var supMap = {'-':'\u207B','0':'\u2070','1':'\u00B9','2':'\u00B2','3':'\u00B3','4':'\u2074','5':'\u2075','6':'\u2076','7':'\u2077','8':'\u2078','9':'\u2079'};
    var expStr = String(exp).split('').map(function(c){ return supMap[c] || c; }).join('');
    return mantissa + ' \u00D7 10' + expStr + ' W/m\u00B2';
  }

  function fmtTemp(val) {
    if (val === null || val === undefined || isNaN(+val) || +val <= 0) return '—';
    return (+val).toExponential(2) + ' K';
  }

  function xrayClass(flux) {         // flux in W/m² — 0.1-0.8 nm long channel
    if (flux === null || flux === undefined || isNaN(+flux)) return { cls: '—', label: 'No data', dot: 'ok' };
    var f = +flux;
    if (f >= 1e-3) return { cls: 'X' + (f / 1e-3).toFixed(0), label: 'Extreme flare',    dot: 'err'  };
    if (f >= 1e-4) return { cls: 'M' + (f / 1e-4).toFixed(1), label: 'Major flare',      dot: 'warn' };
    if (f >= 1e-5) return { cls: 'C' + (f / 1e-5).toFixed(1), label: 'Common flare',     dot: 'warn' };
    if (f >= 1e-6) return { cls: 'B' + (f / 1e-6).toFixed(1), label: 'Minor activity',   dot: 'ok'   };
    return                 { cls: 'A',                          label: 'Background quiet', dot: 'ok'   };
  }

  function protonScale(pfu) {        // ≥10 MeV integral flux in pfu
    if (pfu === null || pfu === undefined || isNaN(+pfu)) return { scale: 'Normal', dot: 'ok' };
    var f = +pfu;
    if (f >= 100000) return { scale: 'S5 Extreme',  dot: 'err'  };
    if (f >= 10000)  return { scale: 'S4 Severe',   dot: 'err'  };
    if (f >= 1000)   return { scale: 'S3 Strong',   dot: 'warn' };
    if (f >= 100)    return { scale: 'S2 Moderate', dot: 'warn' };
    if (f >= 10)     return { scale: 'S1 Minor',    dot: 'warn' };
    return                  { scale: 'Normal',       dot: 'ok'   };
  }

  function kpLabel(kp) {
    if (kp >= 8) return { label: 'Severe\u2013Extreme Storm (G4\u2013G5)', dot: 'err'  };
    if (kp >= 6) return { label: 'Strong Storm (G2\u2013G3)',              dot: 'err'  };
    if (kp >= 5) return { label: 'Minor Storm (G1)',                       dot: 'warn' };
    if (kp >= 4) return { label: 'Active / Unsettled',                     dot: 'warn' };
    if (kp >= 2) return { label: 'Quiet to Active',                        dot: 'ok'   };
    return               { label: 'Very Quiet',                            dot: 'ok'   };
  }

  // ── Sanitize plain text (strip all HTML tags) — prevents XSS ─────────────
  function sanitizeText(str) {
    var tmp = document.createElement('div');
    tmp.textContent = String(str || '');
    return tmp.textContent;
  }

  // ── Fetch with timeout ───────────────────────────────────────────────────

  function fetchJSON(url) {
    var ctrl = new AbortController();
    var timer = setTimeout(function(){ ctrl.abort(); }, 10000);
    return fetch(url, { signal: ctrl.signal })
      .then(function(r) {
        clearTimeout(timer);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .catch(function(e) {
        clearTimeout(timer);
        throw e;
      });
  }

  // ── Individual Data Loaders ──────────────────────────────────────────────

  // Kp API returns array of objects: {time_tag, Kp, a_running, station_count}
  function loadKp() {
    fetchJSON('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json')
      .then(function(data) {
        var latest = data[data.length - 1];
        var kp = parseFloat(latest.Kp);
        if (isNaN(kp)) throw new Error('Invalid Kp value');
        var info = kpLabel(kp);

        setText('sw-kp-value', kp.toFixed(1));
        setText('sw-kp-label', info.label);
        setDot('sw-kp-status', info.dot);

        // Move marker: Kp 0–9 → 0–100%
        var pct = Math.min(100, (kp / 9) * 100);
        var bar = el('sw-kp-bar');
        if (bar) bar.style.left = pct + '%';
      })
      .catch(function() {
        setText('sw-kp-label', 'Data unavailable');
        setDot('sw-kp-status', 'err');
      });
  }

  // X-ray API returns objects with energy field — long channel is '0.1-0.8nm'
  function loadXray() {
    fetchJSON('https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json')
      .then(function(data) {
        // Long channel (1–8 Å = 0.1–0.8 nm) — use energy string as returned by NOAA
        var longCh = data.filter(function(d) {
          return d.energy === '0.1-0.8nm' || d.energy === '1-8A' || d.energy === '0.1-7.0nm';
        });
        var latest = longCh.length ? longCh[longCh.length - 1] : data[data.length - 1];
        var flux = (latest.flux !== undefined) ? latest.flux : latest.observed_flux;
        var info = xrayClass(flux);
        var timeStr = latest.time_tag ? new Date(latest.time_tag).toUTCString().replace(' GMT', '') + ' UTC' : '—';

        setText('sw-xray-value', info.cls);
        setText('sw-xray-label', info.label);
        setText('sw-xray-flux',  fmtSI(flux));
        setText('sw-xray-time',  timeStr);
        setDot('sw-xray-status', info.dot);
      })
      .catch(function() {
        setText('sw-xray-label', 'Data unavailable');
        setDot('sw-xray-status', 'err');
      });
  }

  // Proton API returns objects: {time_tag, satellite, flux, energy}
  // Energy strings: '>=1 MeV', '>=5 MeV', '>=10 MeV', '>=30 MeV', etc.
  function loadProton() {
    fetchJSON('https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json')
      .then(function(data) {
        var ch10 = data.filter(function(d) {
          return d.energy === '>=10 MeV' || d.energy === '>=10MeV';
        });
        var latest = ch10.length ? ch10[ch10.length - 1] : null;
        if (!latest) throw new Error('No >=10 MeV channel found');
        var pfu = (latest.flux !== undefined) ? latest.flux : latest.observed_flux;
        var info = protonScale(pfu);
        var pfuValid = pfu !== null && pfu !== undefined && !isNaN(+pfu);

        setText('sw-proton-value', pfuValid ? (+pfu).toFixed(2) : '—');
        setText('sw-proton-label', +pfu >= 10 ? 'Solar Radiation Event' : 'Quiet \u2014 Below threshold');
        setText('sw-proton-flux',  pfuValid ? (+pfu).toFixed(2) + ' pfu' : '—');
        setText('sw-proton-scale', info.scale);
        setDot('sw-proton-status', info.dot);
      })
      .catch(function() {
        setText('sw-proton-label', 'Data unavailable');
        setDot('sw-proton-status', 'err');
      });
  }

  // Solar wind plasma: array rows [time_tag, density, speed, temperature]
  // Solar wind mag:    array rows [time_tag, bx, by, bz, lon, lat, bt]
  // Row 0 is the header row (strings), skip it
  function loadSolarWind() {
    Promise.all([
      fetchJSON('https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json'),
      fetchJSON('https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json')
    ])
    .then(function(results) {
      var plasma = results[0];
      var mag    = results[1];

      // Skip header row (index 0 contains column name strings)
      var latestP = plasma[plasma.length - 1];
      var latestM = mag[mag.length - 1];

      var density = latestP[1];
      var speed   = latestP[2];
      var temp    = latestP[3];
      var bz      = latestM[3];
      var bt      = latestM[6];

      setText('sw-wind-speed',   fmt(speed,   0) + ' km/s');
      setText('sw-wind-density', fmt(density, 1) + ' /cm\u00B3');
      setText('sw-wind-temp',    fmtTemp(temp));
      setText('sw-wind-bz',      fmt(bz, 1) + ' nT');
      setText('sw-wind-bt',      fmt(bt, 1) + ' nT');

      // Southward Bz is geoeffective — flag it
      var bzNum = +bz;
      var dot = (bzNum < -10) ? 'err' : (bzNum < -5) ? 'warn' : 'ok';
      setDot('sw-wind-status', dot);
    })
    .catch(function() {
      setText('sw-wind-speed', 'Unavailable');
      setDot('sw-wind-status', 'err');
    });
  }

  // Alerts: array of {product_id, issue_datetime, message}
  // SECURITY: message text is set via textContent only — no innerHTML on external data
  function loadAlerts() {
    fetchJSON('https://services.swpc.noaa.gov/products/alerts.json')
      .then(function(data) {
        var cutoff = Date.now() - 6 * 3600 * 1000;
        var active = data.filter(function(a) {
          var t = a.issue_datetime ? new Date(a.issue_datetime).getTime() : 0;
          return t > cutoff && /WATCH|WARNING|ALERT/i.test(a.message || '');
        });

        var banner = el('sw-alert-banner');
        if (!banner) return;
        if (active.length === 0) { banner.style.display = 'none'; return; }

        // Sanitize: use DOM textContent only — prevents any XSS from API data
        var raw = sanitizeText(active[0].message || '');
        var preview = raw.split('\n').slice(0, 3).join(' ').substring(0, 220);
        var suffix  = preview.length >= 220 ? '\u2026' : '';

        // Build banner safely with DOM nodes — no innerHTML on external content
        while (banner.firstChild) banner.removeChild(banner.firstChild);
        var icon   = document.createTextNode('\u26A0\uFE0F ');
        var strong = document.createElement('strong');
        strong.textContent = 'NOAA Alert: ';
        var text = document.createTextNode(preview + suffix);
        banner.appendChild(icon);
        banner.appendChild(strong);
        banner.appendChild(text);
        banner.style.display = 'block';
      })
      .catch(function() { /* alerts are non-critical — fail silently */ });
  }

  // ── Load all & auto-refresh ──────────────────────────────────────────────

  function loadAll() {
    loadKp();
    loadXray();
    loadProton();
    loadSolarWind();
    loadAlerts();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!el('space-weather-monitor')) return;   // guard: section only on index.html

    loadAll();

    // Auto-refresh every 5 minutes
    setInterval(loadAll, 5 * 60 * 1000);

    // Manual refresh button
    var btn = el('sw-refresh-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        btn.textContent = 'Refreshing\u2026';
        btn.disabled = true;
        loadAll();
        setTimeout(function () {
          btn.textContent = '\uD83D\uDD04 Refresh Now';
          btn.disabled = false;
        }, 3000);
      });
    }
  });

})();
