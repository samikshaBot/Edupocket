/* ═══════════════════════════════════════════
   EduPocket · Auth System
   File: js/auth.js
   Handles: register, login, logout,
            session management, streak tracking
═══════════════════════════════════════════ */

const Auth = {

  KEYS: {
    users:      'ep_users',
    session:    'ep_session',
  },

  /* ─────────────────────────────────────
     Get all registered users
  ───────────────────────────────────── */
  _getUsers() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.users)) || {}; }
    catch(e) { return {}; }
  },

  _saveUsers(users) {
    localStorage.setItem(this.KEYS.users, JSON.stringify(users));
  },

  /* ─────────────────────────────────────
     REGISTER  — creates new account
     Returns: { ok: true } or { ok: false, error: '...' }
  ───────────────────────────────────── */
  register(username, password) {
    username = username.trim().toLowerCase();
    if (!username || username.length < 3)
      return { ok: false, error: 'Username must be at least 3 characters.' };
    if (!password || password.length < 4)
      return { ok: false, error: 'Password must be at least 4 characters.' };

    const users = this._getUsers();
    if (users[username])
      return { ok: false, error: 'That username is already taken. Try another.' };

    /* Simple hash — good enough for local storage */
    const hash = this._hash(password);

    users[username] = {
      username,
      passwordHash: hash,
      displayName:  username.charAt(0).toUpperCase() + username.slice(1),
      createdAt:    new Date().toISOString(),
      streak:       0,
      lastLogin:    null,
      badges:       [],
      results:      null,
      profile:      null,
      answers:      null,
      loginHistory: []
    };
    this._saveUsers(users);
    return { ok: true };
  },

  /* ─────────────────────────────────────
     LOGIN
     Returns: { ok: true, user } or { ok: false, error }
  ───────────────────────────────────── */
  login(username, password) {
    username = username.trim().toLowerCase();
    const users = this._getUsers();
    const user  = users[username];

    if (!user)
      return { ok: false, error: 'No account found with that username.' };
    if (user.passwordHash !== this._hash(password))
      return { ok: false, error: 'Incorrect password. Please try again.' };

    /* Update streak */
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (user.lastLogin === today) {
      /* Already logged in today — keep streak */
    } else if (user.lastLogin === yesterday) {
      user.streak = (user.streak || 0) + 1;
    } else {
      user.streak = 1; /* streak broken — reset to 1 */
    }
    user.lastLogin = today;
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.unshift(new Date().toISOString());
    if (user.loginHistory.length > 10) user.loginHistory.pop();

    /* Check & award badges */
    user.badges = Badges.compute(user);

    this._saveUsers(users);

    /* Save session */
    localStorage.setItem(this.KEYS.session, JSON.stringify({ username, loginTime: new Date().toISOString() }));

    return { ok: true, user };
  },

  /* ─────────────────────────────────────
     LOGOUT
  ───────────────────────────────────── */
  logout() {
    localStorage.removeItem(this.KEYS.session);
  },

  /* ─────────────────────────────────────
     GET CURRENT SESSION USER
     Returns user object or null
  ───────────────────────────────────── */
  currentUser() {
    try {
      const session = JSON.parse(localStorage.getItem(this.KEYS.session));
      if (!session) return null;
      const users = this._getUsers();
      return users[session.username] || null;
    } catch(e) { return null; }
  },

  /* ─────────────────────────────────────
     SAVE USER DATA  (results after quiz)
  ───────────────────────────────────── */
  saveUserData(username, profile, results, answers) {
    const users = this._getUsers();
    if (!users[username]) return;
    users[username].results  = results;
    users[username].profile  = profile;
    users[username].answers  = answers;
    users[username].savedAt  = new Date().toISOString();
    users[username].badges   = Badges.compute(users[username]);
    this._saveUsers(users);
    /* Also update session cache */
    localStorage.setItem(this.KEYS.session, JSON.stringify({
      username,
      loginTime: JSON.parse(localStorage.getItem(this.KEYS.session))?.loginTime
    }));
  },

  /* ─────────────────────────────────────
     Simple string hash (djb2)
  ───────────────────────────────────── */
  _hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++)
      h = ((h << 5) + h) ^ str.charCodeAt(i);
    return (h >>> 0).toString(16);
  }
};


/* ═══════════════════════════════════════════
   BADGES SYSTEM
   8 unlockable badges with conditions
═══════════════════════════════════════════ */
const Badges = {

  ALL: [
    {
      id:    'first_quiz',
      icon:  '🎯',
      name:  'First Step',
      desc:  'Completed your first quiz',
      check: (u) => !!u.results
    },
    {
      id:    'low_fpi',
      icon:  '🧠',
      name:  'Memory Master',
      desc:  'Scored below 25 on the FPI — excellent retention!',
      check: (u) => u.results && u.results.fpi < 25
    },
    {
      id:    'streak_3',
      icon:  '🔥',
      name:  'On Fire',
      desc:  'Logged in 3 days in a row',
      check: (u) => (u.streak || 0) >= 3
    },
    {
      id:    'streak_7',
      icon:  '⚡',
      name:  'Week Warrior',
      desc:  'Maintained a 7-day login streak',
      check: (u) => (u.streak || 0) >= 7
    },
    {
      id:    'low_cogload',
      icon:  '🎓',
      name:  'Zen Scholar',
      desc:  'Achieved Low cognitive load rating',
      check: (u) => u.results && u.results.cogLoad === 'Low'
    },
    {
      id:    'high_accuracy',
      icon:  '💎',
      name:  'Sharp Mind',
      desc:  'Quiz accuracy above 80%',
      check: (u) => u.results && u.results.accuracy >= 80
    },
    {
      id:    'improver',
      icon:  '📈',
      name:  'Rising Star',
      desc:  'Completed 3 or more quizzes total',
      check: (u) => (u.quizCount || 0) >= 3
    },
    {
      id:    'all_subjects',
      icon:  '🌟',
      name:  'Polymath',
      desc:  'Tracked 5 or more subjects at once',
      check: (u) => u.profile && u.profile.subjects && u.profile.subjects.length >= 5
    }
  ],

  /* Returns array of earned badge IDs */
  compute(user) {
    return this.ALL
      .filter(b => b.check(user))
      .map(b => b.id);
  },

  /* Returns full badge objects — earned first, then locked */
  getAll(user) {
    const earned = new Set(user.badges || []);
    return this.ALL.map(b => ({ ...b, unlocked: earned.has(b.id) }));
  }
};