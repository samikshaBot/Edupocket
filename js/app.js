/* ═══════════════════════════════════════════
   EduPocket · App Controller  (v3)
   File: js/app.js
   New in v3: Auth, Badges, Decay, AI Coach
═══════════════════════════════════════════ */

/* ──────────────────────────────
   AUTH UI — login/register screen
────────────────────────────── */
const Auth_UI = {
  showTab(tab) {
    document.getElementById('form-login').style.display    = tab === 'login'    ? 'block' : 'none';
    document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
    document.getElementById('login-error').textContent = '';
    document.getElementById('reg-error').textContent   = '';
  },

  login() {
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value;
    const r = Auth.login(u, p);
    if (!r.ok) { document.getElementById('login-error').textContent = r.error; return; }
    App._onLogin(r.user);
  },

  register() {
    const u = document.getElementById('reg-user').value.trim();
    const p = document.getElementById('reg-pass').value;
    const r = Auth.register(u, p);
    if (!r.ok) { document.getElementById('reg-error').textContent = r.error; return; }
    /* Auto-login after register */
    const lr = Auth.login(u, p);
    if (lr.ok) App._onLogin(lr.user);
  }
};

/* ──────────────────────────────
   MAIN APP
────────────────────────────── */
const App = {
  profile:     {},
  results:     null,
  currentUser: null,

  /* ── Navigation ── */
  goTo(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  goNav(tab) {
    const map = {
      dashboard: 'screen-dashboard',
      heatmap:   'screen-heatmap',
      triggers:  'screen-triggers',
      decay:     'screen-decay'
    };
    if (tab === 'heatmap')  Heatmap.render(this.results);
    if (tab === 'triggers') Heatmap.renderTriggers(this.results);
    if (tab === 'decay')    DecaySim.render(this.results.fpi);
    this.goTo(map[tab]);
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('nav-' + tab);
    if (btn) btn.classList.add('active');
  },

  /* ── Subject categories ── */
  _initSubjectCategories() {
    const wrap = document.getElementById('subject-categories');
    if (!this.profile.subjects) this.profile.subjects = [];
    wrap.innerHTML = SUBJECT_CATEGORIES.map(cat => `
      <div class="subj-category">
        <div class="subj-cat-label">${cat.label}</div>
        <div class="chip-wrap">
          ${cat.subjects.map(s => `
            <span class="chip" data-subject="${s}" onclick="App._toggleChip(this)">${s}</span>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  _toggleChip(el) {
    const subj = el.dataset.subject;
    el.classList.toggle('selected');
    if (!this.profile.subjects) this.profile.subjects = [];
    if (el.classList.contains('selected')) {
      if (!this.profile.subjects.includes(subj)) this.profile.subjects.push(subj);
    } else {
      this.profile.subjects = this.profile.subjects.filter(s => s !== subj);
    }
  },

  addCustomSubject() {
    const inp = document.getElementById('custom-subject');
    const val = inp.value.trim();
    if (!val) { alert('Please type a subject name first.'); return; }
    if (!this.profile.subjects) this.profile.subjects = [];
    if (!this.profile.subjects.includes(val)) {
      this.profile.subjects.push(val);
      /* Find the general section to append to */
      const wrap = document.querySelector('#subject-categories .chip-wrap:last-child') ||
                   document.getElementById('subject-categories');
      const chip = document.createElement('span');
      chip.className       = 'chip selected custom-chip';
      chip.dataset.subject = val;
      chip.textContent     = val + ' ✦';
      chip.onclick = () => {
        chip.classList.toggle('selected');
        this.profile.subjects = chip.classList.contains('selected')
          ? [...this.profile.subjects, val]
          : this.profile.subjects.filter(s => s !== val);
      };
      wrap.appendChild(chip);
    }
    inp.value = '';
  },

  /* ── Start quiz ── */
  startQuiz() {
    const name  = document.getElementById('user-name').value.trim();
    const level = document.getElementById('study-level').value;
    const hours = document.getElementById('study-hours').value;
    const style = document.getElementById('revision-style').value;
    const subjs = this.profile.subjects || [];
    if (!name)              { alert('Please enter your name.'); return; }
    if (subjs.length === 0) { alert('Please select at least one subject.'); return; }
    if (!level)             { alert('Please select your study level.'); return; }
    if (!hours)             { alert('Please select your daily study hours.'); return; }
    this.profile = { name, subjects: subjs, studyLevel: level, studyHours: hours, revisionStyle: style };
    Quiz.init();
    this.goTo('screen-quiz');
  },

  /* ── Finish quiz ── */
  finishQuiz(answers) {
    this.results = Engine.compute(answers, this.profile);

    /* Increment quiz count for badge */
    if (this.currentUser) {
      const users = Auth._getUsers();
      if (users[this.currentUser.username]) {
        users[this.currentUser.username].quizCount =
          (users[this.currentUser.username].quizCount || 0) + 1;
        Auth._saveUsers(users);
      }
      Auth.saveUserData(this.currentUser.username, this.profile, this.results, answers);
      this.currentUser = Auth.currentUser(); /* refresh */
    }

    document.getElementById('bottom-nav').style.display = 'flex';
    Dashboard.render(this.results, this.profile);
    this._renderBadges();
    this._renderStreak();
    this.goTo('screen-dashboard');
    document.getElementById('nav-dashboard').classList.add('active');
    this._showBanner('Results saved ✓');
  },

  /* ── AI Coach ── */
  async loadCoach() {
    await AICoach.renderCoachPanel(this.results, this.profile);
  },

  /* ── Badges ── */
  _renderBadges() {
    if (!this.currentUser) return;
    const all  = Badges.getAll(this.currentUser);
    const grid = document.getElementById('badge-grid');
    grid.innerHTML = all.map(b => `
      <div class="badge-item ${b.unlocked ? 'unlocked' : 'locked'}">
        <div class="badge-icon">${b.unlocked ? b.icon : '🔒'}</div>
        <div class="badge-name">${b.name}</div>
        <div class="badge-desc">${b.desc}</div>
      </div>
    `).join('');
  },

  /* ── Streak chip ── */
  _renderStreak() {
    if (!this.currentUser) return;
    const s = this.currentUser.streak || 0;
    const chip = document.getElementById('streak-chip');
    chip.textContent = s >= 3 ? `🔥 ${s} day streak!` : `🔥 ${s} day streak`;
    chip.className   = 'streak-chip' + (s >= 7 ? ' streak-hot' : '');
  },

  /* ── PDF export ── */
  exportPDF() {
    if (!this.results) { alert('Please complete the quiz first.'); return; }
    const btn  = document.getElementById('pdf-export-btn');
    const orig = btn.textContent;
    btn.textContent = 'Generating PDF…';
    btn.disabled    = true;
    setTimeout(() => {
      try {
        PDFExport.generate(this.results, this.profile);
        this._showBanner('PDF downloaded ✓');
      } catch(e) {
        alert('PDF generation failed: ' + e.message);
      }
      btn.textContent = orig;
      btn.disabled    = false;
    }, 100);
  },

  /* ── Retake ── */
  retakeQuiz() {
    if (!confirm('Retake the quiz? This will replace your saved results.')) return;
    this.profile.subjects = [];
    this._initSubjectCategories();
    Quiz.init();
    this.goTo('screen-quiz');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('nav-quiz').classList.add('active');
  },

  /* ── Logout ── */
  logout() {
    if (!confirm('Sign out?')) return;
    Auth.logout();
    this.currentUser = null;
    this.results     = null;
    this.profile     = {};
    document.getElementById('bottom-nav').style.display = 'none';
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    this.goTo('screen-auth');
  },

  /* ── On successful login ── */
  _onLogin(user) {
    this.currentUser = user;

    /* If user has existing results → restore to dashboard */
    if (user.results && user.profile) {
      this.results = user.results;
      this.profile = user.profile;
      document.getElementById('bottom-nav').style.display = 'flex';
      Dashboard.render(this.results, this.profile);
      this._renderBadges();
      this._renderStreak();
      this.goTo('screen-dashboard');
      document.getElementById('nav-dashboard').classList.add('active');
      this._showBanner(`Welcome back, ${user.displayName}! 🔥 ${user.streak}-day streak`);
    } else {
      /* New user → welcome screen */
      this.profile.subjects = [];
      this._initSubjectCategories();
      this.goTo('screen-welcome');
      this._showBanner(`Welcome, ${user.displayName}! Let's get started.`);
    }
  },

  /* ── Toast banner ── */
  _showBanner(msg) {
    let b = document.getElementById('save-banner');
    if (!b) { b = document.createElement('div'); b.id = 'save-banner'; document.body.appendChild(b); }
    b.textContent = msg;
    b.className   = 'save-banner show';
    setTimeout(() => b.classList.remove('show'), 3500);
  }
};

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  /* Check if already logged in (session persists) */
  const user = Auth.currentUser();
  if (user) {
    App._onLogin(user);
  } else {
    App.goTo('screen-auth');
  }
});