/* 일정 설정 화면: 과목 · 고정 시간표 · 시험/마감 · 공부 블록을 앱 안에서 직접 입력 */
const ORDER = [1, 2, 3, 4, 5, 6, 0]; // 월~일
const emptyState = () => `<div class="card emptybox"><b>아직 입력한 일정이 없어요</b>
  <div class="tip">과목을 추가하고 공부 블록을 넣으면 이 화면이 채워져요.</div>
  <button class="btn pri" data-tab="setup">✏️ 내 일정 입력하러 가기</button></div>`;

const realSubj = () => Object.keys(SUBJ).filter(id => id !== 'etc');
const subjOptions = ids => ids.map(id => `<option value="${id}">${esc(SUBJ[id].n)}</option>`).join('');
const fld = (label, inner, cls) => `<label${cls ? ` class="${cls}"` : ''}>${label}${inner}</label>`;

function renderSetup() {
  const p = S.plan, subs = realSubj();
  const evs = Object.keys(EVENTS).sort().flatMap(d => EVENTS[d].map((e, i) => [d, i, e]));
  const nBlocks = Object.values(PLAN).reduce((a, b) => a + b.length, 0);
  return `<div class="backrow"><button class="btn" data-tab="more">‹ 돌아가기</button><b>✏️ 내 일정 설정</b></div>
    <div class="tip" style="margin-top:8px">위에서부터 차례로 입력하세요. 입력하면 바로 저장돼요. 필요한 것만 채워도 돼요.</div>

    <div class="sect">① 기본 정보</div>
    <form class="card" data-setup="basic">
      <div class="setrow">${fld('제목', `<input name="title" value="${esc(p.title)}" maxlength="20" required>`, 'grow')}
        ${fld('아이콘', `<input name="icon" value="${esc(p.icon)}" maxlength="4">`)}
        ${fld('학기 시작일 (1주차 첫날)', `<input type="date" name="start" value="${esc(p.start)}" required>`)}</div>
      <div class="addrow"><button class="btn pri">저장</button></div>
      <div class="tip" style="margin-top:6px">날짜는 시작일과 <b>같은 해</b>만 입력할 수 있어요.</div>
    </form>

    <div class="sect">② 과목 (${subs.length}개)</div>
    <div class="card setlist">
      ${subs.map(id => `<div class="item"><span><i class="dot" style="--c:${SUBJ[id].c}"></i><b>${esc(SUBJ[id].n)}</b>${SUBJ[id].full !== SUBJ[id].n ? ' · ' + esc(SUBJ[id].full) : ''}</span>
        <button class="x" data-sdel="subj|${id}" aria-label="${esc(SUBJ[id].n)} 삭제">×</button></div>`).join('') || '<div class="tip">아직 과목이 없어요. 아래에서 추가하세요.</div>'}
      <form data-setup="subj">
        <div class="setrow">${fld('짧은 이름 (달력에 보이는 이름)', `<input name="n" maxlength="8" placeholder="예: 컴구" required>`)}
          ${fld('전체 이름 (선택)', `<input name="full" maxlength="30" placeholder="예: 컴퓨터구조">`)}</div>
        <div class="colors" style="margin-top:10px">${PALETTE.map((c, i) => `<input type="radio" name="color" id="scol${i}" value="${c}"${i ? '' : ' checked'}><label for="scol${i}" style="--c:${c}"><span class="sr">색 ${i + 1}</span></label>`).join('')}</div>
        <div class="addrow"><button class="btn pri">＋ 과목 추가</button></div>
      </form>
    </div>

    <div class="sect">③ 고정 시간표 (수업·알바)</div>
    <div class="card setlist">
      ${ORDER.map(d => WD[d].map((f, i) => `<div class="item"><span><b>${DOW[d]}</b> ${f[0]}~${f[1]} · ${esc(f[3])}</span>
        <button class="x" data-sdel="wd|${d}|${i}" aria-label="삭제">×</button></div>`).join('')).join('') || '<div class="tip">아직 없어요. 수업이 없으면 건너뛰어도 돼요.</div>'}
      <form data-setup="wd">
        <div class="setrow">${fld('요일', `<select name="day">${ORDER.map(d => `<option value="${d}">${DOW[d]}요일</option>`).join('')}</select>`)}
          ${fld('시작', `<input type="time" name="s" required>`)}${fld('끝', `<input type="time" name="e" required>`)}
          ${fld('종류', `<select name="who">${subjOptions(subs)}<option value="work">기타 일정 (알바 등)</option></select>`)}
          ${fld('표시 이름 (기타 일정은 필수)', `<input name="name" maxlength="20" placeholder="예: 알바">`, 'grow')}</div>
        <div class="addrow"><button class="btn pri">＋ 시간표 추가</button></div>
      </form>
    </div>

    <div class="sect">④ 시험 · 마감 (${evs.length}개)</div>
    <div class="card setlist">
      ${evs.map(([d, i, e]) => `<div class="item"><span>${e.k === 'exam' ? '📝' : '📌'} <b>${label(d)}</b> ${e.s || ''} · ${esc(e.t)}</span>
        <button class="x" data-sdel="ev|${d}|${i}" aria-label="삭제">×</button></div>`).join('') || '<div class="tip">아직 없어요.</div>'}
      <form data-setup="ev">
        <div class="setrow">${fld('날짜', `<input type="date" name="date" required>`)}
          ${fld('종류', `<select name="k"><option value="exam">시험</option><option value="due">마감·제출</option></select>`)}
          ${fld('과목', `<select name="subj">${subjOptions(Object.keys(SUBJ))}</select>`)}
          ${fld('시작 (선택)', `<input type="time" name="s">`)}${fld('끝 (선택)', `<input type="time" name="e">`)}
          ${fld('제목 (비우면 자동)', `<input name="t" maxlength="40" placeholder="예: 중간고사">`, 'grow')}
          <label class="chk"><input type="checkbox" name="mark" checked>맨 위 D-day 카드에 표시</label></div>
        <div class="addrow"><button class="btn pri">＋ 일정 추가</button></div>
      </form>
    </div>

    <div class="sect">⑤ 공부 블록 (${nBlocks}개)</div>
    <div class="card">
      <form data-setup="block">
        <div class="setrow">${fld('날짜', `<input type="date" name="date" required>`)}
          ${fld('반복 끝나는 날 (선택)', `<input type="date" name="until">`)}
          ${fld('시작', `<input type="time" name="s" required>`)}${fld('끝', `<input type="time" name="e" required>`)}
          ${fld('과목', `<select name="subj">${subjOptions(Object.keys(SUBJ))}</select>`)}
          ${fld('할 일', `<input name="t" maxlength="80" placeholder="예: 1~3장 요약" required>`, 'grow')}
          <label class="chk"><input type="checkbox" name="opt">여유 블록 (밀리면 버려도 되는 것)</label></div>
        <div class="addrow"><button class="btn pri">＋ 블록 추가</button></div>
      </form>
      <div class="tip" style="margin-top:8px">"반복 끝나는 날"을 넣으면 그 날짜까지 <b>매일</b> 같은 블록이 생겨요.<br>
        추가한 블록은 <b>오늘·달력 탭</b>에서 확인하고, 각 블록의 × 로 삭제해요.</div>
    </div>

    <div class="sect">⑥ 일정 통째로 옮기기</div>
    <form class="card" data-setup="plancode">
      <div class="tip">다른 계정으로 일정을 복사하거나 백업할 때 써요. 불러오면 지금 일정이 <b>통째로 바뀝니다</b>.</div>
      <textarea class="field" name="code" id="plancode" placeholder="일정 코드를 붙여넣기" aria-label="일정 코드"></textarea>
      <div class="addrow"><button type="button" class="btn" data-sact="planexport">일정 코드 복사</button><button class="btn">일정 불러오기</button></div>
    </form>`;
}

