export async function generateCertPDF(cert) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297, H = 210;

  // Bone background
  doc.setFillColor(229, 215, 196);
  doc.rect(0, 0, W, H, 'F');

  // Kombu Green top & bottom bands
  doc.setFillColor(53, 64, 36);
  doc.rect(0, 0, W, 16, 'F');
  doc.rect(0, H - 16, W, 16, 'F');

  // Moss Green accent lines
  doc.setFillColor(136, 144, 99);
  doc.rect(0, 16, W, 3, 'F');
  doc.rect(0, H - 19, W, 3, 'F');

  // Outer border
  doc.setDrawColor(136, 144, 99);
  doc.setLineWidth(0.8);
  doc.rect(11, 23, W - 22, H - 46);

  // Inner border
  doc.setDrawColor(207, 187, 153);
  doc.setLineWidth(0.4);
  doc.rect(13.5, 25.5, W - 27, H - 51);

  // Corner ornaments
  [[11,23],[W-11,23],[11,H-23],[W-11,H-23]].forEach(([x,y]) => {
    doc.setFillColor(136, 144, 99);
    doc.circle(x, y, 2.8, 'F');
    doc.setDrawColor(53, 64, 36);
    doc.setLineWidth(0.4);
    doc.circle(x, y, 4.5, 'S');
  });

  // Logo in top band
  doc.setFillColor(229, 215, 196);
  doc.roundedRect(W/2 - 30, 4, 60, 14, 4, 4, 'F');
  doc.setTextColor(53, 64, 36);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SkillPath AI', W/2, 13.5, { align: 'center' });

  // Certificate title
  doc.setTextColor(136, 144, 99);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('C  E  R  T  I  F  I  C  A  T  E     O  F     C  O  M  P  L  E  T  I  O  N', W/2, 36, { align: 'center' });

  // Divider
  doc.setDrawColor(136, 144, 99);
  doc.setLineWidth(0.8);
  doc.line(W/2 - 54, 39, W/2 + 54, 39);

  // "This certifies"
  doc.setTextColor(76, 61, 25);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('This is to proudly certify that', W/2, 52, { align: 'center' });

  // Student name
  const name = cert.student_name || 'Student';
  const nameFz = name.length > 25 ? 22 : name.length > 18 ? 28 : 34;
  doc.setTextColor(53, 64, 36);
  doc.setFontSize(nameFz);
  doc.setFont('helvetica', 'bold');
  doc.text(name, W/2, 71, { align: 'center' });

  // Underline
  const nw = doc.getTextWidth(name);
  doc.setDrawColor(136, 144, 99);
  doc.setLineWidth(1.5);
  doc.line(W/2 - nw/2, 74.5, W/2 + nw/2, 74.5);

  // "has successfully completed"
  doc.setTextColor(76, 61, 25);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('has successfully completed the course', W/2, 85, { align: 'center' });

  // Course title
  const courseTitle = cert.course_title || 'Course';
  const cFz = courseTitle.length > 40 ? 13 : courseTitle.length > 28 ? 16 : 20;
  doc.setTextColor(53, 64, 36);
  doc.setFontSize(cFz);
  doc.setFont('helvetica', 'bold');
  doc.text(courseTitle, W/2, 99, { align: 'center' });

  // Stars
  doc.setTextColor(136, 144, 99);
  doc.setFontSize(13);
  doc.text('* * * * *', W/2, 109, { align: 'center' });

  // Divider
  doc.setDrawColor(207, 187, 153);
  doc.setLineWidth(0.5);
  doc.line(25, 117, W - 25, 117);

  // Footer 3 columns
  const now = new Date().toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' });
  const certId = cert.id || 'SKP-2025-XXXXXX';

  // Col 1 — Date
  doc.setTextColor(136, 144, 99);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('DATE OF ISSUE', W * 0.2, 125, { align: 'center' });
  doc.setTextColor(53, 64, 36);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(now, W * 0.2, 132, { align: 'center' });

  // Col 2 — Signature
  doc.setTextColor(136, 144, 99);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('AUTHORIZED SIGNATURE', W/2, 125, { align: 'center' });

  // Hand-drawn signature style
  const sx = W/2, sy = 140;
  doc.setDrawColor(53, 64, 36);
  doc.setLineWidth(0.8);
  doc.lines([[5,-4],[7,1],[4,4],[-3,3],[-5,0],[-3,-4],[5,-5],[8,1],[4,5]], sx-17, sy-5, [1,1]);
  doc.setLineWidth(0.5);
  doc.line(sx - 6, sy + 2, sx + 20, sy - 5);
  doc.line(sx + 20, sy - 5, sx + 25, sy - 1);
  doc.setDrawColor(136, 144, 99);
  doc.setLineWidth(0.5);
  doc.line(sx - 18, sy + 6, sx + 26, sy + 6);
  doc.setTextColor(53, 64, 36);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SkillPath AI', W/2, sy + 13, { align: 'center' });
  doc.setTextColor(136, 144, 99);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Director of Education', W/2, sy + 18, { align: 'center' });

  // Col 3 — Cert ID
  doc.setTextColor(136, 144, 99);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('CERTIFICATE ID', W * 0.8, 125, { align: 'center' });
  doc.setTextColor(53, 64, 36);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(certId, W * 0.8, 132, { align: 'center' });

  // Separators
  doc.setDrawColor(207, 187, 153);
  doc.setLineWidth(0.4);
  doc.line(W * 0.38, 120, W * 0.38, 152);
  doc.line(W * 0.62, 120, W * 0.62, 152);

  // Official seal
  doc.setFillColor(53, 64, 36);  doc.circle(30, H - 26, 13, 'F');
  doc.setFillColor(229, 215, 196); doc.circle(30, H - 26, 11, 'F');
  doc.setFillColor(53, 64, 36);  doc.circle(30, H - 26, 9, 'F');
  doc.setFillColor(136, 144, 99); doc.circle(30, H - 26, 7, 'F');
  doc.setTextColor(229, 215, 196);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED', 30, H - 24.5, { align: 'center' });
  doc.setFontSize(5);
  doc.text('SKILLPATH AI', 30, H - 21, { align: 'center' });

  // Verify URL in bottom band
  doc.setTextColor(136, 144, 99);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Verify at: skillpath.ai/verify/${certId}`, W/2, H - 7, { align: 'center' });

  // QR placeholder
  doc.setFillColor(229, 215, 196);
  doc.roundedRect(W - 32, H - 32, 20, 20, 2, 2, 'F');
  doc.setDrawColor(53, 64, 36);
  doc.setLineWidth(0.5);
  doc.roundedRect(W - 32, H - 32, 20, 20, 2, 2, 'S');
  doc.setFontSize(5.5);
  doc.setTextColor(53, 64, 36);
  doc.text('QR CODE', W - 22, H - 20, { align: 'center' });

  doc.save(`SkillPath-Certificate-${courseTitle.replace(/\s+/g, '-')}-${certId}.pdf`);
}