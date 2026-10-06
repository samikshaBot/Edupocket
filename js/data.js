/* ═══════════════════════════════════════════
   EduPocket · Data  (v2)
   File: js/data.js
   Added: CS/IT Engineering subjects organised
          by category + general subjects
═══════════════════════════════════════════ */

/* ──────────────────────────────────────────
   SUBJECT CATEGORIES
   Each category has a label + list of subjects
   Shown as grouped sections in setup screen
────────────────────────────────────────── */
const SUBJECT_CATEGORIES = [
  {
    label: '💻 CS / IT Core',
    subjects: [
      'Data Structures & Algorithms', 'Object-Oriented Programming',
      'Operating Systems', 'Computer Networks', 'Database Management Systems',
      'Software Engineering', 'Computer Architecture', 'Theory of Computation',
      'Compiler Design', 'Discrete Mathematics'
    ]
  },
  {
    label: '🧠 AI / ML / Data Science',
    subjects: [
      'Artificial Intelligence', 'Machine Learning', 'Deep Learning',
      'Data Science', 'Natural Language Processing', 'Computer Vision',
      'Reinforcement Learning', 'Big Data Analytics', 'Data Mining'
    ]
  },
  {
    label: '🔐 Systems & Security',
    subjects: [
      'Cybersecurity', 'Cryptography', 'Network Security',
      'Cloud Computing', 'Distributed Systems', 'Parallel Computing',
      'Embedded Systems', 'IoT (Internet of Things)', 'Linux & System Administration'
    ]
  },
  {
    label: '🌐 Web / App Dev',
    subjects: [
      'Web Development (HTML/CSS/JS)', 'React / Frontend Frameworks',
      'Node.js / Backend Development', 'Mobile App Development (Android/iOS)',
      'REST APIs & Microservices', 'DevOps & CI/CD', 'Docker & Kubernetes'
    ]
  },
  {
    label: '📐 Maths & Science (Engineering)',
    subjects: [
      'Engineering Mathematics', 'Linear Algebra', 'Probability & Statistics',
      'Calculus & Differential Equations', 'Numerical Methods',
      'Digital Electronics & Logic Design', 'Signals & Systems'
    ]
  },
  {
    label: '📚 General / Other Streams',
    subjects: [
      'Mathematics', 'Physics', 'Chemistry', 'Biology',
      'History', 'Geography', 'Economics', 'English Literature',
      'Political Science', 'Psychology', 'Sociology',
      'Accountancy', 'Business Studies', 'Philosophy', 'Statistics'
    ]
  }
];

/* Flat list used elsewhere in the app */
const SUBJECTS = SUBJECT_CATEGORIES.flatMap(c => c.subjects);

