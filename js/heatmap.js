/* ═══════════════════════════════════════════
   EduPocket · Heatmap + Triggers
   File: js/heatmap.js
   Purpose: Builds the heatmap grid,
            topic chart, peak windows,
            trigger cards, load chart,
            and study plan
═══════════════════════════════════════════ */

const Heatmap = {
  topicChart: null,
  loadChart:  null,

  /* ─────────────────────────────────────
     HEATMAP SCREEN
  ───────────────────────────────────── */
  render(results) {
    this._buildGrid(results.heatmapData);
    this._buildTopicChart(results.topicRates);
    this._buildPeakWindows(results.heatmapData);
  },

  _buildGrid(data) {
    /* Day labels row */
    const labelEl = document.getElementById('day-labels');
    labelEl.innerHTML = ['S','M','T','W','T','F','S']
      .map(d => `<div class="day-lbl">${d}</div>`).join('');

    /* Cells */
    const grid = document.getElementById('heatmap-grid');
    grid.innerHTML = '';
    data.forEach(d => {
      const cell     = document.createElement('div');
      cell.className = 'heat-cell';

      /* Color: low = purple-tinted, high = red-tinted */
      const v   = d.intensity;
      const r   = Math.round(v * 252);
      const g   = Math.round((1 - v) * 92 + v * 92);
      const b   = Math.round((1 - v) * 252 + v * 125);
      const a   = (v * 0.75 + 0.12).toFixed(2);
      cell.style.background = `rgba(${r},${g},${b},${a})`;

      cell.addEventListener('mouseenter', () => {
        const pct  = Math.round(d.intensity * 100);
        const risk = pct > 65 ? '🔴 High risk' : pct > 40 ? '🟡 Moderate' : '🟢 Low risk';
        document.getElementById('heat-tooltip').textContent =
          `Day ${d.day} — Forgetting intensity: ${pct}%  ${risk}`;
      });
      grid.appendChild(cell);
    });
  },

  _buildTopicChart(topicRates) {
    /* Destroy old instance to prevent overlap */
    if (this.topicChart) { this.topicChart.destroy(); }

    const labels = topicRates.map(t =>
      t.subject.length > 10 ? t.subject.slice(0, 9) + '…' : t.subject
    );
    const values = topicRates.map(t => t.rate);
    const colors = values.map(v =>
      v > 65 ? '#fc5c7d' : v > 40 ? '#ffd166' : '#43e89e'
    );

    const canvas = document.getElementById('topic-chart');
    /* Force correct height */
    canvas.parentElement.style.height = Math.max(220, topicRates.length * 42) + 'px';

    this.topicChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Forgetting Rate %',
          data: values,
          backgroundColor: colors,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.x}% forgetting rate`
            }
          }
        },
        scales: {
          x: {
            min: 0, max: 100,
            grid:  { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#888', font: { size: 11 }, callback: v => v + '%' }
          },
          y: {
            grid:  { display: false },
            ticks: { color: '#ccc', font: { size: 11 } }
          }
        }
      }
    });
  },

  _buildPeakWindows(data) {
    const top3 = [...data]
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 3);

    document.getElementById('peak-windows').innerHTML = top3.map(d => {
      const pct  = Math.round(d.intensity * 100);
      return `
        <div class="peak-row">
          <span>Day ${d.day}</span>
          <div class="peak-bar-wrap">
            <div class="peak-bar">
              <div class="peak-bar-fill" style="width:${pct}%"></div>
            </div>
            <span class="peak-pct">${pct}%</span>
          </div>
        </div>
      `;
    }).join('');
  },

  /* ─────────────────────────────────────
     TRIGGERS SCREEN
  ───────────────────────────────────── */
  renderTriggers(results) {
    this._buildCogSummary(results);
    this._buildTriggerCards(results.triggers);
    this._buildLoadChart(results);
    this._buildStudyPlan(results.studyPlan);
  },

  _buildCogSummary(results) {
    document.getElementById('cog-summary').innerHTML = `
      <div class="cog-icon">${results.cogIcon}</div>
      <div>
        <div class="cog-title">Cognitive Load: ${results.cogLoad}</div>
        <div class="cog-msg">${results.cogMsg}</div>
        <div class="cog-rec">→ ${results.cogRec}</div>
      </div>
    `;
  },

  _buildTriggerCards(triggers) {
    document.getElementById('trigger-list').innerHTML = triggers.map(t => `
      <div class="trigger-card">
        <div class="trigger-top">
          <span class="trigger-subject">${t.subj}</span>
          <span class="trigger-badge ${t.urgency}">${t.label}</span>
        </div>
        <div class="trigger-interval">
          Spaced repetition interval: every ${t.days} day${t.days === 1 ? '' : 's'}
        </div>
        <div class="trigger-bar">
          <div class="trigger-bar-fill" style="width:${t.fill}%"></div>
        </div>
        <div class="trigger-tip">💡 ${t.tip}</div>
      </div>
    `).join('');
  },

  _buildLoadChart(results) {
    if (this.loadChart) { this.loadChart.destroy(); }

    const fpi  = results.fpi;
    const data = [
      Math.min(100, fpi - 10 + Math.round(Math.random() * 10)),
      Math.min(100, fpi + 5  + Math.round(Math.random() * 8)),
      Math.min(100, fpi - 5  + Math.round(Math.random() * 12)),
      Math.min(100, fpi + 3  + Math.round(Math.random() * 6)),
      Math.min(100, fpi      + Math.round(Math.random() * 8)),
      Math.min(100, fpi - 8  + Math.round(Math.random() * 10)),
      Math.min(100, fpi - 15 + Math.round(Math.random() * 6))
    ].map(v => Math.max(0, v));

    this.loadChart = new Chart(document.getElementById('load-chart'), {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Cognitive Load %',
          data,
          borderColor:     '#7c5cfc',
          backgroundColor: 'rgba(124,92,252,0.12)',
          tension:         0.4,
          fill:            true,
          pointBackgroundColor: '#7c5cfc',
          pointRadius:     5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` Load: ${ctx.parsed.y}%` } }
        },
        scales: {
          y: {
            min: 0, max: 100,
            grid:  { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#888', font: { size: 11 }, callback: v => v + '%' }
          },
          x: {
            grid:  { display: false },
            ticks: { color: '#888', font: { size: 11 } }
          }
        }
      }
    });
  },

  _buildStudyPlan(plan) {
    document.getElementById('study-plan').innerHTML = plan.map(p => `
      <div class="plan-row">
        <div class="plan-day">${p.day}</div>
        <div>
          <div class="plan-task">${p.task}</div>
          <div class="plan-type">${p.type}</div>
        </div>
      </div>
    `).join('');
  }
};