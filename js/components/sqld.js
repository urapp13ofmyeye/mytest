/* SQLD 탭: 포도(단원=송이, 소단원=알) · 포도알 패널 · 오답 모아보기 · 노트 가져오기 · 숨김(제목 5번 탭) */
/* ══════════ 상태 도우미 ══════════ */
let sqOpen = null, sqView = 'grape', sqUnit = 'all', sqOnlyOpen = false, sqEnter = false, sqShown = null, sqTaps = [];
// S.sqld가 없거나 일부만 있는 예전 데이터도 안전하게
function SQ() {
  const s = S.sqld || (S.sqld = sqldSeed()), d = sqldSeed();
  for (const k in d) if (s[k] == null) s[k] = d[k];
  return s;
}
const sqList = (tid, k) => (SQ().items[tid] || {})[k] || [];
const sqListW = (tid, k) => { const it = SQ().items[tid] = SQ().items[tid] || {}; return it[k] = it[k] || []; };
const sqReads = tid => SQ().reads[tid] || 0;
const sqConf = tid => sqList(tid, 'confuse').filter(x => !x.done).length;
const sqWrong = tid => SQ().wrong.filter(w => w.topic === tid);
const sqWrongOpen = tid => sqWrong(tid).filter(w => !w.solved).length;
// 아무것도 안 적은 소단원(항목·오답 없음)
const sqEmpty = tid => !SQLD_SECTS.some(([k]) => sqList(tid, k).length) && !sqWrong(tid).length;
// 알 색: 회독 수. 회독 0회인데 적은 것도 없으면 빈 알(점선)
const sqLv = tid => sqReads(tid) ? 'gr' + Math.min(sqReads(tid), 3) : sqEmpty(tid) ? 'gr0 empty' : 'gr0';
const sqIds = u => u.topics.map((_, i) => u.id + '.' + (i + 1));
const sqName = tid => { const t = SQLD_TOPICS[tid]; return t ? t.unit + ' · ' + t.name : '삭제된 소단원'; };
// **굵게**, `코드`만 표시 (나머지는 그대로 글자)
const sqFmt = s => esc(s).replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

