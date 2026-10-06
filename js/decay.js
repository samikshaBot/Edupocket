/* ═══════════════════════════════════════════
   EduPocket · Memory Decay Simulation
   File: js/decay.js
   Purpose: Animates the Ebbinghaus forgetting
            curve personalised to the user's FPI.
            Shows where memory drops below key
            thresholds and when to review.
═══════════════════════════════════════════ */

const DecaySim = {

  chart: null,

  /* ─────────────────────────────────────
     Ebbinghaus formula:
     R = e^(-t / S)
     R = retention (0–1)
     t = time in hours
     S = stability (higher = slower decay)
     We personalise S from the FPI score.
  ───────────────────────────────────── */
  _retention(t, stability) {
    return Math.exp(-t / stability) * 100;
  },

  /* Map FPI (0–100) to memory stability */
  _stabilityFromFPI(fpi) {
    /* FPI 0  → stability 120 (forgets very slowly)  */
    /* FPI 50 → stability  48 (average)              */
    /* FPI 100→ stability  10 (forgets very fast)    */
    return Math.max(8, 120 - (fpi * 1.12));
  },

  /* ─────────────────────────────────────
     Build the decay dataset
     Hours 0 → 720 (30 days)
  ───────────────────────────────────── */
  _buildCurve(stability, reviewPoints) {
    const points = [];
    const hours  = Array.from({ length: 721 }, (_, i) => i);

    let boost = 0; /* accumulated retention boost from reviews */

    hours.forEach(h => {
      /* Base decay */
      let base = this._retention(h, stability);

      /* Apply review boosts (each review resets the clock partially) */
      reviewPoints.forEach(rh => {
        if (h >= rh) {
          const timeSinceReview = h - rh;
          const boostedStab     = stability * 1.5; /* reviews increase stability */
          const boostVal        = this._retention(timeSinceReview, boostedStab);
          /* Take the better of base or boost */
          if (boostVal > base) base = boostVal;
        }
      });

      points.push({ x: h, y: Math.min(100, Math.max(0, base)) });
    });
    return points;
  },

  /* ─────────────────────────────────────
     Find when memory first drops below threshold
  ───────────────────────────────────── */
  _hoursBelowThreshold(stability, threshold) {
    for (let h = 0; h <= 720; h++) {
      if (this._retention(h, stability) <= threshold) return h;
    }
    return 720;
  },

  /* ─────────────────────────────────────
     Main render function
     Call: DecaySim.render(fpi, containerEl)
  ───────────────────────────────────── */
  render(fpi) {
    const stability    = this._stabilityFromFPI(fpi);
    const reviewPoints = this._suggestReviews(stability);
    const curve        = this._buildCurve(stability, []);
    const withReview   = this._buildCurve(stability, reviewPoints);

    const h80 = this._hoursBelowThreshold(stability, 80);
    const h50 = this._hoursBelowThreshold(stability, 50);
    const h20 = this._hoursBelowThreshold(stability, 20);

    /* Update info cards */
    document.getElementById('decay-h80').textContent = this._formatHours(h80);
    document.getElementById('decay-h50').textContent = this._formatHours(h50);
    document.getElementById('decay-h20').textContent = this._formatHours(h20);
    document.getElementById('decay-stability').textContent =
      fpi < 25 ? 'Strong' : fpi < 50 ? 'Moderate' : fpi < 75 ? 'Weak' : 'Very Weak';

    /* Build chart labels (every 24h = 1 day) */
    const labels = Array.from({ length: 721 }, (_, i) =>
      i % 24 === 0 ? 'Day ' + (i / 24) : ''
    );

    /* Sample every 4 hours for performance */
    const sample = (arr) => arr.filter((_, i) => i % 4 === 0);

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(document.getElementById('decay-chart'), {
      type: 'line',
      data: {
        labels: sample(labels),
        datasets: [
          {
            label:            'Without revision',
            data:             sample(curve).map(p => p.y),
            borderColor:      '#fc5c7d',
            backgroundColor:  'rgba(252,92,125,0.08)',
            tension:          0.4,
            fill:             true,
            borderWidth:      2,
            pointRadius:      0,
            pointHoverRadius: 4
          },
          {
            label:            'With spaced revision',
            data:             sample(withReview).map(p => p.y),
            borderColor:      '#43e89e',
            backgroundColor:  'rgba(67,232,158,0.06)',
            tension:          0.4,
            fill:             true,
            borderWidth:      2,
            borderDash:       [5, 3],
            pointRadius:      0,
            pointHoverRadius: 4
          }
        ]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 1200, easing: 'easeInOutQuart' },
        interaction:         { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => {
                const h = items[0].dataIndex * 4;
                return h < 24 ? `${h}h after studying` : `Day ${Math.floor(h/24)} (${h}h)`;
              },
              label: (item) => ` Memory: ${Math.round(item.parsed.y)}%`
            },
            backgroundColor: '#1a1929',
            borderColor:     'rgba(120,100,255,0.3)',
            borderWidth:     1
          }
        },
        scales: {
          y: {
            min: 0, max: 100,
            grid:  { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#888',
              font:  { size: 11 },
              callback: v => v + '%'
            }
          },
          x: {
            grid:  { display: false },
            ticks: {
              color:        '#888',
              font:         { size: 10 },
              maxRotation:  0,
              autoSkip:     true,
              maxTicksLimit: 8
            }
          }
        }
      }
    });

    /* Render review schedule markers */
    this._renderReviewMarkers(reviewPoints, stability);
  },

  /* ─────────────────────────────────────
     Suggest optimal review times
  ───────────────────────────────────── */
  _suggestReviews(stability) {
    /* Review when memory hits ~65% then 70% etc */
    const points = [];
    const thresholds = [0.65, 0.68, 0.70, 0.72, 0.74];
    let   lastReview = 0;
    let   curStab    = stability;

    thresholds.forEach(t => {
      for (let h = lastReview + 1; h <= 720; h++) {
        if (Math.exp(-(h - lastReview) / curStab) <= t) {
          points.push(h);
          lastReview = h;
          curStab   *= 1.5; /* memory gets stronger each review */
          break;
        }
      }
    });
    return points;
  },

  /* ─────────────────────────────────────
     Render review schedule as human-readable list
  ───────────────────────────────────── */
  _renderReviewMarkers(points, stability) {
    const el = document.getElementById('decay-reviews');
    const retentions = points.map(h => Math.round(this._retention(h, stability)));
    el.innerHTML = points.map((h, i) => `
      <div class="decay-review-row">
        <span class="decay-review-when">${this._formatHours(h)}</span>
        <div class="decay-review-bar-wrap">
          <div class="decay-review-bar">
            <div class="decay-review-fill" style="width:${retentions[i]}%"></div>
          </div>
          <span class="decay-review-pct">${retentions[i]}% memory left</span>
        </div>
        <span class="decay-review-label">Review ${i + 1}</span>
      </div>
    `).join('');
  },

  /* ─────────────────────────────────────
     Format hours → human readable
  ───────────────────────────────────── */
  _formatHours(h) {
    if (h < 1)   return 'under 1 hour';
    if (h < 24)  return h + ' hours';
    const days = Math.floor(h / 24);
    const rem  = h % 24;
    return rem > 0 ? `${days}d ${rem}h` : `${days} days`;
  }
};