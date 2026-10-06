/* ═══════════════════════════════════════════
   EduPocket · Quiz
   File: js/quiz.js
   Purpose: Renders quiz questions one-by-one,
            collects answers, triggers Engine
═══════════════════════════════════════════ */

const Quiz = {
  idx:     0,
  answers: [],

  /* Start fresh */
  init() {
    this.idx     = 0;
    this.answers = [];
    this._render();
  },

  /* Render current question */
  _render() {
    const q    = QUIZ_QUESTIONS[this.idx];
    const pct  = Math.round(((this.idx + 1) / QUIZ_QUESTIONS.length) * 100);

    document.getElementById('quiz-step-label').textContent =
      `Question ${this.idx + 1} of ${QUIZ_QUESTIONS.length}`;
    document.getElementById('quiz-progress').style.width = pct + '%';
    document.getElementById('quiz-category').textContent  = q.category;
    document.getElementById('quiz-question').textContent  = q.q;
    document.getElementById('quiz-context').textContent   = q.ctx;

    /* Hide old feedback */
    const fb = document.getElementById('quiz-feedback');
    fb.style.display = 'none';
    fb.textContent   = '';

    /* Render option buttons */
    const optWrap = document.getElementById('quiz-options');
    optWrap.innerHTML = '';
    q.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className   = 'quiz-opt';
      btn.textContent = String.fromCharCode(65 + i) + '.  ' + opt;
      btn.onclick     = () => this._answer(i);
      optWrap.appendChild(btn);
    });
  },

  /* Handle an answer click */
  _answer(idx) {
    const q       = QUIZ_QUESTIONS[this.idx];
    const weight  = q.weights[idx];
    this.answers.push(weight);

    /* Disable all buttons + highlight */
    const btns = document.querySelectorAll('.quiz-opt');
    btns.forEach((b, i) => {
      b.classList.add('disabled');
      if (i === idx) {
        b.classList.add(weight <= 1 ? 'correct' : 'wrong');
      }
    });

    /* Show feedback */
    const fb = document.getElementById('quiz-feedback');
    fb.textContent   = q.feedback[idx];
    fb.className     = 'quiz-feedback ' + (weight === 0 ? 'good' : weight <= 1 ? 'okay' : 'bad');
    fb.style.display = 'block';

    /* Move to next after short pause */
    const delay = 1400;
    setTimeout(() => {
      this.idx++;
      if (this.idx < QUIZ_QUESTIONS.length) {
        this._render();
      } else {
        App.finishQuiz(this.answers);
      }
    }, delay);
  }
};