/* ── 일정 고친 뒤 처리 ── */
// 직접 만든 과목은 과목 탭 정보(INFO)를 시험·마감 일정에서 자동으로 채움
function syncInfo() {
  const p = S.plan;
  for (const id of Object.keys(p.SUBJ)) if (id !== 'etc' && !p.INFO[id]) p.INFO[id] = { auto: 1, exam: '', date: '', range: '', type: '', stages: [], tip: '' };
  for (const id of Object.keys(p.INFO)) {
    if (!p.SUBJ[id]) { delete p.INFO[id]; continue; }
    const f = p.INFO[id]; if (!f.auto) continue;
    const evs = Object.keys(p.EVENTS).sort().flatMap(d => p.EVENTS[d].filter(e => e.subj === id).map(e => [d, e]));
    const pick = evs.find(x => x[1].k === 'exam') || evs[0];
    if (!pick) { f.exam = ''; f.date = ''; delete f.kind; continue; }
    f.date = pick[0]; f.exam = label(pick[0]) + (pick[1].s ? ' ' + pick[1].s + '~' : '');
    if (pick[1].k === 'due') f.kind = '마감'; else delete f.kind;
  }
}
function commit() {
  applyPlan(S.plan); syncInfo(); resetView();
  save(); render();
}
// 'YYYY-MM-DD'를 'MM-DD'로. 학기 시작일과 해가 다르면 null
function dayKey(iso) {
  if (+iso.slice(0, 4) !== YEAR) { alert('날짜는 학기 시작일과 같은 해(' + YEAR + '년)만 넣을 수 있어요.'); return null; }
  return iso.slice(5);
}
const orderOk = (s, e) => mins(s) < mins(e) || (alert('끝나는 시간이 시작 시간보다 늦어야 해요.'), false);
function eachDay(fromKey, untilKey) {
  const out = [], d = toDate(fromKey), end = toDate(untilKey);
  while (d <= end && d.getFullYear() === YEAR && out.length < 200) { out.push(keyOf(d)); d.setDate(d.getDate() + 1); }
  return out;
}
const subjUsed = id => Object.values(PLAN).some(a => a.some(b => b[2] === id)) || Object.values(EVENTS).some(a => a.some(e => e.subj === id)) || Object.values(WD).some(a => a.some(f => f[2] === id));

