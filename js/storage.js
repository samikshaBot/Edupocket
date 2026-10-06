/* ═══════════════════════════════════════════
   EduPocket · Storage
   File: js/storage.js
   Purpose: Save & load results + profile
            using the browser's localStorage
            so data survives page refresh
═══════════════════════════════════════════ */

const Storage = {

  KEYS: {
    profile: 'ep_profile',
    results: 'ep_results',
    answers: 'ep_answers',
    savedAt: 'ep_saved_at'
  },

  /* ─────────────────────────────────────
     SAVE  — call after quiz finishes
  ───────────────────────────────────── */
  save(profile, results, answers) {
    try {
      localStorage.setItem(this.KEYS.profile, JSON.stringify(profile));
      localStorage.setItem(this.KEYS.results, JSON.stringify(results));
      localStorage.setItem(this.KEYS.answers, JSON.stringify(answers));
      localStorage.setItem(this.KEYS.savedAt, new Date().toISOString());
      return true;
    } catch (e) {
      console.warn('EduPocket: Could not save to localStorage.', e);
      return false;
    }
  },

  /* ─────────────────────────────────────
     LOAD  — call on page load
     Returns null if nothing saved yet
  ───────────────────────────────────── */
  load() {
    try {
      const profile = localStorage.getItem(this.KEYS.profile);
      const results = localStorage.getItem(this.KEYS.results);
      const answers = localStorage.getItem(this.KEYS.answers);
      const savedAt = localStorage.getItem(this.KEYS.savedAt);

      if (!profile || !results) return null;

      return {
        profile: JSON.parse(profile),
        results: JSON.parse(results),
        answers: JSON.parse(answers),
        savedAt: new Date(savedAt)
      };
    } catch (e) {
      console.warn('EduPocket: Could not load from localStorage.', e);
      return null;
    }
  },

  /* ─────────────────────────────────────
     CLEAR  — wipe everything (for retake)
  ───────────────────────────────────── */
  clear() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  },

  /* ─────────────────────────────────────
     HAS DATA  — quick check
  ───────────────────────────────────── */
  hasData() {
    return !!localStorage.getItem(this.KEYS.profile);
  },

  /* ─────────────────────────────────────
     FORMAT DATE  — e.g. "21 Mar 2026, 10:45 AM"
  ───────────────────────────────────── */
  formatDate(date) {
    if (!date) return '';
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
};