/* ══════════ 렌더: SQLD ══════════ */
function renderSqld() {
  const open = SQ().wrong.filter(w => !w.solved).length;
  const html = `<div class="stabs" style="--c:var(--g2)"><button data-sqview="grape" class="${sqView === 'grape' ? 'on' : ''}">🍇 SQLD</button><button data-sqview="wrong" class="${sqView === 'wrong' ? 'on' : ''}">📝 오답 모아보기${open ? ` (${open})` : ''}</button></div>`
    + (sqView === 'wrong' ? sqWrongView() : sqGrapeView()) + (sqOpen ? sqPanel() : '');
  sqEnter = false;
  return html;
}
function sqGrapeView() {
  const all = Object.keys(SQLD_TOPICS), read = all.filter(sqReads).length;
  return `<div class="sqtop"><span>회독한 포도알 <b>${read}</b> / ${all.length}</span>
      <span class="sqkey" aria-label="색 안내"><span><i class="grape mini gr0 empty"></i>빈 칸</span><span><i class="grape mini gr0"></i>0회</span><span><i class="grape mini gr1"></i>1회</span><span><i class="grape mini gr2"></i>2회</span><span><i class="grape mini gr3"></i>3회+</span>
      <span><i class="gdot"></i>헷갈림 남음</span><span><i class="gbadge">2</i>미해결 오답</span></span></div>
    <div class="sqgrid">${SQLD_UNITS.map(sqBunch).join('')}</div>
    <div class="sect">📝 md로 한꺼번에 편집</div>
    <details class="card sqimport"><summary>md 붙여넣기 · 지금 내용 복사</summary>
      <div class="tip" style="margin-top:6px">① <b>지금 내용 복사</b> → 메모장·노션에서 고치기 → ② 아래에 붙여넣고 <b>적용</b>. 내 계정에만 저장돼요.</div>
      <div class="addrow"><button class="btn" data-sqcopy="all">📋 지금 내용 md로 복사</button></div>
      <form data-sqimport>
        <textarea class="field" name="md" aria-label="md 붙여넣기" placeholder="## [2-2] 윈도우 함수&#10;### 출제 스타일&#10;- [ ] 순위 함수 결과 (동점 + PARTITION)&#10;### 핵심 개념&#10;- [x] OVER가 붙으면 윈도우 함수&#10;  - 하위 줄은 두 칸 들여쓰기&#10;### 헷갈린 포인트&#10;- [ ] ROWS vs RANGE   ← [x]면 해결" required></textarea>
        <div class="sqmode" role="radiogroup" aria-label="붙여넣는 방식">
          <label class="optck"><input type="radio" name="mode" value="replace" checked><span><b>바꾸기</b> — 붙여넣은 칸은 통째로 이 내용으로</span></label>
          <label class="optck"><input type="radio" name="mode" value="add"><span><b>추가만</b> — 없는 문장만 덧붙이기</span></label>
        </div>
        <details class="sqfmt"><summary>형식 안내</summary><div class="tip">
          제목: <code>## [단원] 소단원</code> (예: <code>## [2-2] 윈도우 함수</code>) · 칸: <code>### 출제 스타일</code> <code>### 핵심 개념</code> <code>### 헷갈린 포인트</code><br>
          항목: <code>- [x] 내용</code> = 체크됨(이해함·풀어봄·해결), <code>- [ ] 내용</code> = 안 됨, <code>- 내용</code> = 바꾸기에선 원래 체크 유지<br>
          학습노트의 <code>### 반드시 암기</code> · <code>### 이해가 느렸던 부분</code> · <code>### 출제 우선순위</code>/<code>문제 푸는 스킬</code>도 그대로 읽어요.<br>
          바꾸기는 붙여넣은 소단원의 <b>그 칸만</b> 바뀌어요. 칸 제목만 두고 항목을 지우면 그 칸이 비워져요. 오답 메모·회독 수는 그대로예요.</div></details>
        <div class="addrow"><button class="btn pri" style="margin-left:auto">적용</button></div>
      </form></details>
    <div class="sqhide"><button class="linkbtn" data-sqhide="1">SQLD 탭 숨기기</button></div>`;
}
// 송이 하나: 위가 넓은 역삼각형으로 알을 쌓음 (예: 8개 → 4·3·1)
function sqBunch(u) {
  const ids = sqIds(u), rows = [];
  let k = 1; while (k * (k + 1) / 2 < ids.length) k++;
  for (let i = 0, w = k; i < ids.length; i += w, w--) rows.push(ids.slice(i, i + w));
  return `<div class="card squnit">
    <h3><span class="sqid">${u.id}</span>${esc(u.name)}<small>회독 ${ids.filter(sqReads).length}/${ids.length}</small></h3>
    <div class="bunch"><span class="stem" aria-hidden="true"></span>${rows.map(r => `<div class="grow">${r.map(sqGrape).join('')}</div>`).join('')}</div>
    <div class="sqleg">${ids.map(id => `<button data-sqopen="${id}"><em class="${sqLv(id)}">${SQLD_TOPICS[id].n}</em><span>${esc(SQLD_TOPICS[id].name)}</span></button>`).join('')}</div>
  </div>`;
}
function sqGrape(tid) {
  const t = SQLD_TOPICS[tid], c = sqConf(tid), w = sqWrongOpen(tid);
  const desc = `${t.name} · ${sqEmpty(tid) ? '아직 작성 안 함' : `회독 ${sqReads(tid)}회`}${c ? ` · 아직 헷갈림 ${c}개` : ''}${w ? ` · 미해결 오답 ${w}개` : ''}`;
  return `<button class="grape ${sqLv(tid)}${sqOpen === tid ? ' on' : ''}" data-sqopen="${tid}" aria-label="${esc(desc)}" title="${esc(desc)}">${t.n}${c ? '<i class="gdot"></i>' : ''}${w ? `<i class="gbadge">${w}</i>` : ''}</button>`;
}