document.addEventListener('submit', e => {
  const f = e.target, kind = f.dataset && f.dataset.setup; if (!kind) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const p = S.plan, el = f.elements, v = n => el[n].value.trim();
  if (kind === 'basic') {
    const y = +v('start').slice(0, 4);
    if (YEAR !== y && (Object.keys(PLAN).length || Object.keys(EVENTS).length) && !confirm('시작일의 해가 바뀌면 이미 입력한 날짜들이 ' + y + '년으로 옮겨져요. 계속할까요?')) return;
    p.title = v('title'); p.icon = v('icon') || '📚'; p.start = v('start');
  } else if (kind === 'subj') {
    const id = 's' + uid(), n = v('n');
    if (Object.values(SUBJ).some(s => s.n === n)) { alert('같은 이름의 과목이 이미 있어요.'); return; }
    p.SUBJ[id] = { n, full: v('full') || n, c: el.color.value };
    S.lists.push({ id, name: p.SUBJ[id].full, color: p.SUBJ[id].c, items: [] });
  } else if (kind === 'wd') {
    const who = v('who'), name = v('name') || (who === 'work' ? '' : SUBJ[who].full);
    if (!name) { alert('기타 일정은 표시 이름을 적어주세요. (예: 알바)'); return; }
    if (!orderOk(v('s'), v('e'))) return;
    p.WD[+v('day')].push([v('s'), v('e'), who, name]);
    p.WD[+v('day')].sort((a, b) => a[0] < b[0] ? -1 : 1);
  } else if (kind === 'ev') {
    const key = dayKey(v('date')); if (!key) return;
    if (v('s') && v('e') && !orderOk(v('s'), v('e'))) return;
    const sj = SUBJ[v('subj')], isExam = v('k') === 'exam';
    const ev = { s: v('s'), e: v('e'), k: v('k'), subj: v('subj'), t: v('t') || sj.full + (isExam ? ' 시험' : ' 마감') };
    if (el.mark.checked) ev.mark = sj.n + (isExam ? '' : ' 마감');
    (p.EVENTS[key] = p.EVENTS[key] || []).push(ev);
  } else if (kind === 'block') {
    const key = dayKey(v('date')); if (!key) return;
    if (!orderOk(v('s'), v('e'))) return;
    let days = [key];
    if (v('until')) {
      const u = dayKey(v('until')); if (!u) return;
      if (u < key) { alert('반복 끝나는 날이 시작 날짜보다 빠를 수 없어요.'); return; }
      days = eachDay(key, u);
    }
    for (const d of days) { // 이미 있는 날은 맨 뒤에 추가 (체크 기록이 순서로 연결되므로 끼워 넣지 않음)
      const b = [v('s'), v('e'), v('subj'), v('t')]; if (el.opt.checked) b.push(1);
      (p.PLAN[d] = p.PLAN[d] || []).push(b);
    }
  } else if (kind === 'plancode') {
    let np;
    try { np = JSON.parse(v('code')); if (!np || !np.SUBJ || !np.PLAN || !np.start) throw 0; } catch (err) { alert('일정 코드가 올바르지 않아요.'); return; }
    if (!confirm('지금 일정을 이 코드의 일정으로 통째로 바꿀까요?')) return;
    S.plan = np; applyPlan(np);
    if (confirm('체크리스트도 이 일정의 기본 항목으로 바꿀까요?\n(취소하면 지금 체크리스트를 그대로 둬요)')) S.lists = seed(np).lists;
  }
  commit();
});

document.addEventListener('click', e => {
  const b = e.target.closest('[data-sdel],[data-sact]'); if (!b) return;
  e.stopImmediatePropagation();
  const p = S.plan;
  if (b.dataset.sact === 'planexport') {
    const box = document.getElementById('plancode'); box.value = JSON.stringify(p); box.select();
    (navigator.clipboard ? navigator.clipboard.writeText(box.value) : Promise.reject()).then(() => alert('복사했어요!'), () => alert('위 칸의 코드를 직접 복사하세요.'));
    return;
  }
  const [what, a, i] = b.dataset.sdel.split('|');
  if (what === 'subj') {
    if (subjUsed(a)) { alert('이 과목을 쓰는 시간표·시험·공부 블록이 있어서 지울 수 없어요. 먼저 그것들을 지워주세요.'); return; }
    if (!confirm(SUBJ[a].n + ' 과목을 삭제할까요?')) return;
    delete p.SUBJ[a]; delete p.INFO[a];
  } else if (what === 'wd') p.WD[+a].splice(+i, 1);
  else if (what === 'ev') { p.EVENTS[a].splice(+i, 1); if (!p.EVENTS[a].length) delete p.EVENTS[a]; }
  commit();
});
