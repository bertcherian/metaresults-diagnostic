import { jsPDF } from 'jspdf';

const NAVY    = '#0D1B2A';
const NAVY_MID= '#1E3A5F';
const GOLD    = '#D4A017';
const IVORY   = '#F5F0E8';
const RED     = '#C0392B';
const BLUE    = '#2980B9';
const GREEN   = '#27AE60';
const ORANGE  = '#E67E22';
const PURPLE  = '#8E44AD';
const BOOK_URL= 'https://tidycal.com/metaresults/debrief';

const h2r = hex => [
  parseInt(hex.slice(1,3),16)/255,
  parseInt(hex.slice(3,5),16)/255,
  parseInt(hex.slice(5,7),16)/255,
];

export function buildPDF(participant, scores, sections, logoBase64) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = 595, H = 842, ml = 48, mr = 48, cw = W - ml - mr;
  const { name, email } = participant;
  const { thinking, fluency, confidence, presence, composite } = scores;

  const fk = c => doc.setFillColorRGB(...h2r(c));
  const tc = c => doc.setFillColorRGB(...h2r(c));
  const sp = (t, mw, font='Helvetica', sz=10.5) => doc.splitTextToSize(t, mw);
  const tx = (t, x, y, opts) => doc.text(t, x, y, opts || {});

  // ── BLOCK HELPER: heading at TOP, body flows down ─────────────
  const blk = (title, body, y, accent) => {
    const lines = doc.splitTextToSize(body, cw - 32);
    const TITLE_H = 38, BODY_LH = 15, PAD_BOT = 16;
    const bh = TITLE_H + lines.length * BODY_LH + PAD_BOT;
    fk(NAVY_MID); doc.roundRect(ml, y - bh, cw, bh, 6, 'F');
    fk(accent);   doc.roundRect(ml, y - bh, 4, bh, 2, 'F');
    doc.setFont('Helvetica-Bold', 'bold'); doc.setFontSize(18); tc(accent);
    tx(title, ml + 16, y - bh + 28);
    doc.setFont('Helvetica', 'normal'); doc.setFontSize(10.5); tc('#CCDDE9');
    lines.forEach((l, i) => tx(l, ml + 16, y - bh + TITLE_H + i * BODY_LH));
    return y - bh - 16;
  };

  const hdr = pg => {
    fk(NAVY); doc.rect(0, 0, W, H, 'F');
    fk(GOLD); doc.rect(0, H-4, W, 4, 'F'); doc.rect(0, 0, W, 4, 'F');
    fk(NAVY_MID); doc.rect(0, H-42, W, 38, 'F');
    doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(8); tc(GOLD);
    tx('META RESULTS  |  EXECUTIVE COMMUNICATION DIAGNOSTIC', ml, H-22);
    doc.setFont('Helvetica','normal'); tc('#335566');
    tx(`${name}  |  April 2026  |  Page ${pg}`, W-mr, H-22, {align:'right'});
  };

  const DIMS = [
    ['Thinking Speed & Structure', thinking, BLUE],
    ['Language Fluency',           fluency,  ORANGE],
    ['Confidence Under Pressure',  confidence, GREEN],
    ['Executive Presence',         presence, PURPLE],
  ];

  // ── PAGE 1: COVER ────────────────────────────────────────────
  fk(NAVY); doc.rect(0,0,W,H,'F');
  fk(GOLD); doc.rect(0,H-5,W,5,'F'); doc.rect(0,0,W,5,'F');

  // Logo
  if (logoBase64) {
    try { doc.addImage(`data:image/jpeg;base64,${logoBase64}`, 'JPEG', ml, H-72, 120, 32); }
    catch(e) { doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(10); tc(GOLD); tx('META RESULTS', ml, H-40); }
  }
  doc.setFont('Helvetica','normal'); doc.setFontSize(8.5); tc('#8899AA');
  tx('Think-On-Your-Feet Executive Communication Diagnostic', ml, H-54);
  doc.setDrawColorRGB(...h2r(GOLD)); doc.setLineWidth(0.5); doc.line(ml,H-64,W-mr,H-64);

  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(36); tc(IVORY);
  tx('EXECUTIVE', ml, H-180); tx('COMMUNICATION', ml, H-224); tc(GOLD); tx('DIAGNOSTIC REPORT', ml, H-268);

  // Participant card
  const cy = H-300, ch = 110;
  fk(NAVY_MID); doc.roundRect(ml, cy-ch, cw, ch, 6, 'F');
  fk(GOLD); doc.rect(ml, cy-ch, 4, ch, 'F');
  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(18); tc(IVORY); tx(name, ml+18, cy-28);
  doc.setFont('Helvetica','normal'); doc.setFontSize(9); tc(GOLD); tx(email, ml+18, cy-46);
  tc('#8899AA'); tx('April 2026  |  CONFIDENTIAL', ml+18, cy-62);

  // Composite circle
  const ccx = W-mr-56, ccy = cy-55;
  doc.setDrawColorRGB(...h2r(GOLD)); doc.setLineWidth(2.5); doc.circle(ccx,ccy,42,'S');
  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(30); tc(GOLD);
  tx(String(composite), ccx, ccy+4, {align:'center'});
  doc.setFontSize(8); tc('#8899AA');
  tx('/ 100', ccx, ccy-10, {align:'center'}); tx('COMPOSITE', ccx, ccy-22, {align:'center'});

  // Score bars
  let by = cy - ch - 30;
  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(9); tc(GOLD);
  tx('DIMENSION SCORES', ml, by); by -= 12;
  fk(NAVY_MID); doc.rect(ml, by, cw, 1, 'F');
  DIMS.forEach(([lbl, score, color], i) => {
    const dy = by - 18 - i * 34;
    doc.setFont('Helvetica','normal'); doc.setFontSize(8.5); tc('#AABBCC'); tx(lbl, ml, dy);
    fk('#122337'); doc.roundRect(ml, dy-13, cw-46, 8, 3, 'F');
    fk(color); doc.roundRect(ml, dy-13, Math.max(6,(cw-46)*score/25), 8, 3, 'F');
    doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(9); tc(IVORY);
    tx(`${score}/25`, W-mr, dy-7, {align:'right'});
  });

  // ── PAGE 2: HEADLINE + SNAPSHOT + HIDDEN GAP ─────────────────
  doc.addPage(); hdr(2); let y = H-62;
  fk(RED); doc.rect(ml,y,cw,2,'F'); y-=18;
  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(10); tc(RED); tx('HEADLINE',ml,y); y-=20;
  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(24); tc(IVORY);
  doc.splitTextToSize(sections['HEADLINE']||'',cw).forEach(l=>{tx(l,ml,y);y-=32;}); y-=18;

  fk(NAVY_MID); doc.rect(ml,y,cw,2,'F'); y-=22;
  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(18); tc('#5599CC'); tx('SNAPSHOT',ml,y); y-=16;
  doc.setFont('Helvetica','normal'); doc.setFontSize(10.5); tc('#CCDDE9');
  doc.splitTextToSize(sections['SNAPSHOT']||'',cw).forEach(l=>{tx(l,ml,y);y-=15;}); y-=20;

  const gl=[];
  (sections['THE HIDDEN GAP']||'').split('\n\n').forEach(p=>{
    gl.push(...doc.splitTextToSize(p.trim(),cw-32)); gl.push('');
  });
  const TITLE_H=38, BODY_LH=15, PAD_BOT=16;
  const gbh = TITLE_H + gl.length*BODY_LH + PAD_BOT;
  fk(NAVY_MID); doc.roundRect(ml,y-gbh,cw,gbh,6,'F');
  fk(GOLD); doc.roundRect(ml,y-gbh,4,gbh,2,'F');
  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(18); tc(GOLD); tx('THE HIDDEN GAP',ml+16,y-gbh+28);
  doc.setFont('Helvetica','normal'); doc.setFontSize(10.5); tc(IVORY);
  gl.forEach((l,i)=>tx(l,ml+16,y-gbh+TITLE_H+i*BODY_LH));

  // ── PAGE 3: COST + MOMENTS + PONR ────────────────────────────
  doc.addPage(); hdr(3); y=H-60;
  y=blk('COST OF INACTION',   sections['COST OF INACTION']||'',    y, RED);
  y=blk('MOMENTS THAT MATTER',sections['MOMENTS THAT MATTER']||'', y, BLUE);
  y=blk('POINT OF NO RETURN', sections['POINT OF NO RETURN']||'',  y, GOLD);

  // ── PAGE 4: WHAT NEEDS TO CHANGE ─────────────────────────────
  doc.addPage(); hdr(4); y=H-60;
  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(18); tc(GOLD);
  tx('WHAT NEEDS TO CHANGE', ml, y); y-=8;
  fk(GOLD); doc.rect(ml,y,cw,1,'F'); y-=20;

  const changeText = sections['WHAT NEEDS TO CHANGE']||'';
  const changeBlocks = changeText.split(/\n(?=From:)/i).filter(Boolean);
  changeBlocks.forEach((blkT, i) => {
    const fm = blkT.match(/From:\s*(.+)/i);
    const tm = blkT.match(/To:\s*(.+)/i);
    if (!fm||!tm) return;
    const fl = doc.splitTextToSize(fm[1].trim(), cw-80);
    const tl = doc.splitTextToSize(tm[1].trim(), cw-80);
    const bh = Math.max(fl.length,tl.length)*14+70;
    fk(NAVY_MID); doc.roundRect(ml,y-bh,cw,bh,6,'F');
    fk(GOLD); doc.circle(ml+20,y-26,12,'F');
    doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(12); tc(NAVY);
    tx(String(i+1),ml+20,y-30,{align:'center'});
    doc.setFont('Helvetica','normal'); doc.setFontSize(8); tc('#8899AA'); tx('FROM',ml+42,y-16);
    doc.setFontSize(10); tc('#CCDDE9'); fl.forEach((l,j)=>tx(l,ml+42,y-28-j*14));
    const ay=y-28-fl.length*14-6;
    doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(14); tc(GOLD); tx('->',ml+42,ay);
    doc.setFontSize(8); tc(GREEN); tx('TO',ml+62,ay);
    doc.setFontSize(10); tc(IVORY); tl.forEach((l,j)=>tx(l,ml+42,ay-14-j*14));
    y-=bh+14;
  });

  if (y>110) {
    const rh=80;
    fk(NAVY_MID); doc.roundRect(ml,y-rh,cw,rh,6,'F');
    fk(GOLD); doc.rect(ml,y-2,cw,2,'F'); doc.rect(ml,y-rh,cw,2,'F');
    doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(8); tc(GOLD);
    tx('PROJECTED OUTCOME — 12 WEEKS',ml+16,y-16);
    [['Composite',`${composite} → 87-92/100`],['Fluency',`${fluency}/25 → 20+/25`],['Perception','Executor → Strategic Voice']].forEach(([l,v],i)=>{
      const rx=ml+16+i*(cw/3);
      doc.setFont('Helvetica','normal'); doc.setFontSize(8); tc('#8899AA'); tx(l,rx,y-34);
      doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(10); tc(IVORY); tx(v,rx,y-48);
    });
  }

  // ── PAGE 5: INVITATION + BUTTON + CLOSE ──────────────────────
  doc.addPage(); hdr(5); y=H-60;
  const il=doc.splitTextToSize(sections['INVITATION']||'',cw-32);
  const ih=TITLE_H+il.length*BODY_LH+PAD_BOT+4;
  fk(NAVY_MID); doc.roundRect(ml,y-ih,cw,ih,8,'F');
  fk(GOLD); doc.roundRect(ml,y-4,cw,4,2,'F');
  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(18); tc(GOLD); tx('YOUR NEXT STEP',ml+16,y-28);
  doc.setFont('Helvetica','normal'); doc.setFontSize(10.5); tc(IVORY);
  il.forEach((l,i)=>tx(l,ml+16,y-TITLE_H-i*BODY_LH));
  y-=ih+24;

  // Booking button
  const bw=280, bh2=44, bx=ml+(cw-bw)/2;
  fk(GOLD); doc.roundRect(bx,y-bh2,bw,bh2,8,'F');
  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(13); tc(NAVY);
  tx('Book Your Strategic Debrief',bx+bw/2,y-bh2+18,{align:'center'});
  doc.link(bx,y-bh2,bw,bh2,{url:BOOK_URL});
  doc.setFont('Helvetica','normal'); doc.setFontSize(8.5); tc('#8899AA');
  tx('30 minutes. No obligation. Just clarity.',bx+bw/2,y-bh2-12,{align:'center'});
  y-=bh2+36;

  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(13); tc(GOLD);
  doc.splitTextToSize('The gap is targeted. The upside is real. The journey starts here.',cw).forEach(l=>{tx(l,ml,y);y-=18;});
  y-=8; doc.setFont('Helvetica','normal'); doc.setFontSize(10); tc('#335566');
  doc.splitTextToSize('The destination is closer than it appears.',cw).forEach(l=>{tx(l,ml,y);y-=14;});
  y-=24;

  if (logoBase64) {
    try { doc.addImage(`data:image/jpeg;base64,${logoBase64}`,'JPEG',ml,y-30,80,22); y-=38; } catch(e) { y-=10; }
  }
  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(14); tc(GOLD); tx('Meta Results',ml,y); y-=16;
  doc.setFont('Helvetica','normal'); doc.setFontSize(9); tc('#335566');
  tx('www.metaresults.com  |  Executive Communication  |  Leadership Development  |  GCC Specialists',ml,y);

  // Score summary footer
  const ty=56; fk('#0B1824'); doc.roundRect(ml,ty,cw,80,6,'F');
  doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(8); tc(GOLD); tx('SCORE SUMMARY',ml+12,ty+66);
  [['Thinking',thinking,BLUE],['Fluency',fluency,ORANGE],['Confidence',confidence,GREEN],['Presence',presence,PURPLE],['COMPOSITE',composite,RED]].forEach(([lbl,val,col],i)=>{
    const rx=ml+12+i*(cw/5);
    doc.setFont('Helvetica','normal'); doc.setFontSize(7.5); tc('#8899AA'); tx(lbl,rx,ty+48);
    doc.setFont('Helvetica-Bold','bold'); doc.setFontSize(11); tc(col);
    tx(val+(lbl==='COMPOSITE'?'/100':'/25'),rx,ty+33);
  });

  return doc.output('arraybuffer');
}