/* ── 포도알 패널 (넓은 화면: 오른쪽, 폰: 아래 시트) ── */
function sqPanel() {
  const t = SQLD_TOPICS[sqOpen]; if (!t) { sqOpen = null; return ''; }
  const u = SQLD_UNITS.find(x => x.id === t.unit), r = sqReads(t.id);
  return `<button class="sqback" data-sqclose="1" tabindex="-1" aria-label="패널 닫기"></button>
  <aside class="sqpanel${sqEnter ? ' enter' : ''}" role="dialog" aria-modal="true" aria-labelledby="sqptitle">
    <div class="sqphead"><i class="grape mini ${sqLv(t.id)}" aria-hidden="true"></i><div><small>${u.id} ${esc(u.name)} · ${t.n}번</small><h2 id="sqptitle">${esc(t.name)}</h2></div>
      <div class="sqnav">${sqNavBtn(t.id, -1)}${sqNavBtn(t.id, 1)}</div>
      <button class="x sqclose" data-sqclose="1" aria-label="패널 닫기">✕</button></div>
    <div class="sqbody">
      ${SQLD_SECTS.map(s => sqSection(t.id, s)).join('')}
      ${sqWrongSection(t.id)}
      <div class="sqhide"><button class="linkbtn" data-sqcopy="${t.id}">📋 이 소단원 md로 복사</button></div>
    </div>
    <div class="sqfoot"><span>회독 <b>${r}</b>회</span>
      <button class="btn" data-sqread="${t.id}|-1"${r ? '' : ' disabled'} aria-label="회독 1 빼기" title="잘못 눌렀을 때">−1</button>
      <button class="btn pri" data-sqread="${t.id}|1">회독 완료 +1</button></div>
  </aside>`;
}
// 이전/다음 소단원 (단원 경계를 넘어 1-1.1 → 2-3.4 순서). 끝이면 비활성
const sqStep = (tid, dir) => { const ids = Object.keys(SQLD_TOPICS); return ids[ids.indexOf(tid) + dir] || null; };
function sqNavBtn(tid, dir) {
  const to = sqStep(tid, dir), lbl = dir < 0 ? '이전' : '다음';
  return to ? `<button class="btn" data-sqopen="${to}" title="${lbl}: ${esc(sqName(to))} (${dir < 0 ? '←' : '→'})" aria-label="${lbl} 소단원: ${esc(sqName(to))}">${dir < 0 ? '‹' : '›'}</button>`
    : `<button class="btn" disabled aria-label="${lbl} 소단원 없음">${dir < 0 ? '‹' : '›'}</button>`;
}
function sqSection(tid, [k, title, ck, empty]) {
  const list = sqList(tid, k), dn = list.filter(x => x.done).length;
  const cnt = !list.length ? '' : ck ? `${ck} ${dn}/${list.length}` : (list.length - dn ? `아직 헷갈림 ${list.length - dn}` : '모두 해결');
  const head = `${title}${cnt ? `<small>${cnt}</small>` : ''}`;
  // 출제 스타일은 콜아웃 상자 안에 제목까지, 나머지는 제목 + 카드
  return (k === 'style' ? `<div class="sqsect sqcall"><div class="sqcallh"><span aria-hidden="true">🎯</span>${head}</div>` : `<div class="sect">${head}</div><div class="sqsect">`) + `
      ${list.map(x => editing === `sq:${tid}|${k}|${x.id}`
        ? `<form class="sqedit" data-sqsave="${tid}|${k}|${x.id}"><textarea class="field" name="t" rows="3" aria-label="${title} 수정" data-editfocus required>${esc(x.t)}</textarea>
            <div class="addrow"><button class="btn pri">저장</button><button type="button" class="btn" data-canceledit="1">취소</button></div></form>`
        : `<div class="sqitem${x.done ? ' done' : ''}"><div class="sqt">${sqFmt(x.t)}</div><div class="sqact">
            ${ck ? `<label class="sqchip${x.done ? ' on' : ''}"><input type="checkbox" data-sqck="${tid}|${k}|${x.id}"${x.done ? ' checked' : ''}>${x.done ? '✓' : '☐'} ${ck}</label>`
              : `<button class="sqchip ${x.done ? 'on' : 'bad'}" data-sqtog="${tid}|${x.id}" aria-pressed="${!!x.done}" title="눌러서 바꾸기">${x.done ? '✓ 해결' : '● 아직 헷갈림'}</button>`}
            <button class="x" data-sqedit="${tid}|${k}|${x.id}" title="수정" aria-label="수정">✎</button><button class="x" data-sqdel="${tid}|${k}|${x.id}" aria-label="삭제">×</button></div></div>`).join('')
        || `<div class="tip sqempty">${empty}</div>`}
      <form class="addrow" data-sqadd="${tid}|${k}"><input name="t" placeholder="${title} 추가" aria-label="${title} 추가" required><button class="btn" aria-label="${title} 추가">＋</button></form>
    </div>`;
}
function sqWrongSection(tid) {
  const ws = sqWrong(tid), op = ws.filter(w => !w.solved).length;
  return `<div class="sect">오답 메모${ws.length ? `<small>미해결 ${op}/${ws.length}</small>` : ''}</div>
    <div class="sqsect">${ws.map(w => sqWrongCard(w, false)).join('')}
      <details class="sqwadd"${ws.length ? '' : ' open'}><summary>＋ 오답 추가</summary>${sqWrongForm(tid)}</details></div>`;
}
function sqWrongForm(tid, w) {
  const f = w || {}, val = k => esc(f[k] || '');
  return `<form class="sqwform" data-sqwrong="${tid}"${w ? ` data-sqwid="${w.id}"` : ''}>
    <textarea class="field" name="q" rows="2" placeholder="문제 요약 (예: RANGE 누적합 결과 고르기)" aria-label="문제 요약" required${w ? ' data-editfocus' : ''}>${val('q')}</textarea>
    <div class="sqwrow"><input class="field" name="mine" value="${val('mine')}" placeholder="내 답 (예: ②)" aria-label="내 답"><input class="field" name="ans" value="${val('ans')}" placeholder="정답 (예: ④)" aria-label="정답"></div>
    <textarea class="field" name="why" rows="2" placeholder="왜 틀렸는지" aria-label="왜 틀렸는지">${val('why')}</textarea>
    <div class="sqwrow"><input class="field" name="src" value="${val('src')}" placeholder="출처 (예: 46회 15번)" aria-label="출처">
      ${w ? '<button type="button" class="btn" data-canceledit="1">취소</button><button class="btn pri">저장</button>' : '<button class="btn pri">추가</button>'}</div>
  </form>`;
}
function sqWrongCard(w, showTopic) {
  if (editing === 'sqw:' + w.id) return sqWrongForm(w.topic, w);
  return `<div class="sqw${w.solved ? ' done' : ''}">
    <label class="sqwck"><input type="checkbox" data-sqsolved="${w.id}"${w.solved ? ' checked' : ''}>해결</label>
    <div class="sqwbody">
      ${showTopic ? `<button class="sqtopic" data-sqopen="${w.topic}">${esc(sqName(w.topic))} ›</button>` : ''}
      <b>${sqFmt(w.q)}</b>
      ${w.mine || w.ans ? `<div class="sqans">${w.mine ? `<span>내 답 <s>${esc(w.mine)}</s></span>` : ''}${w.ans ? `<span>정답 <em>${esc(w.ans)}</em></span>` : ''}</div>` : ''}
      ${w.why ? `<div class="sqwhy">${sqFmt(w.why)}</div>` : ''}
      ${w.src ? `<small>📍 ${esc(w.src)}</small>` : ''}
    </div>
    <div class="sqact"><button class="x" data-sqwedit="${w.id}" title="수정" aria-label="오답 수정">✎</button><button class="x" data-sqwdel="${w.id}" aria-label="오답 삭제">×</button></div>
  </div>`;
}

