/* 일정 설정 화면: 과목 · 고정 시간표 · 시험/마감 · 공부 블록을 앱 안에서 직접 입력 */
const ORDER = [1, 2, 3, 4, 5, 6, 0]; // 월~일
const emptyState = () => Object.keys(EVENTS).length
  ? `<div class="card emptybox"><b>이제 공부 계획만 짜면 돼요</b>
  <div class="tip">시험 정보는 입력됐어요. 내 일정 설정의 <b>⑤ AI로 공부 계획 짜기</b>로 계획을 채우면 이 화면이 완성돼요.</div>
  <button class="btn pri" data-tab="setup">✨ 공부 계획 짜러 가기</button></div>`
  : `<div class="card emptybox"><b>아직 입력한 일정이 없어요</b>
  <div class="tip">과목과 시험을 입력하고 공부 계획을 짜면 이 화면이 채워져요.</div>
  <button class="btn pri" data-tab="setup">내 일정 입력하기</button></div>`;

const realSubj = () => Object.keys(SUBJ).filter(id => id !== 'etc');
const subjOptions = ids => ids.map(id => `<option value="${id}">${esc(SUBJ[id].n)}</option>`).join('');
const fld = (label, inner, cls) => `<label${cls ? ` class="${cls}"` : ''}>${label}${inner}</label>`;

