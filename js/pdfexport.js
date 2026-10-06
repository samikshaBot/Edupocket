/* ═══════════════════════════════════════════
   EduPocket · PDF Export
   File: js/pdfexport.js
   Purpose: Generates a full forgetfulness
            report PDF using jsPDF library
═══════════════════════════════════════════ */

const PDFExport = {

  /* ─────────────────────────────────────
     Main export function
     Call: PDFExport.generate(results, profile)
  ───────────────────────────────────── */
  generate(results, profile) {
    /* jsPDF is loaded via CDN in index.html */
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const W  = 210;   // A4 width mm
    const M  = 18;    // left margin
    const MR = W - M; // right margin x
    let   y  = 0;     // current Y position

    /* ── Colour palette ── */
    const C = {
      bg:       [15,  14,  23],
      surface:  [32,  31,  49],
      accent:   [124, 92,  252],
      green:    [67,  232, 158],
      yellow:   [255, 209, 102],
      red:      [252, 92,  125],
      white:    [232, 230, 240],
      muted:    [140, 138, 160]
    };

    /* ════════════════════════════════
       PAGE 1 — COVER
    ════════════════════════════════ */
    doc.setFillColor(...C.bg);
    doc.rect(0, 0, W, 297, 'F');

    /* Top accent bar */
    doc.setFillColor(...C.accent);
    doc.rect(0, 0, W, 2, 'F');

    /* Logo tag */
    y = 22;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.accent);
    doc.text('EDUPOCKET  ·  FORGETFULNESS DETECTION SYSTEM', M, y);

    /* Big title */
    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(...C.white);
    doc.text('Forgetfulness', M, y);
    y += 12;
    doc.text('Pattern Report', M, y);

    /* Subtitle */
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...C.muted);
    doc.text(`Prepared for ${profile.name}`, M, y);

    /* Date */
    y += 7;
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}`, M, y);

    /* Divider */
    y += 10;
    doc.setDrawColor(...C.accent);
    doc.setLineWidth(0.5);
    doc.line(M, y, MR, y);

    /* ── FPI Score Box ── */
    y += 12;
    const fpiColor = results.fpi < 25 ? C.green : results.fpi < 50 ? C.yellow : results.fpi < 75 ? [252,156,92] : C.red;
    doc.setFillColor(...C.surface);
    doc.roundedRect(M, y, W - M * 2, 38, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(42);
    doc.setTextColor(...fpiColor);
    doc.text(String(results.fpi), M + 10, y + 25);

    doc.setFontSize(11);
    doc.setTextColor(...C.muted);
    doc.text('/ 100', M + 10 + doc.getTextWidth(String(results.fpi)) + 3, y + 25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...C.white);
    const levels = ['Low Forgetfulness', 'Moderate Forgetfulness', 'High Forgetfulness', 'Critical Forgetfulness'];
    const lvl = results.fpi < 25 ? 0 : results.fpi < 50 ? 1 : results.fpi < 75 ? 2 : 3;
    doc.text(levels[lvl], M + 55, y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text('Forgetfulness Pattern Index (FPI)', M + 55, y + 24);
    doc.text(`Quiz Accuracy: ${results.accuracy}%   ·   Cognitive Load: ${results.cogLoad}`, M + 55, y + 31);

    /* ── 4 Quick Stats ── */
    y += 48;
    const stats = [
      { label: 'Quiz Accuracy',   val: results.accuracy + '%',  color: C.green  },
      { label: 'Cognitive Load',  val: results.cogLoad,          color: C.yellow },
      { label: 'Next Review',     val: results.nextReview + ' days', color: C.accent },
      { label: 'Primary Type',    val: results.primaryType.type, color: C.red    }
    ];
    const boxW = (W - M * 2 - 9) / 4;
    stats.forEach((s, i) => {
      const bx = M + i * (boxW + 3);
      doc.setFillColor(...C.surface);
      doc.roundedRect(bx, y, boxW, 22, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(s.val.length > 8 ? 8 : 11);
      doc.setTextColor(...s.color);
      doc.text(s.val, bx + boxW / 2, y + 11, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...C.muted);
      doc.text(s.label, bx + boxW / 2, y + 18, { align: 'center' });
    });

    /* ── Subjects ── */
    y += 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.accent);
    doc.text('SUBJECTS TRACKED', M, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...C.white);
    doc.text(profile.subjects.join('  ·  '), M, y, { maxWidth: W - M * 2 });

    /* ── Profile info ── */
    y += 14;
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text(`Study Level: ${profile.studyLevel}   ·   Daily Hours: ${profile.studyHours}   ·   Revision Style: ${profile.revisionStyle || 'Not specified'}`, M, y);

    /* ══════════════════════════════════
       PAGE 2 — DETAILED ANALYSIS
    ════════════════════════════════ */
    doc.addPage();
    doc.setFillColor(...C.bg);
    doc.rect(0, 0, W, 297, 'F');
    doc.setFillColor(...C.accent);
    doc.rect(0, 0, W, 2, 'F');

    y = 20;
    this._sectionTitle(doc, 'Forgetfulness Type Classification', M, y, C);

    y += 10;
    results.sortedTypes.forEach((t, i) => {
      doc.setFillColor(...C.surface);
      doc.roundedRect(M, y, W - M * 2, 26, 3, 3, 'F');

      if (i === 0) {
        doc.setDrawColor(...C.accent);
        doc.setLineWidth(0.6);
        doc.roundedRect(M, y, W - M * 2, 26, 3, 3, 'S');
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...C.white);
      doc.text(`${t.icon}  ${t.type}${i === 0 ? '  [PRIMARY]' : ''}`, M + 5, y + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text(t.desc, M + 5, y + 16, { maxWidth: W - M * 2 - 10 });

      doc.setTextColor(...C.yellow);
      doc.text('Fix: ' + t.fix, M + 5, y + 22, { maxWidth: W - M * 2 - 10 });

      y += 30;
    });

    /* ── Context Detection ── */
    y += 4;
    this._sectionTitle(doc, 'Context-Based Forgetfulness Detection', M, y, C);
    y += 10;

    results.contextItems.forEach(item => {
      doc.setFillColor(...C.surface);
      doc.roundedRect(M, y, W - M * 2, 12, 2, 2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text(item.key, M + 4, y + 8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C.white);
      doc.text(item.val, MR - 4, y + 8, { align: 'right', maxWidth: 80 });

      y += 15;
    });

    /* ══════════════════════════════════
       PAGE 3 — REVIEW SCHEDULE
    ════════════════════════════════ */
    doc.addPage();
    doc.setFillColor(...C.bg);
    doc.rect(0, 0, W, 297, 'F');
    doc.setFillColor(...C.accent);
    doc.rect(0, 0, W, 2, 'F');

    y = 20;
    this._sectionTitle(doc, 'Spaced-Relearning Trigger Schedule', M, y, C);

    y += 10;
    results.triggers.forEach(t => {
      const urgColor = t.urgency === 'urgent' ? C.red : t.urgency === 'soon' ? C.yellow : C.green;

      doc.setFillColor(...C.surface);
      doc.roundedRect(M, y, W - M * 2, 22, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...C.white);
      doc.text(t.subj, M + 5, y + 9);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...urgColor);
      doc.text(t.label, MR - 5, y + 9, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text(`Every ${t.days} day${t.days === 1 ? '' : 's'}  ·  ${t.tip}`, M + 5, y + 17, { maxWidth: W - M * 2 - 10 });

      y += 26;
    });

    /* ── Cognitive Load section ── */
    y += 6;
    this._sectionTitle(doc, 'Cognitive Load Analysis', M, y, C);
    y += 10;

    const cogColor = results.cogLoad === 'Critical' ? C.red : results.cogLoad === 'High' ? C.yellow : results.cogLoad === 'Moderate' ? [252,156,92] : C.green;
    doc.setFillColor(...C.surface);
    doc.roundedRect(M, y, W - M * 2, 30, 3, 3, 'F');
    doc.setDrawColor(...cogColor);
    doc.setLineWidth(0.8);
    doc.line(M, y, M, y + 30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...cogColor);
    doc.text(`${results.cogIcon}  Cognitive Load: ${results.cogLoad}`, M + 8, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(results.cogMsg, M + 8, y + 18, { maxWidth: W - M * 2 - 12 });

    doc.setTextColor(...C.yellow);
    doc.text('→ ' + results.cogRec, M + 8, y + 26, { maxWidth: W - M * 2 - 12 });

    y += 38;

    /* ── 7-Day Study Plan ── */
    this._sectionTitle(doc, '7-Day Personalised Study Plan', M, y, C);
    y += 10;

    results.studyPlan.forEach(p => {
      doc.setFillColor(...C.surface);
      doc.roundedRect(M, y, W - M * 2, 14, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...C.accent);
      doc.text(p.day, M + 4, y + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...C.white);
      doc.text(p.task, M + 20, y + 9);

      doc.setFontSize(7);
      doc.setTextColor(...C.muted);
      doc.text(p.type, MR - 4, y + 9, { align: 'right' });

      y += 17;
    });

    /* ── Footer on all pages ── */
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text('EduPocket  ·  Forgetfulness Detection System', M, 290);
      doc.text(`Page ${i} of ${totalPages}`, MR, 290, { align: 'right' });
    }

    /* ── Save the PDF ── */
    const filename = `EduPocket_Report_${profile.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(filename);
  },

  /* ─────────────────────────────────────
     Helper — draw a section title line
  ───────────────────────────────────── */
  _sectionTitle(doc, text, x, y, C) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.accent);
    doc.text(text.toUpperCase(), x, y);
    doc.setDrawColor(...C.accent);
    doc.setLineWidth(0.3);
    doc.line(x, y + 2, 210 - x, y + 2);
  }
};