/* 탭 전환 · 화면 그리기 · 클릭/입력 처리 */
/* ══════════ 렌더 루프 · 이벤트 ══════════ */
const VIEWS = { today: renderToday, cal: renderCal, subj: renderSubj, check: renderCheck, more: renderMore, setup: renderSetup };
function render() {
  if (!S) return;
  if (!VIEWS[S.tab]) S.tab = 'today';
  document.title = CONFIG.title;
  document.getElementById('title').textContent = CONFIG.icon + ' ' + CONFIG.title;
  const gw = document.querySelector('.gridwrap'), keep = gw ? gw.scrollLeft : null;
  document.getElementById('view').innerHTML = VIEWS[S.tab]();
  const ngw = document.querySelector('.gridwrap');
  if (ngw) { const t = ngw.querySelector('.today'); ngw.scrollLeft = keep != null ? keep : t ? t.offsetLeft - ngw.offsetLeft - 16 : 0; }
  const ef = document.querySelector('[data-editfocus]'); if (ef) { ef.focus(); ef.setSelectionRange(ef.value.length, ef.value.length); }
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === (S.tab === 'setup' ? 'more' : S.tab)));
  const n = new Date(), p = progress();
  document.getElementById('now').textContent = `${n.getMonth() + 1}/${n.getDate()}(${DOW[n.getDay()]}) ${lastMark() ? ` · ${lastMark()[1]}까지 ${dday(lastMark()[0])}` : ''}`;
  document.getElementById('allpct').textContent = `${p.pct}% (${fmtH(p.dn)} / ${fmtH(p.tot)})`;
  document.getElementById('allbar').style.width = p.pct + '%';
}
const findItem = v => { const [l, i] = v.split('|'), list = S.lists.find(x => x.id === l); return { list, i }; };