/* ── 오답 모아보기 ── */
function sqWrongView() {
  const s = SQ(), unitOf = w => (SQLD_TOPICS[w.topic] || {}).unit;
  if (sqUnit !== 'all' && !SQLD_UNITS.some(u => u.id === sqUnit)) sqUnit = 'all';
  const cnt = u => s.wrong.filter(w => !w.solved && (u === 'all' || unitOf(w) === u)).length;
  const ws = s.wrong.slice().reverse().filter(w => (sqUnit === 'all' || unitOf(w) === sqUnit) && (!sqOnlyOpen || !w.solved));
  return `<div class="sqfilter"><div class="wtabs">${['all', ...SQLD_UNITS.map(u => u.id)].map(u =>
      `<button data-squnit="${u}" class="${sqUnit === u ? 'on' : ''}">${u === 'all' ? '전체' : u}${cnt(u) ? ` · ${cnt(u)}` : ''}</button>`).join('')}</div>
    <label class="optck"><input type="checkbox" data-sqonly="1"${sqOnlyOpen ? ' checked' : ''}>미해결만 보기</label></div>
    ${ws.length ? `<div class="card sqwlist">${ws.map(w => sqWrongCard(w, true)).join('')}</div>`
      : `<div class="card tip">${s.wrong.length ? '조건에 맞는 오답이 없어요.' : '아직 오답이 없어요. 포도알을 눌러 오답 메모를 남겨보세요.'}</div>`}
    <div class="tip" style="margin-top:8px;color:var(--mute)">숫자는 미해결 오답 수예요. 소단원 이름을 누르면 그 포도알이 열려요.</div>`;
}