/* ──────────────────────────────────────────
   QUIZ QUESTIONS  (same as before)
────────────────────────────────────────── */
const QUIZ_QUESTIONS = [
  {
    q: "You study a full chapter tonight. Without any revision, how much do you remember 3 days later?",
    category: "Memory Retention",
    ctx: "Measures your natural decay rate — how fast memories fade.",
    opts: ["Almost everything — my memory is strong","Around 70% — key points stick","Around 40% — a lot slips away","Barely anything — it just vanishes"],
    weights: [0,1,2,3],
    feedback: ["Excellent retention! Your memory consolidation is strong.","Good retention. Spaced revision will lock it in fully.","Moderate decay detected. You need structured review sessions.","High decay rate — spaced repetition is essential for you."]
  },
  {
    q: "You feel confident after finishing a topic. One week later during practice, you:",
    category: "Confidence vs Reality",
    ctx: "Detects the 'illusion of knowing' — a major cause of exam failure.",
    opts: ["Ace it — confidence was well founded","Remember most things, miss a few details","Struggle a lot — confidence was false","Feel like I never studied it at all"],
    weights: [0,1,2,3],
    feedback: ["Great calibration! Your confidence matches your actual memory.","Slight overconfidence. Do a quick retrieval check after studying.","Significant illusion of knowing detected. Always test yourself after study.","Strong illusion of knowing. Switch from re-reading to self-quizzing immediately."]
  },
  {
    q: "You're studying at 11 PM after a long day. New information tends to:",
    category: "Cognitive Load",
    ctx: "Checks how sensitive your memory is to fatigue and overload.",
    opts: ["Stick well — I do my best work at night","Mostly stick, but I re-read next day","Fade quickly — I need to review it again soon","Not register at all — night study is useless for me"],
    weights: [0,1,2,3],
    feedback: ["You're a night owl — your brain encodes well under fatigue.","Mild cognitive load sensitivity. Consider easier tasks at night.","Clear cognitive fatigue detected. Study complex topics in the morning.","High sensitivity to fatigue. Protect your peak energy hours for hard material."]
  },
  {
    q: "When you forget something, it's most commonly:",
    category: "Forgetfulness Type",
    ctx: "Identifying what TYPE you forget helps classify your forgetfulness pattern.",
    opts: ["Small facts, dates, or numbers","Concepts, logic, or reasoning chains","Step-by-step procedures or code logic","Entire topics — like I never studied them"],
    weights: [1,2,1,3],
    feedback: ["Factual decay — easy to fix with spaced flashcards.","Conceptual forgetting — try teaching topics out loud to yourself.","Procedural forgetting — regular practice problems (or coding) are your fix.","Wholesale topic erasure — high decay, needs urgent review strategy."]
  },
  {
    q: "Which best describes your revision habit?",
    category: "Study Pattern",
    ctx: "Revision frequency is the #1 predictor of long-term memory.",
    opts: ["I revise every topic on a fixed schedule","I revise a topic a day before the exam","I revise only when I feel I'm forgetting","I don't really have a revision plan"],
    weights: [0,2,1,3],
    feedback: ["Excellent habit! Scheduled review is the gold standard.","Last-minute cramming leads to short-term recall only.","Reactive revision is better than none — try being proactive.","No revision plan = major forgetting risk. We'll build one for you!"]
  },
  {
    q: "Something important you studied 2 weeks ago — without looking, you can recall:",
    category: "Long-Term Retention",
    ctx: "Probes your long-term memory store depth.",
    opts: ["Everything clearly and in detail","Key points and main ideas","Only vague outlines remain","Almost nothing — it's completely gone"],
    weights: [0,1,2,3],
    feedback: ["Excellent long-term storage!","Good retention at 2 weeks — one review session would perfect this.","Significant long-term decay. Reviews at day 3, 7, 21 would help.","Critical long-term loss. You need a full spaced-repetition system immediately."]
  },
  {
    q: "You're studying with your phone nearby and music on. Compared to focused study, you retain:",
    category: "Distraction Sensitivity",
    ctx: "Split attention dramatically reduces memory encoding quality.",
    opts: ["The same — distractions don't affect me","Slightly less — mostly fine though","Significantly less — I get distracted often","Almost nothing extra"],
    weights: [0,1,2,3],
    feedback: ["Good focus resilience!","Mild sensitivity. A phone-free zone would boost retention.","High distraction sensitivity. Environment control is crucial for you.","Extreme sensitivity. Deep work sessions (phone in another room) are a must."]
  },
  {
    q: "A question appears from a topic you studied 1 month ago. You:",
    category: "Memory Retrieval",
    ctx: "Tests how well memories survive over 30 days.",
    opts: ["Answer confidently and correctly","Need a minute, then recall most of it","Can only recall fragments","Draw a complete blank"],
    weights: [0,1,2,3],
    feedback: ["Outstanding 1-month retention!","Good retrieval with a small delay — totally normal.","Fragmented retrieval at 1 month — revisit topics at week 2.","Complete retrieval failure — spaced review is urgent."]
  },
  {
    q: "How do you usually discover you've forgotten something?",
    category: "Self-Awareness",
    ctx: "Metacognitive awareness = knowing what you don't know.",
    opts: ["I test myself regularly, so I catch it early","I notice during practice questions","I realise when an exam is approaching","I only realise during the actual exam — too late"],
    weights: [0,1,2,3],
    feedback: ["Excellent metacognitive awareness!","Good awareness. Slightly earlier testing would improve results.","Reactive awareness — try building weekly mini-tests into your routine.","Critical awareness gap. Start doing daily 5-question self-tests from today."]
  },
  {
    q: "When you study multiple subjects in one sitting, you notice that:",
    category: "Interference Pattern",
    ctx: "Proactive and retroactive interference causes subjects to overwrite each other.",
    opts: ["Each subject stays separate in my memory","Occasionally I mix up similar topics","I often confuse content across subjects","Studying multiple subjects makes me forget all of them"],
    weights: [0,1,2,3],
    feedback: ["Very low interference — great mental compartmentalisation.","Mild interference — leave 10 mins between subject switches.","High interference. Study one subject per session.","Extreme interference. Single-subject focused days are essential for you."]
  },
  {
    q: "You make notes while studying. When you return to them later, they feel:",
    category: "Encoding Quality",
    ctx: "Good notes = good encoding. Poor notes = shallow processing.",
    opts: ["Clear, complete — they capture my full understanding","Mostly useful but missing some things","Confusing — I struggle to understand my own notes","Useless — I never really understood while writing them"],
    weights: [0,1,2,3],
    feedback: ["Strong encoding quality.","Decent encoding. Try summarising each section in 1 sentence.","Shallow encoding detected. Use concept maps instead of linear notes.","Surface-level encoding — try the Feynman technique."]
  },
  {
    q: "After a study session, how quickly do you feel mentally drained?",
    category: "Cognitive Capacity",
    ctx: "Measures your working memory capacity and session sustainability.",
    opts: ["Rarely — I can study for hours without overload","After 2–3 hours I hit a wall","I hit overload after about 1 hour","30–45 mins and I'm mentally exhausted"],
    weights: [0,1,2,3],
    feedback: ["High cognitive capacity! Use it for hard material.","Normal capacity. Use 25-min sprints with 5-min breaks (Pomodoro).","Limited capacity. Shorter sessions with active recall work better.","Very low overload threshold. 20-minute micro-sessions with breaks are ideal."]
  }
];