document.addEventListener('click', e => {
  const t = e.target.closest('button, [data-day], [data-subj]'); if (!t) return;
  const d = t.dataset;
  if (d.tab) { S.tab = d.tab; editing = null; window.scrollTo(0, 0); }
  else if (d.day) { viewDay = d.day; if (d.go) { S.tab = d.go; window.scrollTo(0, 0); } }
  else if (d.week) viewWeek = d.week;
  else if (d.mode) S.calMode = d.mode;
  else if (d.subj) { viewSubj = d.subj; study = null; window.scrollTo(0, 0); }
  else if (d.move) { const [id, day] = d.move.split('|'); S.moved[id] = day; if (S.mt) delete S.mt[id]; }
  else if (d.movec) { // 직접 추가한 일을 다른 날로
    const [id, day] = d.movec.split('|');
    for (const k in S.custom) { const c = S.custom[k].find(x => x.id === id); if (c) { S.custom[k] = S.custom[k].filter(x => x !== c); delete c.s; delete c.e; (S.custom[day] = S.custom[day] || []).push(c); break; } }
  }
  else if (d.edit) editing = d.edit;
  else if (d.canceledit) editing = null;
  else if (d.moveall) overdue().forEach(t => { S.moved[t.id] = todayKey(); });
  else if (d.dropopt) overdue().filter(t => t.opt).forEach(t => { S.hidden[t.id] = 1; });
  else if (d.timer) {
    const [mode, id] = d.timer.split('|');
    if (mode === 'stop') { const t = S.timer; if (t && t.mode === 'focus') addSpent(t.id, Math.round((t.len * 60 - timerLeft()) / 60)); S.timer = null; lastDone = null; document.title = CONFIG.title; }
    else { const len = mode === 'focus' ? 25 : 5; S.timer = { mode, id: id || null, len, end: Date.now() + len * 60000 }; lastDone = null; }
  }
  else if (d.copy) {
    const [id, i] = d.copy.split('|'), text = promptsOf(id)[+i][1];
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => { t.textContent = '복사됨 ✓'; setTimeout(() => { t.textContent = '복사'; }, 1500); },
      () => { t.parentNode.querySelector('details').open = true; alert('자동 복사가 안 돼요. 펼쳐진 내용을 직접 복사하세요.'); });
    return;
  }
  else if (d.card) {
    const [act, arg] = d.card.split('|'), cs = S.cards[viewSubj] || [];
    if (act === 'start') { const ids = cs.filter(c => arg === 'all' || c.ok === false).map(c => c.id).sort(() => Math.random() - 0.5); study = { subj: viewSubj, ids, i: 0, show: false }; }
    else if (act === 'flip') study.show = !study.show;
    else if (act === 'exit') study = null;
    else { const c = cs.find(x => x.id === study.ids[study.i]); if (c) c.ok = act === 'ok'; study.i++; study.show = false; }
  }
  else if (d.delcard) { const [id, cid] = d.delcard.split('|'); S.cards[id] = (S.cards[id] || []).filter(c => c.id !== cid); }
  else if (d.hide) { if (!confirm('이 계획을 삭제할까요?')) return; S.hidden[d.hide] = 1; }
  else if (d.delc) { for (const k in S.custom) S.custom[k] = S.custom[k].filter(c => c.id !== d.delc); delete S.done[d.delc]; }
  else if (d.delitem) { const { list, i } = findItem(d.delitem); list.items = list.items.filter(x => x.id !== i); }
  else if (d.dellist) { if (!confirm('이 카테고리를 통째로 삭제할까요?')) return; S.lists = S.lists.filter(l => l.id !== d.dellist); }
  else if (d.act === 'filesave') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' }));
    a.download = '플래너-백업-' + todayKey() + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return;
  }
  else if (d.act === 'fileload') { document.getElementById('bkfile').click(); return; }
  else if (d.act === 'logout') { if (confirm('로그아웃할까요? 내용은 계정에 저장돼 있어요.')) logout(); return; }
  else if (d.act === 'reset') { if (!confirm('체크·메모·체크리스트를 모두 처음 상태로 되돌릴까요?')) return; S = seed(); S.tab = 'more'; }
  else return;
  save(); render();
});
document.addEventListener('change', e => {
  if (e.target.id === 'bkfile') {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { if (importData(r.result, '파일의')) { save(); render(); } };
    r.readAsText(f); e.target.value = '';
    return;
  }
  const d = e.target.dataset;
  if (d.done) { if (e.target.checked) S.done[d.done] = 1; else delete S.done[d.done]; }
  else if (d.item) { const { list, i } = findItem(d.item); list.items.find(x => x.id === i).done = e.target.checked; }
  else if (d.cert) S.certs[d.cert] = e.target.value;
  else if (d.info) { const [id, k] = d.info.split('|'); (S.info[id] = S.info[id] || {})[k] = e.target.value.trim(); }
  else return;
  save(); render();
});
document.addEventListener('input', e => {
  if (e.target.dataset.note) { S.notes[e.target.dataset.note] = e.target.value; save(); }
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, d = f.dataset, v = n => f.elements[n].value.trim();
  if (d.addtask) (S.custom[d.addtask] = S.custom[d.addtask] || []).push({ id: 'c' + uid(), subj: v('subj'), t: v('t') });
  else if (d.additem) S.lists.find(l => l.id === d.additem).items.push({ id: uid(), t: v('t'), done: false });
  else if (d.edittask) {
    const id = d.edittask, st = v('s'), en = v('e'), ok = st && en && st < en; // 시간은 둘 다 있고 순서가 맞을 때만 반영
    let c; for (const k in S.custom) c = c || S.custom[k].find(x => x.id === id);
    if (c) { c.t = v('t'); c.subj = v('subj'); if (ok) { c.s = st; c.e = en; } else { delete c.s; delete c.e; } }
    else { // 계획 블록은 내 일정(S.plan)의 원본을 직접 고침: [시작, 끝, 과목, 할 일, 여유]
      const [day, idx] = id.split('#'), p = PLAN[day] && PLAN[day][+idx];
      if (p) {
        p[2] = v('subj'); p[3] = v('t'); p[4] = f.elements.opt.checked ? 1 : 0;
        if (S.moved[id] && S.moved[id] !== day) { S.mt = S.mt || {}; if (ok) S.mt[id] = { s: st, e: en }; else delete S.mt[id]; }
        else if (ok) { p[0] = st; p[1] = en; }
      }
    }
    editing = null;
  }
  else if (d.edititem) { const { list, i } = findItem(d.edititem); list.items.find(x => x.id === i).t = v('t'); editing = null; }
  else if (d.editlist) { S.lists.find(l => l.id === d.editlist).name = v('t'); editing = null; }
  else if ('addlist' in d) S.lists.push({ id: uid(), name: v('name'), color: v('color'), items: [] });
  else if (d.addcard) (S.cards[d.addcard] = S.cards[d.addcard] || []).push({ id: uid(), q: v('q'), a: v('a') });
  else if (d.bulkcard) {
    // 한 줄에 한 장: 탭, |, " - ", ": " 중 처음 나오는 구분자로 앞면/뒷면을 나눔
    const list = S.cards[d.bulkcard] = S.cards[d.bulkcard] || [];
    const bad = v('bulk').split('\n').map(l => l.trim()).filter(Boolean).filter(l => {
      const m = l.match(/^(.+?)(?:\t+|\s*\|\s*|\s+[-–—=]\s+|\s*:\s+)(.+)$/);
      if (m) list.push({ id: uid(), q: m[1].trim(), a: m[2].trim() });
      return !m;
    });
    if (bad.length) alert('구분자(" - ")를 못 찾아서 건너뛴 줄 ' + bad.length + '개:\n' + bad.slice(0, 5).join('\n'));
  }
  save(); render();
});
function startApp() { render(); }
cloudInit();