/* ══════════ 이벤트 (app.js의 위임에서 호출) ══════════ */
const sqFind = (tid, k, id) => sqList(tid, k).find(x => x.id === id);
// 처리했으면 true. 아무것도 안 바뀌었으면(취소 등) 'skip'
function sqClick(d) {
  if (d.sqopen) { sqEnter = !sqOpen; sqOpen = d.sqopen; editing = null; }
  else if (d.sqclose) { sqOpen = null; editing = null; }
  else if (d.sqview) { sqView = d.sqview; editing = null; window.scrollTo(0, 0); }
  else if (d.squnit) sqUnit = d.squnit;
  else if (d.sqtog) { const [tid, id] = d.sqtog.split('|'), x = sqFind(tid, 'confuse', id); if (x) x.done = !x.done; }
  else if (d.sqedit) editing = 'sq:' + d.sqedit;
  else if (d.sqdel) { const [tid, k, id] = d.sqdel.split('|'); SQ().items[tid][k] = sqList(tid, k).filter(x => x.id !== id); }
  else if (d.sqwedit) editing = 'sqw:' + d.sqwedit;
  else if (d.sqwdel) { if (!confirm('이 오답 메모를 지울까요?')) return 'skip'; SQ().wrong = SQ().wrong.filter(w => w.id !== d.sqwdel); }
  else if (d.sqread) { const [tid, n] = d.sqread.split('|'); SQ().reads[tid] = Math.max(0, sqReads(tid) + +n); if (+n > 0) toast(`🍇 ${SQLD_TOPICS[tid].name} ${sqReads(tid)}회독 완료`); }
  else if (d.sqcopy) { // 복사만 하고 화면은 그대로
    const ids = d.sqcopy === 'all' ? Object.keys(SQLD_TOPICS).filter(t => SQLD_SECTS.some(([k]) => sqList(t, k).length)) : [d.sqcopy];
    if (ids.length) sqCopy(sqMd(ids)); else toast('아직 적은 내용이 없어요');
    return 'skip';
  }
  else if (d.sqhide) { if (!confirm('SQLD 탭을 숨길까요?\n내용은 그대로 남아 있고, 화면 맨 위 제목을 5번 연속 누르면 다시 보여요.')) return 'skip'; sqSetOn(false); }
  else return false;
  return true;
}
function sqChange(d, el) {
  if (d.sqck) { const [tid, k, id] = d.sqck.split('|'), x = sqFind(tid, k, id); if (x) x.done = el.checked; }
  else if (d.sqsolved) { const w = SQ().wrong.find(x => x.id === d.sqsolved); if (w) w.solved = el.checked; }
  else if (d.sqonly) sqOnlyOpen = el.checked;
  else return false;
  return true;
}
// false면 저장·다시 그리기를 하지 않음 (입력 내용 유지)
function sqSubmit(f, d) {
  const v = n => f.elements[n].value.trim();
  if (d.sqadd) { const [tid, k] = d.sqadd.split('|'); if (v('t')) sqListW(tid, k).push({ id: uid(), t: v('t'), done: false }); }
  else if (d.sqsave) { const [tid, k, id] = d.sqsave.split('|'), x = sqFind(tid, k, id); if (x && v('t')) x.t = v('t'); editing = null; }
  else if (d.sqwrong) {
    const vals = { q: v('q'), mine: v('mine'), ans: v('ans'), why: v('why'), src: v('src') };
    const w = d.sqwid && SQ().wrong.find(x => x.id === d.sqwid);
    if (w) Object.assign(w, vals); else SQ().wrong.push(Object.assign({ id: uid(), topic: d.sqwrong, solved: false }, vals));
    editing = null;
  }
  else if ('sqimport' in d) return sqImport(f.elements.md.value, f.elements.mode.value);
  return true;
}
function sqSetOn(on) {
  SQ().on = on; sqOpen = null; editing = null;
  if (on) { S.tab = 'sqld'; window.scrollTo(0, 0); } else if (S.tab === 'sqld') S.tab = 'today';
}
// 이스터에그: 제목을 2초 안에 5번 누르면 SQLD 탭 켜기/끄기
function sqTitleTap() {
  if (!S) return;
  const now = Date.now(); sqTaps = sqTaps.filter(t => now - t < 2000); sqTaps.push(now);
  if (sqTaps.length < 5) return;
  sqTaps = []; sqSetOn(!SQ().on); save(); render();
  toast(SQ().on ? '🍇 SQLD 탭이 켜졌어요' : 'SQLD 탭을 숨겼어요 · 제목을 5번 누르면 다시 보여요');
}
document.addEventListener('keydown', e => {
  if (!S || S.tab !== 'sqld' || !sqOpen) return;
  if (e.key === 'Escape') { if (editing) editing = null; else sqOpen = null; render(); return; }
  // ← → 로 이전/다음 소단원 (입력 중일 땐 무시)
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !(e.target.closest && e.target.closest('input, textarea, select')) && !e.altKey && !e.ctrlKey && !e.metaKey) {
    const to = sqStep(sqOpen, e.key === 'ArrowLeft' ? -1 : 1);
    if (to) { sqOpen = to; editing = null; render(); }
  }
});
// 다시 그릴 때 패널 스크롤 유지 · 뒤 화면 스크롤 잠금 · 열릴 때 닫기 버튼에 포커스 (app.js render에서 호출)
function sqBefore() { const b = document.querySelector('.sqbody'); return b ? [sqShown, b.scrollTop] : null; }
function sqAfter(p) {
  const b = document.querySelector('.sqbody'), opened = document.querySelector('.sqpanel.enter');
  document.body.classList.toggle('sqlock', !!b);
  if (b && p && p[0] === sqOpen) b.scrollTop = p[1];
  if (opened) opened.querySelector('.sqclose').focus();
  sqShown = b ? sqOpen : null;
}

