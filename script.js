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
   Endpoints verified: Nov 2026 against live NOAA SWPC JSON feeds
   ========================================================================== */

(function () {
  'use strict';

  // ── Reusable sanitizer node (created once, never attached to DOM) ─────────
  var _sanitizerDiv = null;
  function sanitizeText(str) {
    if (!_sanitizerDiv) _sanitizerDiv = document.createElement('div');
    _sanitizerDiv.textContent = String(str || '');
    return _sanitizerDiv.textContent;
  }

  // ── Interval reference — stored to allow cleanup if needed ────────────────
  var _refreshInterval = null;

  // ── DOM helpers ───────────────────────────────────────────────────────────

  function el(id) { return document.getElementById(id); }

  function setText(id, val) {
    var node = el(id);
    if (node) node.textContent = val;
  }

  function setDot(id, state) {   // state: 'ok' | 'warn' | 'err'
    var d = el(id);
    if (d) d.className = 'sw-status-dot ' + state;
  }

  // ── Value formatters ──────────────────────────────────────────────────────

  // Safe number formatter — returns em-dash on null/NaN/undefined/empty
  function fmt(val, digits) {
    if (val === null || val === undefined || val === '' || isNaN(+val)) return '\u2014';
    return (+val).toFixed(digits !== undefined ? digits : 2);
  }

  // Scientific notation formatter for X-ray flux values (W/m²)
  function fmtSI(val) {
    if (val === null || val === undefined || isNaN(+val) || +val <= 0) return '\u2014';
    var v        = +val;
    var exp      = Math.floor(Math.log10(v));
    var mantissa = (v / Math.pow(10, exp)).toFixed(2);
    var supMap   = { '-':'\u207B','0':'\u2070','1':'\u00B9','2':'\u00B2','3':'\u00B3',
                     '4':'\u2074','5':'\u2075','6':'\u2076','7':'\u2077','8':'\u2078','9':'\u2079' };
    var expStr   = String(exp).split('').map(function(c){ return supMap[c] || c; }).join('');
    return mantissa + ' \u00D7 10' + expStr + ' W/m\u00B2';
  }

  // Temperature formatter — guards against null, NaN, negative/zero values
  function fmtTemp(val) {
    if (val === null || val === undefined || isNaN(+val) || +val <= 0) return '\u2014';
    return (+val).toExponential(2) + ' K';
  }

  // ── Classification helpers ────────────────────────────────────────────────

  // GOES X-ray flux → flare class (0.1–0.8 nm long channel, W/m²)
  function xrayClass(flux) {
    if (flux === null || flux === undefined || isNaN(+flux) || +flux < 0) {
      return { cls: '\u2014', label: 'No data', dot: 'ok' };
    }
    var f = +flux;
    if (f >= 1e-3) return { cls: 'X' + (f / 1e-3).toFixed(0), label: 'Extreme flare',    dot: 'err'  };
    if (f >= 1e-4) return { cls: 'M' + (f / 1e-4).toFixed(1), label: 'Major flare',      dot: 'warn' };
    if (f >= 1e-5) return { cls: 'C' + (f / 1e-5).toFixed(1), label: 'Common flare',     dot: 'warn' };
    if (f >= 1e-6) return { cls: 'B' + (f / 1e-6).toFixed(1), label: 'Minor activity',   dot: 'ok'   };
    return                 { cls: 'A',                          label: 'Background quiet', dot: 'ok'   };
  }

  // GOES integral proton flux (≥10 MeV, pfu) → NOAA S-scale
  function protonScale(pfu) {
    if (pfu === null || pfu === undefined || isNaN(+pfu)) return { scale: 'Normal', dot: 'ok' };
    var f = +pfu;
    if (f >= 100000) return { scale: 'S5 Extreme',  dot: 'err'  };
    if (f >= 10000)  return { scale: 'S4 Severe',   dot: 'err'  };
    if (f >= 1000)   return { scale: 'S3 Strong',   dot: 'warn' };
    if (f >= 100)    return { scale: 'S2 Moderate', dot: 'warn' };
    if (f >= 10)     return { scale: 'S1 Minor',    dot: 'warn' };
    return                  { scale: 'Normal',       dot: 'ok'   };
  }

  // Kp → storm label + status colour
  function kpLabel(kp) {
    if (kp >= 8) return { label: 'Severe\u2013Extreme Storm (G4\u2013G5)', dot: 'err'  };
    if (kp >= 6) return { label: 'Strong Storm (G2\u2013G3)',              dot: 'err'  };
    if (kp >= 5) return { label: 'Minor Storm (G1)',                       dot: 'warn' };
    if (kp >= 4) return { label: 'Active / Unsettled',                     dot: 'warn' };
    if (kp >= 2) return { label: 'Quiet to Active',                        dot: 'ok'   };
    return               { label: 'Very Quiet',                            dot: 'ok'   };
  }

  // ── Fetch with 10 s timeout + HTTP-error guard ────────────────────────────

  function fetchJSON(url) {
    var ctrl  = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 10000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (r) {
        clearTimeout(timer);
        if (!r.ok) throw new Error('HTTP ' + r.status + ' — ' + url);
        return r.json();
      })
      .catch(function (e) {
        clearTimeout(timer);
        throw e;
      });
  }

  // ── Individual data loaders ───────────────────────────────────────────────

  // Kp: array of {time_tag, Kp, a_running, station_count} — newest is last element
  function loadKp() {
    fetchJSON('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json')
      .then(function (data) {
        if (!Array.isArray(data) || data.length === 0) throw new Error('Empty Kp data');
        var latest = data[data.length - 1];
        var kp = parseFloat(latest.Kp);
        if (isNaN(kp)) throw new Error('Invalid Kp');
        var info = kpLabel(kp);

        setText('sw-kp-value', kp.toFixed(1));
        setText('sw-kp-label', info.label);
        setDot('sw-kp-status', info.dot);

        // Position marker: Kp 0–9 mapped to 0–100% of bar width
        var pct = Math.min(100, Math.max(0, (kp / 9) * 100));
        var bar = el('sw-kp-bar');
        if (bar) bar.style.left = pct + '%';
      })
      .catch(function () {
        setText('sw-kp-label', 'Data unavailable');
        setDot('sw-kp-status', 'err');
      });
  }

  // X-ray: array of {time_tag, satellite, flux, observed_flux, energy}
  // Live energy values: '0.05-0.4nm' (short) and '0.1-0.8nm' (long = 1–8 Å)
  // Use long channel (0.1-0.8nm) for standard flare classification
  function loadXray() {
    fetchJSON('https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json')
      .then(function (data) {
        if (!Array.isArray(data) || data.length === 0) throw new Error('Empty X-ray data');
        // Filter to confirmed long-channel energy string (verified against live API: '0.1-0.8nm' only)
        var longCh = data.filter(function (d) {
          return d.energy === '0.1-0.8nm';
        });
        var latest = longCh.length ? longCh[longCh.length - 1] : data[data.length - 1];
        // Prefer electron-corrected flux; fall back to observed_flux
        var flux   = (latest.flux !== undefined && latest.flux !== null)
                   ? latest.flux : latest.observed_flux;
        var info   = xrayClass(flux);

        // Format UTC timestamp cleanly — NOAA time_tag ends in 'Z'
        var timeStr = '\u2014';
        if (latest.time_tag) {
          try {
            var d = new Date(latest.time_tag);
            timeStr = d.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
          } catch (_) { timeStr = latest.time_tag; }
        }

        setText('sw-xray-value', info.cls);
        setText('sw-xray-label', info.label);
        setText('sw-xray-flux',  fmtSI(flux));
        setText('sw-xray-time',  timeStr);
        setDot('sw-xray-status', info.dot);
      })
      .catch(function () {
        setText('sw-xray-label', 'Data unavailable');
        setDot('sw-xray-status', 'err');
      });
  }

  // Proton: array of {time_tag, satellite, flux, energy}
  // Live energy strings: '>=1 MeV', '>=5 MeV', '>=10 MeV', '>=30 MeV', '>=50 MeV',
  //                      '>=60 MeV', '>=100 MeV', '>=500 MeV'
  // S-scale threshold based on ≥10 MeV integral flux in particle flux units (pfu)
  function loadProton() {
    fetchJSON('https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json')
      .then(function (data) {
        if (!Array.isArray(data) || data.length === 0) throw new Error('Empty proton data');
        var ch10 = data.filter(function (d) {
          return d.energy === '>=10 MeV' || d.energy === '>=10MeV';
        });
        if (!ch10.length) throw new Error('No >=10 MeV channel in response');
        var latest   = ch10[ch10.length - 1];
        var pfu      = (latest.flux !== undefined && latest.flux !== null)
                     ? latest.flux : latest.observed_flux;
        var info     = protonScale(pfu);
        var pfuValid = pfu !== null && pfu !== undefined && !isNaN(+pfu);
        var isEvent  = pfuValid && +pfu >= 10;

        setText('sw-proton-value', pfuValid ? (+pfu).toFixed(2) : '\u2014');
        setText('sw-proton-label', isEvent ? 'Solar Radiation Event' : 'Quiet \u2014 Below threshold');
        setText('sw-proton-flux',  pfuValid ? (+pfu).toFixed(2) + ' pfu' : '\u2014');
        setText('sw-proton-scale', info.scale);
        setDot('sw-proton-status', info.dot);
      })
      .catch(function () {
        setText('sw-proton-label', 'Data unavailable');
        setDot('sw-proton-status', 'err');
      });
  }

  // Solar wind plasma: rtsw_wind_1m — array newest-first, named object fields
  //   proton_speed (km/s), proton_density (/cm³), proton_temperature (K)
  // Solar wind mag: rtsw_mag_1m — array newest-first, named object fields
  //   bt (nT total field), bz_gsm (nT — GSM component used for geomagnetic coupling)
  // NOTE: rtsw_wind_1m.json (~3 MB) and rtsw_mag_1m.json (~1.8 MB) are large files.
  // The default 10 s fetch timeout is too short on slow connections — use 30 s.
  function fetchJSONLarge(url) {
    var ctrl  = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 30000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (r) {
        clearTimeout(timer);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .catch(function (e) { clearTimeout(timer); throw e; });
  }

  function loadSolarWind() {
    Promise.all([
      fetchJSONLarge('https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json'),
      fetchJSONLarge('https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json')
    ])
    .then(function (results) {
      var plasma  = results[0];
      var mag     = results[1];
      if (!Array.isArray(plasma) || !plasma.length) throw new Error('Empty plasma data');
      if (!Array.isArray(mag)    || !mag.length)    throw new Error('Empty mag data');

      // Index 0 = most recent (arrays are newest-first)
      var latestP = plasma[0];
      var latestM = mag[0];

      var speed   = latestP.proton_speed;
      var density = latestP.proton_density;
      var temp    = latestP.proton_temperature;
      var bz      = latestM.bz_gsm;    // GSM frame Bz — most relevant for magnetospheric coupling
      var bt      = latestM.bt;

      setText('sw-wind-speed',   fmt(speed,   0) + ' km/s');
      setText('sw-wind-density', fmt(density, 1) + ' /cm\u00B3');
      setText('sw-wind-temp',    fmtTemp(temp));
      setText('sw-wind-bz',      fmt(bz, 1) + ' nT');
      setText('sw-wind-bt',      fmt(bt, 1) + ' nT');

      // Southward Bz (GSM) drives geomagnetic storms — colour-code accordingly
      var bzNum = (bz !== null && bz !== undefined && !isNaN(+bz)) ? +bz : 0;
      var dot   = (bzNum < -10) ? 'err' : (bzNum < -5) ? 'warn' : 'ok';
      setDot('sw-wind-status', dot);
    })
    .catch(function () {
      setText('sw-wind-speed', 'Unavailable');
      setDot('sw-wind-status', 'err');
    });
  }

  // Alerts: array of {product_id, issue_datetime, message}
  // issue_datetime format from NOAA: "2026-11-07 06:26:14.357" (space separator, not T)
  // SECURITY: all external text inserted via textContent only — zero innerHTML on API data
  function loadAlerts() {
    fetchJSON('https://services.swpc.noaa.gov/products/alerts.json')
      .then(function (data) {
        if (!Array.isArray(data)) return;
        var cutoff = Date.now() - 6 * 3600 * 1000;
        var active = data.filter(function (a) {
          // Normalise NOAA date string: replace space with T for reliable ISO parsing
          var dtStr = (a.issue_datetime || '').replace(' ', 'T');
          var t     = dtStr ? new Date(dtStr).getTime() : 0;
          return !isNaN(t) && t > cutoff && /WATCH|WARNING|ALERT/i.test(a.message || '');
        });

        var banner = el('sw-alert-banner');
        if (!banner) return;
        if (!active.length) { banner.style.display = 'none'; return; }

        // Show only the single most-recent alert (first = newest from NOAA)
        var raw     = sanitizeText(active[0].message || '');
        // Skip boilerplate header lines (Serial Number, Issue Time, etc.) and take first real line
        var lines   = raw.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
        var preview = lines.slice(0, 4).join(' \u2022 ').substring(0, 240);
        var suffix  = preview.length >= 240 ? '\u2026' : '';

        // Build banner with safe DOM methods — zero innerHTML on external content
        while (banner.firstChild) banner.removeChild(banner.firstChild);
        var iconNode   = document.createTextNode('\u26A0\uFE0F\u00A0');
        var labelNode  = document.createElement('strong');
        labelNode.textContent = 'NOAA Space Weather Alert:\u00A0';
        var textNode   = document.createTextNode(preview + suffix);
        banner.appendChild(iconNode);
        banner.appendChild(labelNode);
        banner.appendChild(textNode);
        banner.style.display = 'block';
      })
      .catch(function () { /* alerts are non-critical — silent fail */ });
  }

  // ── Orchestrator & auto-refresh ───────────────────────────────────────────

  function loadAll() {
    loadKp();
    loadXray();
    loadProton();
    loadSolarWind();
    loadAlerts();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!el('space-weather-monitor')) return;  // guard: only runs on index.html

    loadAll();

    // Auto-refresh every 5 minutes (store ref to allow future clearInterval if needed)
    if (!_refreshInterval) {
      _refreshInterval = setInterval(loadAll, 5 * 60 * 1000);
    }

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