function renderSetup() {
  const p = S.plan, subs = realSubj();
  const evs = Object.keys(EVENTS).sort().flatMap(d => EVENTS[d].map((e, i) => [d, i, e]));
  const exams = evs.filter(x => x[2].k === 'exam'), others = evs.filter(x => x[2].k !== 'exam'), ai = p.ai || {};
  const nBlocks = Object.values(PLAN).reduce((a, b) => a + b.length, 0);
  return `<div class="backrow"><button class="btn" data-tab="more">‹ 돌아가기</button><b>내 일정 설정</b></div>
    <div class="tip" style="margin-top:8px">위에서부터 차례로 입력하세요. 입력하면 바로 저장돼요. 필요한 것만 채워도 돼요.</div>

    <div class="sect">① 기본 정보</div>
    <form class="card" data-setup="basic">
      <div class="setrow">${fld('제목', `<input name="title" value="${esc(p.title)}" maxlength="20" required>`, 'grow')}
        ${fld('아이콘', `<input name="icon" value="${esc(p.icon)}" maxlength="4">`)}
        ${fld('학기 시작일', `<input type="date" name="start" value="${esc(p.start)}" required>`)}</div>
      <div class="addrow"><button class="btn pri">저장</button></div>
      <div class="tip" style="margin-top:6px">학기 시작일은 1주차 첫날이에요. 날짜는 시작일과 같은 해만 넣을 수 있어요.</div>
    </form>

    <div class="sect">② 과목 (${subs.length}개)</div>
    <div class="card setlist">
      ${subs.map(id => `<div class="item"><span><i class="dot" style="--c:${SUBJ[id].c}"></i><b>${esc(SUBJ[id].n)}</b>${SUBJ[id].full !== SUBJ[id].n ? ' · ' + esc(SUBJ[id].full) : ''}</span>
        <button class="x" data-sdel="subj|${id}" aria-label="${esc(SUBJ[id].n)} 삭제">×</button></div>`).join('') || '<div class="tip">아직 과목이 없어요. 아래에서 추가하세요.</div>'}
      <form data-setup="subj">
        <div class="setrow">${fld('짧은 이름', `<input name="n" maxlength="8" placeholder="예: 컴구" required>`)}
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
          ${fld('종류', `<select name="who">${subjOptions(subs)}<option value="work">기타 일정 (알바 등)</option></select>`)}
          <label class="grow" data-period${subs.length ? '' : ' hidden'}>교시로 고르기 (강의만)<span class="perpair">
            <select name="p1" aria-label="시작 교시"><option value="">직접 입력</option>${P_START.map((t, i) => `<option value="${i}">${i + 1}교시 (${t}~${P_END[i]})</option>`).join('')}</select><span>~</span>
            <select name="p2" aria-label="끝 교시"><option value="">같은 교시</option>${P_START.map((t, i) => `<option value="${i}">${i + 1}교시까지</option>`).join('')}</select></span></label>
          ${fld('시작', `<input name="s" inputmode="numeric" maxlength="5" placeholder="0900" autocomplete="off" data-time required>`)}${fld('끝', `<input name="e" inputmode="numeric" maxlength="5" placeholder="1015" autocomplete="off" data-time required>`)}
          ${fld('이름 (기타 일정일 때)', `<input name="name" maxlength="20" placeholder="예: 알바">`, 'grow')}</div>
        <div class="addrow"><button class="btn pri">＋ 시간표 추가</button></div>
      </form>
    </div>

    <div class="sect">④-1 시험 (${exams.length}개)</div>
    <div class="card setlist">
      ${exams.map(([d, i, e]) => `<div class="item"><span><b>${label(d)}</b> ${e.s || ''} · ${esc(e.t)}${e.place ? ' · ' + esc(e.place) : ''}
        ${e.range || e.type ? `<br><small style="color:var(--mute)">${[e.range && '범위: ' + esc(e.range), e.type && '방식: ' + esc(e.type)].filter(Boolean).join(' · ')}</small>` : ''}</span>
        <button class="x" data-sdel="ev|${d}|${i}" aria-label="삭제">×</button></div>`).join('') || '<div class="tip">아직 없어요.</div>'}
      ${subs.length ? `<form data-setup="exam">
        <div class="setrow">${fld('시험 과목', `<select name="subj">${subjOptions(subs)}</select>`, 'grow')}
          ${fld('시험 날짜', `<input type="date" name="date" required>`, 'grow')}
          <button type="button" class="btn" data-sact="classtime" title="그 요일의 수업 시간을 시험 시간으로 채워요">🏫 수업시간에</button>
          ${fld('시작 시간', `<input type="time" name="s">`)}${fld('끝 시간', `<input type="time" name="e">`)}
          ${fld('장소', `<input name="place" maxlength="30" placeholder="예: 인사관 101호">`, 'grow')}
          ${fld('시험 범위', `<input name="range" maxlength="60" placeholder="예: 1~4장, 7주차까지">`, 'grow')}
          ${fld('시험 방식', `<input name="type" maxlength="80" placeholder="예: 객관식 + 단답형, 서술형">`, 'grow')}</div>
        <div class="addrow"><button class="btn pri">＋ 시험 추가</button></div>
        <div class="tip" style="margin-top:6px">범위·방식을 아직 모르면 비워두세요. 나중에 과목 탭에서 채울 수 있어요.</div>
      </form>` : '<div class="tip" style="margin-top:8px">먼저 ②에서 과목을 추가하면 여기서 고를 수 있어요.</div>'}
    </div>

    <div class="sect">④-2 기타 중요 일정 (${others.length}개)</div>
    <div class="card setlist">
      ${others.map(([d, i, e]) => `<div class="item"><span><b>${label(d)}</b> ${e.s || ''} · ${esc(e.t)}${e.desc ? `<br><small style="color:var(--mute)">${esc(e.desc)}</small>` : ''}</span>
        <button class="x" data-sdel="ev|${d}|${i}" aria-label="삭제">×</button></div>`).join('') || '<div class="tip">과제 마감, 발표, 대회처럼 시험이 아닌 일정을 넣어요.</div>'}
      <form data-setup="misc">
        <div class="setrow">${fld('일정명', `<input name="t" maxlength="40" placeholder="예: 과제 제출" required>`, 'grow')}
          ${fld('날짜', `<input type="date" name="date" required>`)}${fld('시간 (선택)', `<input type="time" name="s">`)}
          ${fld('설명 (선택)', `<input name="desc" maxlength="100" placeholder="예: 보고서 5장, 온라인 제출">`, 'grow')}
          <label class="chk"><input type="checkbox" name="mark" checked>맨 위 D-day 카드에 표시</label></div>
        <div class="addrow"><button class="btn pri">＋ 일정 추가</button></div>
      </form>
    </div>

    <div class="sect">⑤ AI로 공부 계획 짜기</div>
    <div class="card">
      <div class="tip"><b>1단계.</b> 위에서 입력한 과목·시간표·시험 정보를 담은 프롬프트를 복사해서 ChatGPT, Claude 같은 AI에 붙여넣으세요.</div>
      <form data-setup="aiprompt">
        <div class="setrow">${fld('하루에 공부할 수 있는 시간', `<input name="hours" maxlength="60" value="${esc(ai.hours || '')}" placeholder="예: 평일 4시간, 주말 6시간">`, 'grow')}
          ${fld('AI에게 전할 말 (선택)', `<input name="note" maxlength="200" value="${esc(ai.note || '')}" placeholder="예: 아침엔 못 해요, 컴구가 제일 약해요">`, 'grow')}</div>
        <div class="addrow"><button class="btn pri">프롬프트 복사</button></div>
        <textarea class="field" id="aiout" readonly placeholder="복사 버튼을 누르면 여기에 프롬프트가 보여요" aria-label="AI 프롬프트" style="min-height:90px"></textarea>
      </form>
      <div class="tip" style="margin-top:14px"><b>2단계.</b> AI가 준 답을 통째로 복사해서 아래에 붙여넣으세요. 공부 블록, 과목별 전략, 체크리스트가 한 번에 채워져요.</div>
      <form data-setup="aiimport">
        <textarea class="field" name="code" placeholder="AI의 답을 여기에 붙여넣기" aria-label="AI의 답" style="min-height:90px" required></textarea>
        <div class="addrow"><button class="btn pri">계획 채우기</button></div>
      </form>
    </div>

    <div class="sect">⑥ 공부 블록 직접 추가 (지금 ${nBlocks}개)</div>
    <div class="card">
      <form data-setup="block">
        <div class="setrow">${fld('날짜', `<input type="date" name="date" required>`)}
          ${fld('반복 끝 (선택)', `<input type="date" name="until">`)}
          ${fld('시작', `<input type="time" name="s" required>`)}${fld('끝', `<input type="time" name="e" required>`)}
          ${fld('과목', `<select name="subj">${subjOptions(Object.keys(SUBJ))}</select>`)}
          ${fld('할 일', `<input name="t" maxlength="80" placeholder="예: 1~3장 요약" required>`, 'grow')}
          <label class="chk"><input type="checkbox" name="opt">여유 블록 (밀리면 버려도 되는 것)</label></div>
        <div class="addrow"><button class="btn pri">＋ 블록 추가</button></div>
      </form>
      <div class="tip" style="margin-top:8px">AI 없이 직접 넣거나, AI가 짠 계획에 더할 때 써요. "반복 끝"을 넣으면 그 날짜까지 <b>매일</b> 같은 블록이 생겨요.<br>
        추가한 블록은 <b>오늘·달력 탭</b>에서 확인하고, 각 블록의 × 로 삭제해요.</div>
    </div>

    <div class="sect">⑦ 일정 통째로 옮기기</div>
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
    if (!pick) { f.exam = ''; f.date = ''; f.range = ''; f.type = ''; delete f.kind; continue; }
    const ev = pick[1];
    f.date = pick[0]; f.exam = label(pick[0]) + (ev.s ? ' ' + ev.s + '~' : '') + (ev.place ? ' · ' + esc(ev.place) : '');
    f.range = ev.range || ''; f.type = ev.type || '';
    if (ev.k === 'due') f.kind = '마감'; else delete f.kind;
  }
}

/* ── AI로 계획 짜기 ── */
// 입력한 정보를 JSON으로 정리해 AI에게 줄 프롬프트를 만듦
function aiPrompt() {
  const p = S.plan, full = k => YEAR + '-' + k, evs = Object.keys(EVENTS).sort().flatMap(d => EVENTS[d].map(e => [d, e]));
  const info = {
    오늘: isoOf(new Date()),
    과목: realSubj().map(id => SUBJ[id].n === SUBJ[id].full ? { 이름: SUBJ[id].n } : { 이름: SUBJ[id].n, 전체이름: SUBJ[id].full }),
    고정시간표: ORDER.flatMap(d => WD[d].map(f => ({ 요일: DOW[d], 시작: f[0], 끝: f[1], 내용: f[3] }))),
    시험: evs.filter(x => x[1].k === 'exam').map(([d, e]) => ({ 과목: SUBJ[e.subj].n, 날짜: full(d), 시작: e.s || '미정', 끝: e.e || '미정',
      장소: e.place || '미정', 범위: e.range || (INFO[e.subj] && infoVal(e.subj, 'range')) || '미정', 방식: e.type || (INFO[e.subj] && infoVal(e.subj, 'type')) || '미정' })),
    기타일정: evs.filter(x => x[1].k !== 'exam').map(([d, e]) => ({ 일정명: e.t, 날짜: full(d), 시간: e.s || '미정', 설명: e.desc || '' })),
    하루공부가능시간: (p.ai && p.ai.hours) || '정해지지 않음',
    요청사항: (p.ai && p.ai.note) || '없음',
  };
  return `너는 대학생의 시험 대비 공부 계획을 짜주는 코치야. 아래 [내 정보]를 보고 오늘부터 마지막 시험 날까지의 공부 계획을 짜줘.

[내 정보]
${JSON.stringify(info, null, 1)}

[계획 규칙]
1. 공부 블록은 "고정시간표"(수업·알바)와 겹치면 안 돼. 점심(12~13시)·저녁(18~19시)과 밤 12시 이후도 피해줘.
2. 블록 하나는 1~2시간. 하루 총량은 "하루공부가능시간"을 넘기지 마.
3. 시험이 빠른 과목부터 먼저 끝내고, 각 과목은 "개념 정리 → 문제 풀이 → 오답"처럼 단계를 나눠줘.
4. 시험 "방식"에 맞는 공부를 넣어줘. (서술형이면 답안 뼈대 쓰기, 객관식이면 문제 풀이처럼)
5. 시험 전날은 새 내용 없이 오답·복습만, 시험 당일 아침은 가볍게 확인만.
6. 밀릴 것을 대비해 2~3일에 한 번 "밀린 것 따라잡기" 블록을 넣고 optional을 true로 해줘. 덜 중요한 보강 블록도 optional true.
7. task는 "1~3장 요약 + 예제 풀기"처럼 구체적으로 써줘. "범위"가 미정이면 "범위 확인 후 ~"처럼 써줘.
8. "기타일정"이 있으면 그 준비 시간도 계획에 넣어줘.

[출력 형식]
아래 JSON 하나만 코드블록으로 출력해줘. 다른 설명은 쓰지 마.
- subject에는 [내 정보]의 과목 "이름"을 글자 그대로 써. 과목과 상관없는 블록은 "기타".
- date는 YYYY-MM-DD, start/end는 24시간제 HH:MM.

\`\`\`json
{
  "blocks": [
    { "date": "${info.오늘}", "start": "14:00", "end": "16:00", "subject": "과목 이름", "task": "구체적인 할 일", "optional": false }
  ],
  "subjects": [
    { "subject": "과목 이름", "tip": "이 과목 공부 요령 한두 문장",
      "stages": [ { "name": "1단계 요약", "desc": "10/12~13 · 범위 요약" } ],
      "checklist": [ "시험 범위 확인", "요약본 완성", "오답 정리" ] }
  ],
  "tips": [ "시험기간 전체에 해당하는 조언 한 줄", "또 한 줄" ]
}
\`\`\``;
}
// AI 답에서 JSON만 골라 읽음 (앞뒤 설명이나 코드블록 표시가 있어도 됨)
function parseAI(text) {
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  const body = text.slice(a, b + 1);
  try { return JSON.parse(body); } catch (e) {}
  // 그대로 안 읽히면 둥근 따옴표로 감싼 JSON일 수 있음 (문장 속 따옴표는 건드리면 안 되므로 실패했을 때만)
  try { return JSON.parse(body.replace(/[“”]/g, '"')); } catch (e) { return null; }
}
const aiTime = s => { const m = String(s || '').match(/^\s*(\d{1,2}):(\d{2})/); return m && +m[1] < 24 && +m[2] < 60 ? pad(+m[1]) + ':' + m[2] : null; };
const aiDay = s => { const m = String(s || '').match(/^\s*(?:(\d{4})[-./])?(\d{1,2})[-./](\d{1,2})/); return m && (!m[1] || +m[1] === YEAR) && +m[2] <= 12 && +m[3] <= 31 ? pad(+m[2]) + '-' + pad(+m[3]) : null; };
const findSubj = name => { const k = String(name || '').trim().toLowerCase(); return Object.keys(SUBJ).find(id => SUBJ[id].n.toLowerCase() === k || SUBJ[id].full.toLowerCase() === k); };
// AI 답을 일정에 반영. 성공하면 true
function applyAI(text) {
  const r = parseAI(text), p = S.plan;
  if (!r || !Array.isArray(r.blocks)) { alert('AI의 답에서 계획을 찾지 못했어요.\n답 전체를 복사했는지 확인하고, 안 되면 AI에게 "JSON 형식으로 다시 줘"라고 해보세요.'); return false; }
  let bad = 0; const rows = [];
  for (const b of r.blocks) {
    const key = aiDay(b.date), s = aiTime(b.start), e = aiTime(b.end), t = String(b.task || '').trim();
    if (!key || !s || !e || mins(s) >= mins(e) || !t) { bad++; continue; }
    rows.push([key, s, e, findSubj(b.subject) || 'etc', t.slice(0, 120), b.optional === true || b.optional === 'true']);
  }
  if (!rows.length) { alert('넣을 수 있는 공부 블록이 없어요. 날짜(YYYY-MM-DD, ' + YEAR + '년)와 시간(HH:MM) 형식을 확인해주세요.'); return false; }
  const old = Object.values(PLAN).reduce((a, x) => a + x.length, 0);
  if (old) {
    if (!confirm('지금 있는 공부 블록 ' + old + '개를 지우고, AI가 짠 ' + rows.length + '개로 바꿀까요?\n(블록의 완료 체크도 함께 지워져요)')) return false;
    for (const k of Object.keys(p.PLAN)) delete p.PLAN[k];
    for (const m of [S.done, S.hidden, S.moved, S.spent]) for (const k of Object.keys(m)) if (/^\d\d-\d\d#/.test(k)) delete m[k];
  }
  rows.sort((a, b) => a[0] + a[1] < b[0] + b[1] ? -1 : 1);
  for (const [key, s, e, subj, t, opt] of rows) { const b = [s, e, subj, t]; if (opt) b.push(1); (p.PLAN[key] = p.PLAN[key] || []).push(b); }
  for (const x of Array.isArray(r.subjects) ? r.subjects : []) { // 과목 탭의 전략·단계, 체크리스트
    const id = findSubj(x.subject), f = id && p.INFO[id]; if (!f) continue;
    if (x.tip) f.tip = esc(x.tip);
    if (Array.isArray(x.stages)) f.stages = x.stages.map(st => Array.isArray(st) ? st : [st.name, st.desc]).filter(st => st[0]).map(st => [esc(st[0]), esc(st[1] || '')]);
    const list = S.lists.find(l => l.id === id);
    if (list && Array.isArray(x.checklist)) for (const c of x.checklist) { const txt = String(c).trim(); if (txt && !list.items.some(i => i.t === txt)) list.items.push({ id: uid(), t: txt, done: false }); }
  }
  if (Array.isArray(r.tips) && r.tips.length) { const tips = r.tips.map(x => esc(x)); p.TIPS.today = tips; p.TIPS.overview = tips; }
  alert('공부 블록 ' + rows.length + '개를 넣었어요.' + (bad ? '\n형식이 맞지 않아 건너뛴 블록: ' + bad + '개' : ''));
  return true;
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
// 숫자로 친 시간을 'HH:MM'으로: 9 → 09:00, 930 → 09:30, 1330 → 13:30, 9:5 → 09:05. 잘못된 값이면 ''
function normTime(str) {
  const t = String(str).replace(/[^\d:]/g, ''); if (!t) return '';
  let h, m;
  if (t.includes(':')) [h, m] = t.split(':').map(x => +x || 0);
  else if (t.length <= 2) { h = +t; m = 0; }
  else { h = +t.slice(0, -2); m = +t.slice(-2); }
  return h < 24 && m < 60 ? pad(h) + ':' + pad(m) : '';
}
// 고정 시간표 입력칸: 교시를 고르면 시간이 채워지고(강의만), 숫자로 친 시간은 칸을 벗어날 때 HH:MM으로 정리
document.addEventListener('change', e => {
  const f = e.target.closest && e.target.closest('form[data-setup="wd"]'); if (!f) return;
  const el = f.elements, n = e.target.name;
  if (n === 'who') {
    const lecture = el.who.value !== 'work';
    f.querySelector('[data-period]').hidden = !lecture;
    if (!lecture) el.p1.value = el.p2.value = '';
  } else if (n === 'p1' || n === 'p2') {
    if (el.p1.value === '') { el.p2.value = ''; return; }
    const a = +el.p1.value, b = el.p2.value === '' ? a : Math.max(a, +el.p2.value);
    el.s.value = P_START[a]; el.e.value = P_END[b];
  } else if (n === 's' || n === 'e') {
    const t = normTime(e.target.value); if (t) e.target.value = t;
    el.p1.value = el.p2.value = ''; // 직접 고쳤으면 교시 선택은 풀어둠
  }
});
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
    const st = normTime(v('s')), en = normTime(v('e'));
    if (!st || !en) { alert('시간은 0900, 930, 13:30처럼 입력해주세요.'); return; }
    if (!orderOk(st, en)) return;
    p.WD[+v('day')].push([st, en, who, name]);
    p.WD[+v('day')].sort((a, b) => a[0] < b[0] ? -1 : 1);
  } else if (kind === 'exam') {
    const key = dayKey(v('date')); if (!key) return;
    if (v('s') && v('e') && !orderOk(v('s'), v('e'))) return;
    const sj = SUBJ[v('subj')];
    (p.EVENTS[key] = p.EVENTS[key] || []).push({ s: v('s'), e: v('e'), k: 'exam', subj: v('subj'), t: sj.full + ' 시험', mark: sj.n,
      place: v('place'), range: v('range'), type: v('type') });
  } else if (kind === 'misc') {
    const key = dayKey(v('date')); if (!key) return;
    const ev = { s: v('s'), e: '', k: 'due', subj: 'etc', t: v('t'), desc: v('desc') };
    if (el.mark.checked) ev.mark = v('t');
    (p.EVENTS[key] = p.EVENTS[key] || []).push(ev);
  } else if (kind === 'aiprompt') {
    p.ai = { hours: v('hours'), note: v('note') };
    if (!Object.values(EVENTS).some(a => a.some(x => x.k === 'exam')) && !confirm('입력한 시험이 없어요. 그래도 프롬프트를 만들까요?')) return;
    const box = document.getElementById('aiout'); box.value = aiPrompt(); box.select();
    (navigator.clipboard ? navigator.clipboard.writeText(box.value) : Promise.reject()).then(() => alert('프롬프트를 복사했어요!\nChatGPT나 Claude에 붙여넣고, 받은 답을 2단계에 붙여넣으세요.'), () => alert('자동 복사가 안 돼요. 아래 칸의 내용을 직접 복사하세요.'));
    save(); return; // 화면을 다시 그리면 프롬프트 칸이 비워지므로 저장만
  } else if (kind === 'aiimport') {
    if (!applyAI(v('code'))) return;
    S.tab = 'cal';
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
  if (b.dataset.sact === 'classtime') { // 시험 날짜의 요일에 있는 그 과목 수업 시간을 시작·끝 칸에 채움
    const el = b.closest('form').elements, id = el.subj.value, iso = el.date.value;
    if (!iso) { alert('시험 날짜를 먼저 골라주세요.'); el.date.focus(); return; }
    const [y, m, d] = iso.split('-').map(Number), wd = new Date(y, m - 1, d).getDay();
    const cls = (WD[wd] || []).find(f => f[2] === id);
    if (!cls) {
      const days = [1, 2, 3, 4, 5, 6, 0].filter(w => (WD[w] || []).some(f => f[2] === id)).map(w => DOW[w]);
      alert(days.length ? SUBJ[id].n + ' 수업은 ' + days.join('·') + '요일에 있어요. 고른 날짜는 ' + DOW[wd] + '요일이에요.' : '고정 시간표에 ' + SUBJ[id].n + ' 수업이 없어요. ③에서 먼저 넣거나 시간을 직접 입력해주세요.');
      return;
    }
    el.s.value = cls[0]; el.e.value = cls[1];
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