/* ══════════ 학습노트 가져오기 ══════════ */
const sqNorm = s => s.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[\s·•&/,.:\-_+]+/g, '');
// "## [2-2] 그룹 함수 (ROLLUP…)" → '2-2.3'. 못 찾으면 null
function sqMatch(h) {
  const m = h.trim().match(/^\[(\d-\d)\]\s*(.*)$/), unit = m ? m[1] : null, name = sqNorm(m ? m[2] : h);
  if (!name) return null;
  const inUnit = id => !unit || SQLD_TOPICS[id].unit === unit;
  for (const a in SQLD_ALIAS) if (name.includes(a) && inUnit(SQLD_ALIAS[a])) return SQLD_ALIAS[a];
  const cand = Object.values(SQLD_TOPICS).filter(t => inUnit(t.id)).map(t => [t.id, sqNorm(t.name)]);
  const exact = cand.find(c => c[1] === name);
  if (exact) return exact[0];
  const part = cand.filter(c => name.includes(c[1]) || c[1].includes(name)).sort((a, b) => b[1].length - a[1].length)[0];
  return part ? part[0] : null;
}
// md → Map('소단원|칸' → [{ id, t, done }]). done: [x]=true, [ ]=false, 체크 표시 없음=null
function sqParse(md) {
  const secs = new Map(), miss = [];
  let tid = null, sect = null, cur = null;
  for (const raw of md.replace(/\r/g, '').split('\n')) {
    let m;
    if ((m = raw.match(/^##\s+(.+)$/))) { tid = sqMatch(m[1]); sect = cur = null; if (!tid && /^\s*\[/.test(m[1])) miss.push(m[1].trim()); continue; }
    if ((m = raw.match(/^###\s+(.+)$/))) {
      const f = SQLD_NOTE_SECTS.find(x => x[0].test(m[1])); sect = f ? f[1] : null; cur = null;
      if (tid && sect && !secs.has(tid + '|' + sect)) secs.set(tid + '|' + sect, []);
      continue;
    }
    if (/^(#\s|---)/.test(raw)) { if (raw[0] === '#') tid = null; sect = cur = null; continue; }
    if (!tid || !sect || !(m = raw.match(/^(\s*)(?:[-*+]|\d+[.)])\s+(.+)$/))) continue;
    const ck = m[2].match(/^\[([ xX])\]\s*(.*)$/), text = (ck ? ck[2] : m[2]).replace(/\\([*_`])/g, '$1').trim();
    if (!text) continue;
    if (m[1].length >= 2 && cur) cur.t += '\n· ' + text; // 들여쓴 하위 항목은 윗 항목에 이어 붙임
    else { cur = { id: uid(), t: text, done: ck ? ck[1] !== ' ' : null }; secs.get(tid + '|' + sect).push(cur); }
  }
  return { secs, miss };
}
// mode 'replace': 붙여넣은 칸을 통째로 교체 / 'add': 없는 문장만 추가. 실패·취소면 false (입력 내용 유지)
function sqImport(md, mode) {
  const { secs, miss } = sqParse(md), key = s => s.replace(/\*\*|\s+/g, '');
  const n = [...secs.values()].reduce((a, l) => a + l.length, 0);
  const missTxt = miss.length ? '\n\n소단원을 못 찾아 건너뛴 제목:\n' + miss.join('\n') : '';
  if (!secs.size || (mode !== 'replace' && !n)) {
    alert('적용할 내용을 찾지 못했어요.\n"## [2-2] 윈도우 함수" 같은 제목과 "### 핵심 개념" 같은 칸 제목 아래에 "- " 목록이 있는지 확인해주세요.' + missTxt);
    return false;
  }
  if (mode === 'replace') {
    const names = [...new Set([...secs.keys()].map(k => SQLD_TOPICS[k.split('|')[0]].name))];
    if (!confirm(`${names.length}개 소단원의 ${secs.size}개 칸을 붙여넣은 내용으로 바꿀까요?\n(${names.slice(0, 5).join(', ')}${names.length > 5 ? ' 외' : ''})\n\n체크 표시([x]/[ ])가 없는 줄은 원래 체크 상태를 유지해요.\n오답 메모·회독 수는 그대로예요.`)) return false;
    for (const [sk, list] of secs) {
      const [t, k] = sk.split('|'), old = sqList(t, k);
      (SQ().items[t] = SQ().items[t] || {})[k] = list.map(x => {
        const o = old.find(y => key(y.t) === key(x.t));
        return { id: o ? o.id : x.id, t: x.t, done: x.done !== null ? x.done : !!(o && o.done) };
      });
    }
    alert(`${secs.size}개 칸을 바꿨어요. (항목 ${n}개)` + missTxt);
    return true;
  }
  const topics = new Set();
  let added = 0, dup = 0;
  for (const [sk, list] of secs) for (const x of list) {
    const [t, k] = sk.split('|'), cur = sqListW(t, k);
    if (cur.some(y => key(y.t) === key(x.t))) dup++; else { cur.push(Object.assign(x, { done: !!x.done })); added++; topics.add(t); }
  }
  alert((added ? `${topics.size}개 소단원에 ${added}개 항목을 넣었어요.` + (dup ? `\n이미 있던 ${dup}개는 건너뛰었어요.` : '') : `새로 넣을 항목이 없어요. (${dup}개 모두 이미 있어요)`) + missTxt);
  return true;
}
// 지금 내용 → md (가져오기와 같은 형식이라 고쳐서 그대로 다시 붙여넣을 수 있음)
function sqMd(tids) {
  return tids.map(t => {
    const tp = SQLD_TOPICS[t];
    return `## [${tp.unit}] ${tp.name}\n\n` + SQLD_SECTS.map(([k, title]) => [`### ${title}`, ...sqList(t, k).map(x => {
      const [a, ...rest] = x.t.split('\n');
      return `- [${x.done ? 'x' : ' '}] ${a}` + rest.map(l => '\n  - ' + l.replace(/^·\s*/, '')).join('');
    })].join('\n')).join('\n\n');
  }).join('\n\n---\n\n') + '\n';
}
function sqCopy(text) {
  const ok = () => toast('📋 복사했어요 · 고친 뒤 「md로 한꺼번에 편집」에 붙여넣으세요');
  const fallback = () => {
    const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select();
    let done = false; try { done = document.execCommand('copy'); } catch (e) {}
    ta.remove(); if (done) ok(); else alert('자동 복사가 안 돼요. 브라우저의 클립보드 권한을 확인해주세요.');
  };
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
}
