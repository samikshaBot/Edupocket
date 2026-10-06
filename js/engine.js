/* ═══════════════════════════════════════════
   EduPocket · Engine
   File: js/engine.js
   Purpose: Takes raw quiz answers → computes
            FPI, cognitive load, forgetfulness
            type, context patterns, triggers
═══════════════════════════════════════════ */

const Engine = {

  /* ────────────────────────────────────────
     Main compute function.
     Call after quiz is complete.
     Returns a big "results" object used
     by all dashboard / chart / heatmap code.
  ──────────────────────────────────────── */
  compute(answers, profile) {

    /* 1. Raw score & FPI */
    const total      = answers.reduce((a, b) => a + b, 0);
    const maxPossible = QUIZ_QUESTIONS.length * 3;
    const fpi        = Math.round((total / maxPossible) * 100);

    /* 2. Accuracy (inverse of FPI) */
    const accuracy = 100 - fpi;

    /* 3. Category breakdown
          Pull specific question answers by index
    */
    const retentionScore  = answers[0] + answers[5];          // Q1 + Q6
    const interferScore   = answers[9] + answers[6];          // Q10 + Q7
    const encodingScore   = answers[10] + answers[2];         // Q11 + Q2
    const retrievalScore  = answers[7] + answers[8];          // Q8 + Q9
    const cogLoadScore    = answers[11] + answers[2] + answers[6]; // Q12 + Q3 + Q7

    /* 4. Cognitive Load */
    const avgCog = cogLoadScore / 3;
    let cogLoad, cogIcon, cogMsg, cogRec;
    if (avgCog >= 2.3) {
      cogLoad = 'Critical';    cogIcon = '🔴';
      cogMsg  = 'You are severely cognitively overloaded. Long sessions are counterproductive — your brain is rejecting new information.';
      cogRec  = 'Use 20-min Pomodoro blocks with 10-min breaks. Max 3 sessions per day.';
    } else if (avgCog >= 1.6) {
      cogLoad = 'High';        cogIcon = '🟠';
      cogMsg  = 'High cognitive load detected. You can still learn effectively with better session design.';
      cogRec  = 'Limit topics to 2–3 per session. Take breaks every 45 minutes.';
    } else if (avgCog >= 0.9) {
      cogLoad = 'Moderate';    cogIcon = '🟡';
      cogMsg  = 'Moderate cognitive load. Your brain handles information well with some planning.';
      cogRec  = 'Use 3 subjects per day with active recall at the end of each session.';
    } else {
      cogLoad = 'Low';         cogIcon = '🟢';
      cogMsg  = 'Excellent cognitive capacity! You handle information very efficiently.';
      cogRec  = 'This is your peak — tackle your hardest topics now.';
    }

    /* 5. Forgetfulness type classification
          Each type gets a computed score
    */
    const types = [
      {
        type:  'Decay',
        icon:  '⏳',
        score: retentionScore,
        desc:  'Memories fade simply because time passes without reinforcement.',
        fix:   'Spaced repetition — review at day 1, 3, 7, 14, 30.'
      },
      {
        type:  'Encoding Failure',
        icon:  '📥',
        score: encodingScore,
        desc:  'Information was never properly stored during the original learning.',
        fix:   'Slow down. Use the Feynman technique — explain it in simple words.'
      },
      {
        type:  'Retrieval Failure',
        icon:  '🔍',
        score: retrievalScore,
        desc:  'The memory exists but you cannot access it without the right trigger.',
        fix:   'Practice free recall and use retrieval cues like mnemonics.'
      },
      {
        type:  'Interference',
        icon:  '🌀',
        score: interferScore,
        desc:  'New learning disrupts old memories, or old memories block new learning.',
        fix:   'Study one subject per session and sleep after learning (consolidation).'
      }
    ];
    const sortedTypes = [...types].sort((a, b) => b.score - a.score);
    const primaryType = sortedTypes[0];

    /* 6. Context-based detection */
    const contextItems = Engine._detectContext(answers, profile, fpi, cogLoad);

    /* 7. Next review timing */
    const nextReview = fpi >= 70 ? 1 : fpi >= 50 ? 2 : fpi >= 30 ? 4 : 7;

    /* 8. Spaced relearning triggers */
    const triggers = Engine._buildTriggers(profile.subjects, fpi, nextReview);

    /* 9. Study plan (7-day) */
    const studyPlan = Engine._buildStudyPlan(profile.subjects, cogLoad, sortedTypes[0].type);

    /* 10. Heatmap data (30 days) */
    const heatmapData = Engine._buildHeatmap(fpi);

    /* 11. Topic forgetting rates */
    const topicRates = profile.subjects.map(subj => ({
      subject: subj,
      rate:    Math.max(10, Math.min(95, fpi + (Math.random() * 30 - 15))) | 0
    })).sort((a, b) => b.rate - a.rate);

    return {
      fpi, accuracy, cogLoad, cogIcon, cogMsg, cogRec,
      nextReview, primaryType, sortedTypes, contextItems,
      triggers, studyPlan, heatmapData, topicRates
    };
  },

  /* ────────────────────────────────────────
     Context detection — maps quiz answers
     to specific learning environment issues
  ──────────────────────────────────────── */
  _detectContext(answers, profile, fpi, cogLoad) {
    const items = [];

    /* Pattern */
    const patterns = ['Scheduled daily revision', 'Pre-exam cramming', 'Reactive revision', 'Unstructured study'];
    items.push({ key: '🎯 Detected Pattern', val: patterns[answers[4]] || 'Unstructured study' });

    /* Primary risk */
    const risks = ['Overconfidence without self-testing', 'Interference between subjects', 'Fatigue-based encoding failure', 'Complete absence of revision strategy'];
    const riskIdx = Math.min(Math.floor(fpi / 25), 3);
    items.push({ key: '⚠️ Primary Risk', val: risks[riskIdx] });

    /* Study environment */
    const envs = ['Focused, distraction-free', 'Mild distractions present', 'High-distraction environment', 'Constant interruptions'];
    items.push({ key: '🏠 Study Environment', val: envs[answers[6]] || 'Unknown' });

    /* Memory anchor */
    const anchors = fpi > 60
      ? 'Visual associations + memory palace'
      : fpi > 35
      ? 'Active recall + spaced flashcards'
      : 'Self-testing + retrieval practice';
    items.push({ key: '🔗 Recommended Memory Anchor', val: anchors });

    /* Revision level */
    const levels = { 'Flashcards / Anki': 'Excellent — keep using it', 'Re-reading notes': 'Low effectiveness — switch to active recall', 'Practice questions / Past papers': 'Very effective — great choice', 'Mind maps / Diagrams': 'Good for conceptual subjects', "I don't revise regularly": 'Critical gap — must build a habit' };
    const revStyle = profile.revisionStyle || '';
    items.push({ key: '📚 Revision Effectiveness', val: levels[revStyle] || 'Not specified' });

    /* Forgetting window */
    const window = fpi > 65 ? 'Within 24 hours' : fpi > 40 ? '3–5 days' : '7–14 days';
    items.push({ key: '⏱ Likely Forgetting Window', val: window });

    return items;
  },

  /* ────────────────────────────────────────
     Spaced relearning triggers
     Builds a review schedule per subject
  ──────────────────────────────────────── */
  _buildTriggers(subjects, fpi, nextReview) {
    const baseIntervals = [1, 3, 7, 14, 30];
    const scale = fpi > 65 ? 0.5 : fpi > 40 ? 0.75 : 1;

    const tips = [
      'Do 5 flashcard questions without looking at notes.',
      'Write a 3-sentence summary from memory, then check.',
      'Solve 2 practice problems on this topic cold.',
      'Teach this topic to an imaginary student out loud.',
      'Create a mini-mind map from memory before reviewing notes.'
    ];

    return subjects.slice(0, 6).map((subj, i) => {
      const days   = Math.max(1, Math.round(baseIntervals[i % 5] * scale));
      const urgency = days <= 1 ? 'urgent' : days <= 4 ? 'soon' : 'ok';
      const label   = days <= 1 ? 'Review Today!' : days <= 4 ? `In ${days} days` : `In ${days} days`;
      const fill    = Math.round(100 - (days / 30) * 100);
      return { subj, days, urgency, label, fill, tip: tips[i % tips.length] };
    });
  },

  /* ────────────────────────────────────────
     7-day study plan tailored to the user
  ──────────────────────────────────────── */
  _buildStudyPlan(subjects, cogLoad, primaryType) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sessionLen = cogLoad === 'Critical' ? '20 min' : cogLoad === 'High' ? '35 min' : cogLoad === 'Moderate' ? '50 min' : '60 min';
    const plans = [
      { task: `New material: ${subjects[0] || 'Topic 1'}`, type: `${sessionLen} focused session` },
      { task: `Quick recall test: yesterday's content`, type: 'Retrieval practice — no notes' },
      { task: `New material: ${subjects[1] || 'Topic 2'}`, type: `${sessionLen} focused session` },
      { task: `Review: ${subjects[0] || 'Topic 1'} (spaced)`, type: 'Spaced repetition day' },
      { task: `New material: ${subjects[2] || 'Topic 3'}`, type: `${sessionLen} focused session` },
      { task: 'Mixed practice — all topics this week', type: 'Interleaved retrieval session' },
      { task: 'Rest or light review only', type: 'Memory consolidation day' }
    ];
    return days.map((d, i) => ({ day: d, ...plans[i] }));
  },

  /* ────────────────────────────────────────
     30-day heatmap data
     Generates realistic forgetting intensities
  ──────────────────────────────────────── */
  _buildHeatmap(fpi) {
    const base = fpi / 100;
    return Array.from({ length: 30 }, (_, i) => {
      const weekendDip = (i % 7 === 0 || i % 7 === 6) ? 0.85 : 1;
      const trend      = 1 - (i / 30) * 0.25;            // gradual improvement
      const noise      = (Math.random() - 0.5) * 0.35;
      const val        = Math.min(0.98, Math.max(0.05, base * weekendDip * trend + noise));
      return { day: i + 1, intensity: parseFloat(val.toFixed(2)) };
    });
  }
};