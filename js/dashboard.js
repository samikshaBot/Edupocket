/* ═══════════════════════════════════════════
   EduPocket · Dashboard
   File: js/dashboard.js
   Purpose: Fills every element on the
            dashboard screen with results data
═══════════════════════════════════════════ */

const Dashboard = {

  render(results, profile) {

    /* ── Header ── */
    document.getElementById('dash-greeting').textContent =
      `Hey ${profile.name} 👋`;
    document.getElementById('dash-subjects-line').textContent =
      `Tracking: ${profile.subjects.join(' · ')}`;

    /* ── FPI Ring ── */
    this._drawFPI(results.fpi);

    /* ── Stat Cards ── */
    document.getElementById('stat-accuracy').textContent = results.accuracy + '%';
    document.getElementById('stat-cogload').textContent  = results.cogLoad;
    const weak = results.topicRates[0]?.subject || 'General';
    document.getElementById('stat-weak').textContent =
      weak.length > 9 ? weak.slice(0, 8) + '…' : weak;
    document.getElementById('stat-next').textContent = results.nextReview + 'd';

    /* ── Forgetfulness Types ── */
    const typeEl = document.getElementById('forget-type-list');
    document.getElementById('type-intro').textContent =
      `Your primary forgetfulness type is "${results.primaryType.type}". All four types ranked below:`;

    typeEl.innerHTML = results.sortedTypes.map((t, i) => `
      <div class="type-card ${i === 0 ? 'primary' : ''}">
        <div class="type-icon">${t.icon}</div>
        <div>
          <div class="type-title">
            ${t.type}
            ${i === 0 ? '<span class="badge primary-badge">Primary</span>' : ''}
            ${i === 1 ? '<span class="badge warn-badge">Secondary</span>' : ''}
          </div>
          <div class="type-desc">${t.desc}</div>
          <div class="type-desc" style="margin-top:4px;color:var(--accent4);">
            💡 Fix: ${t.fix}
          </div>
        </div>
      </div>
    `).join('');

    /* ── Context Detection ── */
    const ctxEl = document.getElementById('context-detection');
    ctxEl.innerHTML = results.contextItems.map(c => `
      <div class="ctx-row">
        <span class="ctx-key">${c.key}</span>
        <span class="ctx-val">${c.val}</span>
      </div>
    `).join('');
  },

  /* ─────────────────────────────────────
     Draw the FPI arc ring using Canvas
  ───────────────────────────────────── */
  _drawFPI(score) {
    const canvas  = document.getElementById('fpi-canvas');
    const ctx     = canvas.getContext('2d');
    const cx = 80, cy = 80, radius = 64, lineW = 12;

    /* Color based on score */
    const color =
      score < 25 ? '#43e89e' :
      score < 50 ? '#ffd166' :
      score < 75 ? '#fc9c5c' :
                   '#fc5c7d';

    ctx.clearRect(0, 0, 160, 160);

    /* Background ring */
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth   = lineW;
    ctx.stroke();

    /* Foreground arc */
    const endAngle = (score / 100) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth   = lineW;
    ctx.lineCap     = 'round';
    ctx.stroke();

    /* Animate the number counting up */
    const numEl   = document.getElementById('fpi-number');
    numEl.style.color = color;
    let current = 0;
    const step = Math.ceil(score / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, score);
      numEl.textContent = current;
      if (current >= score) clearInterval(timer);
    }, 30);

    /* Level text & description */
    const levels = [
      { label: '🟢 Low Forgetfulness',      desc: 'Excellent memory retention! You forget very little.',                   tip: 'Keep using your current strategy — it is working.' },
      { label: '🟡 Moderate Forgetfulness',  desc: 'Some forgetting patterns detected. Manageable with the right habits.',  tip: 'Add spaced repetition to lock in weak spots.' },
      { label: '🟠 High Forgetfulness',      desc: 'Significant forgetting occurring. Immediate action will help a lot.',   tip: 'Start reviewing topics within 24 hours of studying.' },
      { label: '🔴 Critical Forgetfulness',  desc: 'Very high forgetting rate — most studied material is being lost.',      tip: 'Switch to daily active recall sessions immediately.' }
    ];
    const lvl = score < 25 ? 0 : score < 50 ? 1 : score < 75 ? 2 : 3;
    document.getElementById('fpi-level').textContent     = levels[lvl].label;
    document.getElementById('fpi-level').style.color     = color;
    document.getElementById('fpi-desc').textContent      = levels[lvl].desc;
    document.getElementById('fpi-tip').textContent       = '→ ' + levels[lvl].tip;
  }
};