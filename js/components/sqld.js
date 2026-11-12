/* SQLD 탭: 단원 포도(단원=송이, 소단원=알) · 기출 포도(알=회차) · 포도알 패널 · 오답 모아보기 · md 편집 · 숨김(제목 5번 탭) */
/* ══════════ 상태 도우미 ══════════ */
let sqOpen = null, sqView = 'grape', sqUnit = 'all', sqOnlyOpen = false, sqEnter = false, sqShown = null, sqTaps = [];
let sqKeepAdd = null, sqLast = {}; // 기출 오답을 연달아 적을 때: 추가 폼 열어두기 · 마지막 과목/단원 기억
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
// 기출 회차: id 'e47'
const isExam = id => /^e\d+$/.test(id);
const SQEX = Object.fromEntries(SQLD_EXAMS.map(e => [e.id, e]));
const sqEWrong = eid => SQ().ewrong.filter(w => w.exam === eid);
const sqEOpen = eid => sqEWrong(eid).filter(w => !w.solved).length;
const sqUnitName = id => { const u = SQLD_UNITS.find(x => x.id === id); return u ? `${u.id.slice(-1)}. ${u.name}` : ''; };
// 아무것도 안 적은 포도알 (소단원: 항목·예전 오답 없음 / 기출: 오답·메모 없음)
const sqEmpty = id => isExam(id) ? !sqEWrong(id).length && !(SQ().memo[id] || '').trim()
  : !SQLD_SECTS.some(([k]) => sqList(id, k).length) && !sqWrong(id).length;
// 알 색: 회독 수. 회독 0회인데 적은 것도 없으면 빈 알(점선)
const sqLv = tid => sqReads(tid) ? 'gr' + Math.min(sqReads(tid), 3) : sqEmpty(tid) ? 'gr0 empty' : 'gr0';
const sqIds = u => u.topics.map((_, i) => u.id + '.' + (i + 1));
const sqName = tid => { if (isExam(tid)) return SQEX[tid] ? `제${SQEX[tid].n}회 기출` : '없는 회차'; const t = SQLD_TOPICS[tid]; return t ? t.unit + ' · ' + t.name : '삭제된 소단원'; };
// **굵게**, `코드`만 표시 (나머지는 그대로 글자)
const sqFmt = s => esc(s).replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

/* ══════════ 렌더: SQLD ══════════ */
function renderSqld() {
  const s = SQ(), open = s.wrong.filter(w => !w.solved).length + s.ewrong.filter(w => !w.solved).length;
  const tab = (v, l) => `<button data-sqview="${v}" class="${sqView === v ? 'on' : ''}">${l}</button>`;
  const html = `<div class="stabs" style="--c:var(--g2)">${tab('grape', '🍇 SQLD')}${tab('exam', '🍇 기출')}${tab('wrong', `📝 오답 모아보기${open ? ` (${open})` : ''}`)}</div>`
    + (sqView === 'wrong' ? sqWrongView() : sqView === 'exam' ? sqExamView() : sqGrapeView()) + (sqOpen ? sqPanel() : '');
  sqEnter = false;
  return html;
}
// 색 안내 (기출은 헷갈림 점 없음)
const sqKey = (dot, word) => `<span class="sqkey" aria-label="색 안내"><span><i class="grape mini gr0 empty"></i>빈 칸</span><span><i class="grape mini gr0"></i>0회</span><span><i class="grape mini gr1"></i>1회</span><span><i class="grape mini gr2"></i>2회</span><span><i class="grape mini gr3"></i>3회+ ${word}</span>
  ${dot ? '<span><i class="gdot"></i>헷갈림 남음</span>' : ''}<span><i class="gbadge">2</i>미해결 오답</span></span>`;
// 송이 줄 나누기: 위가 넓은 역삼각형 (예: 8개 → 4·3·1, 18개 → 6·5·4·3)
function sqRows(ids) {
  const rows = []; let k = 1; while (k * (k + 1) / 2 < ids.length) k++;
  for (let i = 0, w = k; i < ids.length; i += w, w--) rows.push(ids.slice(i, i + w));
  return rows;
}
function sqGrapeView() {
  const all = Object.keys(SQLD_TOPICS), read = all.filter(sqReads).length;
  return `<div class="sqtop"><span>회독한 포도알 <b>${read}</b> / ${all.length}</span>${sqKey(true, '회독')}</div>
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
// 단원 송이 하나
function sqBunch(u) {
  const ids = sqIds(u), rows = sqRows(ids);
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

/* ── 기출 포도: 포도알 1개 = 한 회분 ── */
function sqExamView() {
  const ids = SQLD_EXAMS.map(e => e.id), done = ids.filter(sqReads).length, op = SQ().ewrong.filter(w => !w.solved).length;
  return `<div class="sqtop"><span>푼 회차 <b>${done}</b> / ${ids.length}</span>${sqKey(false, '풀이')}</div>
    <div class="card squnit sqexam">
      <h3>기출 ${SQLD_EXAMS[0].n}~${SQLD_EXAMS[ids.length - 1].n}회<small>풀이 ${done}/${ids.length}${op ? ` · 미해결 오답 ${op}` : ''}</small></h3>
      <div class="bunch big"><span class="stem" aria-hidden="true"></span>${sqRows(ids).map(r => `<div class="grow">${r.map(sqExamGrape).join('')}</div>`).join('')}</div>
      <div class="tip sqexamtip">회차를 눌러 오답 노트와 메모를 적어요. 색은 푼 횟수예요.</div>
    </div>`;
}
function sqExamGrape(eid) {
  const e = SQEX[eid], w = sqEOpen(eid);
  const desc = `제${e.n}회 (${e.y}년 ${e.m}월) · ${sqEmpty(eid) ? '아직 기록 없음' : `풀이 ${sqReads(eid)}회`}${w ? ` · 미해결 오답 ${w}개` : ''}`;
  return `<button class="grape big ${sqLv(eid)}${sqOpen === eid ? ' on' : ''}" data-sqopen="${eid}" aria-label="${esc(desc)}" title="${esc(desc)}"><small>${e.y}</small>${e.n}회${w ? `<i class="gbadge">${w}</i>` : ''}</button>`;
}

/* ── 포도알 패널 (넓은 화면: 오른쪽, 폰: 아래 시트) ── */
function sqPanel() {
  if (isExam(sqOpen)) {
    const e = SQEX[sqOpen]; if (!e) { sqOpen = null; return ''; }
    return sqShell(e.id, `${e.y}년 ${e.m}월 시행`, `제${e.n}회 기출`, sqExamBody(e), '풀이');
  }
  const t = SQLD_TOPICS[sqOpen]; if (!t) { sqOpen = null; return ''; }
  const u = SQLD_UNITS.find(x => x.id === t.unit);
  return sqShell(t.id, `${u.id} ${esc(u.name)} · ${t.n}번`, esc(t.name), `
      ${SQLD_SECTS.map(s => sqSection(t.id, s)).join('')}
      ${sqUnitWrong(t.id)}
      <div class="sqhide"><button class="linkbtn" data-sqcopy="${t.id}">📋 이 소단원 md로 복사</button></div>`, '회독');
}
// 패널 틀: 머리(제목·닫기) · 본문 · 바닥(이전 · 횟수 −1/+1 · 다음). word = '회독' | '풀이'
function sqShell(id, sub, title, body, word) {
  const r = sqReads(id);
  return `<button class="sqback" data-sqclose="1" tabindex="-1" aria-label="패널 닫기"></button>
  <aside class="sqpanel${sqEnter ? ' enter' : ''}" role="dialog" aria-modal="true" aria-labelledby="sqptitle">
    <div class="sqphead"><i class="grape mini ${sqLv(id)}" aria-hidden="true"></i><div><small>${sub}</small><h2 id="sqptitle">${title}</h2></div>
      <button class="x sqclose" data-sqclose="1" aria-label="패널 닫기">✕</button></div>
    <div class="sqbody">${body}</div>
    <div class="sqfoot">${sqNavBtn(id, -1)}<span>${word} <b>${r}</b>회</span>
      <button class="btn" data-sqread="${id}|-1"${r ? '' : ' disabled'} aria-label="${word} 1 빼기" title="잘못 눌렀을 때">−1</button>
      <button class="btn pri" data-sqread="${id}|1">${word} 완료 +1</button>${sqNavBtn(id, 1)}</div>
  </aside>`;
}
// 이전/다음 (소단원은 단원 경계를 넘어 1-1.1 → 2-3.4, 기출은 45 → 62회). 끝이면 비활성
const sqStep = (id, dir) => { const ids = isExam(id) ? SQLD_EXAMS.map(e => e.id) : Object.keys(SQLD_TOPICS); return ids[ids.indexOf(id) + dir] || null; };
function sqNavBtn(id, dir) {
  const to = sqStep(id, dir), lbl = dir < 0 ? '이전' : '다음', what = isExam(id) ? '회차' : '소단원';
  return to ? `<button class="btn sqnav" data-sqopen="${to}" title="${lbl}: ${esc(sqName(to))} (${dir < 0 ? '←' : '→'})" aria-label="${lbl} ${what}: ${esc(sqName(to))}">${dir < 0 ? '‹' : '›'}</button>`
    : `<button class="btn sqnav" disabled aria-label="${lbl} ${what} 없음">${dir < 0 ? '‹' : '›'}</button>`;
}

/* ── 기출 패널 본문: 오답 노트 + 메모 ── */
function sqExamBody(e) {
  const ws = sqEWrong(e.id).sort((a, b) => (+a.no || 999) - (+b.no || 999)), op = ws.filter(w => !w.solved).length;
  const keep = sqKeepAdd === e.id;
  return `<div class="sect">오답 노트${ws.length ? `<small>미해결 ${op}/${ws.length}</small>` : ''}</div>
    <div class="sqsect">${ws.map(w => sqEWCard(w, false)).join('')}
      <details class="sqwadd"${!ws.length || keep ? ' open' : ''}><summary>＋ 오답 추가</summary>${sqEWForm(e.id, null, keep && !editing)}</details></div>
    <div class="sect">메모</div>
    <textarea class="field sqmemo" data-sqmemo="${e.id}" placeholder="점수, 시간 배분, 이 회차 총평 등 (자동 저장)" aria-label="제${e.n}회 메모">${esc(SQ().memo[e.id] || '')}</textarea>`;
}
// 단원 고르기: 과목을 고르면 그 과목 단원만, 안 고르면 과목별로 묶어서 전부
function sqUnitOpts(subj, unit) {
  const opt = u => `<option value="${u.id}"${u.id === unit ? ' selected' : ''}>${esc(sqUnitName(u.id))}</option>`;
  return '<option value="">단원 선택</option>' + (subj ? SQLD_UNITS.filter(u => u.id[0] === subj).map(opt).join('')
    : Object.keys(SQLD_SUBJ).map(k => `<optgroup label="${k}과목">${SQLD_UNITS.filter(u => u.id[0] === k).map(opt).join('')}</optgroup>`).join(''));
}
function sqEWForm(eid, w, focus) {
  const f = w || { subj: sqLast.subj || '', unit: sqLast.unit || '' };
  return `<form class="sqwform" data-sqew="${eid}"${w ? ` data-sqwid="${w.id}"` : ''}>
    <div class="sqwrow">
      <input class="field sqnoin" name="no" value="${esc(f.no || '')}" inputmode="numeric" maxlength="3" placeholder="번호" aria-label="문제 번호" data-sqno="1"${focus || w ? ' data-editfocus' : ''}>
      <select class="field" name="subj" data-sqsubj="1" aria-label="과목"><option value="">과목</option>${Object.keys(SQLD_SUBJ).map(k => `<option value="${k}"${f.subj === k ? ' selected' : ''}>${k}과목</option>`).join('')}</select>
      <select class="field" name="unit" data-squnitsel="1" aria-label="단원">${sqUnitOpts(f.subj, f.unit)}</select>
    </div>
    <textarea class="field" name="memo" rows="3" placeholder="메모 (왜 틀렸는지, 헷갈린 개념, 정답 근거…)" aria-label="메모">${esc(f.memo || '')}</textarea>
    <div class="sqwrow"><span class="tip sqwhint">번호를 적으면 과목이 자동으로 골라져요 (1~10번 1과목)</span>
      ${w ? '<button type="button" class="btn" data-canceledit="1">취소</button><button class="btn pri">저장</button>' : '<button class="btn pri">추가</button>'}</div>
  </form>`;
}
function sqEWCard(w, showExam) {
  if (editing === 'sqe:' + w.id) return sqEWForm(w.exam, w);
  const e = SQEX[w.exam];
  return `<div class="sqw${w.solved ? ' done' : ''}">
    <label class="sqwck"><input type="checkbox" data-sqesolved="${w.id}"${w.solved ? ' checked' : ''}>해결</label>
    <div class="sqwbody">
      <div class="sqwtags">${showExam && e ? `<button class="sqtopic" data-sqopen="${e.id}">${e.n}회 ›</button>` : ''}<b>${w.no ? esc(w.no) + '번' : '번호 없음'}</b>
        ${w.subj || w.unit ? `<span class="sqsub">${w.subj ? w.subj + '과목' : ''}${w.unit ? ' · ' + esc(sqUnitName(w.unit)) : ''}</span>` : ''}</div>
      ${w.memo ? `<div class="sqwhy">${sqFmt(w.memo)}</div>` : ''}
    </div>
    <div class="sqact"><button class="x" data-sqewedit="${w.id}" title="수정" aria-label="오답 수정">✎</button><button class="x" data-sqewdel="${w.id}" aria-label="오답 삭제">×</button></div>
  </div>`;
}
// 소단원 패널 아래: 같은 단원의 기출 오답 + (있으면) 예전 오답 메모
function sqUnitWrong(tid) {
  const t = SQLD_TOPICS[tid], ew = SQ().ewrong.filter(w => w.unit === t.unit).sort(sqEWOrder), old = sqWrong(tid);
  return `<div class="sect">${t.unit} 단원 기출 오답${ew.length ? `<small>미해결 ${ew.filter(w => !w.solved).length}/${ew.length}</small>` : ''}</div>
    ${ew.length ? `<div class="sqsect">${ew.map(w => sqEWCard(w, true)).join('')}</div>` : '<div class="tip sqempty" style="padding:0">🍇 기출 탭에서 회차를 눌러 오답을 적으면 단원별로 여기에 모여요.</div>'}
    ${old.length ? `<div class="sect">예전 오답 메모<small>기출 포도로 옮긴 뒤 지워주세요</small></div><div class="sqsect">${old.map(w => sqWrongCard(w, false)).join('')}</div>` : ''}`;
}
const sqEWOrder = (a, b) => (+b.exam.slice(1)) - (+a.exam.slice(1)) || (+a.no || 999) - (+b.no || 999); // 최근 회차 먼저, 번호순
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
// 예전(단원 포도) 오답: 새로 추가는 안 하고, 옮기기 전까지 보기·수정·삭제만
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
// 기출 오답(회차별) + 예전 오답(단원 포도)을 단원별로 걸러 봄
function sqWrongView() {
  const s = SQ(), oldUnit = w => (SQLD_TOPICS[w.topic] || {}).unit;
  if (sqUnit !== 'all' && !SQLD_UNITS.some(u => u.id === sqUnit)) sqUnit = 'all';
  const pass = (w, u) => (sqUnit === 'all' || u === sqUnit) && (!sqOnlyOpen || !w.solved);
  const cnt = u => s.ewrong.filter(w => !w.solved && (u === 'all' || w.unit === u)).length + s.wrong.filter(w => !w.solved && (u === 'all' || oldUnit(w) === u)).length;
  const ew = s.ewrong.filter(w => pass(w, w.unit)).sort(sqEWOrder), old = s.wrong.slice().reverse().filter(w => pass(w, oldUnit(w)));
  const any = s.ewrong.length + s.wrong.length;
  return `<div class="sqfilter"><div class="wtabs">${['all', ...SQLD_UNITS.map(u => u.id)].map(u =>
      `<button data-squnit="${u}" class="${sqUnit === u ? 'on' : ''}">${u === 'all' ? '전체' : u}${cnt(u) ? ` · ${cnt(u)}` : ''}</button>`).join('')}</div>
    <label class="optck"><input type="checkbox" data-sqonly="1"${sqOnlyOpen ? ' checked' : ''}>미해결만 보기</label></div>
    ${ew.length ? `<div class="card sqwlist">${ew.map(w => sqEWCard(w, true)).join('')}</div>` : ''}
    ${old.length ? `<div class="sect">예전 오답 메모 (단원 포도)<small style="font-weight:500;color:var(--mute);margin-left:6px">기출 포도로 옮긴 뒤 지워주세요</small></div><div class="card sqwlist">${old.map(w => sqWrongCard(w, true)).join('')}</div>` : ''}
    ${ew.length || old.length ? '' : `<div class="card tip">${any ? '조건에 맞는 오답이 없어요.' : '아직 오답이 없어요. 🍇 기출 탭에서 회차를 눌러 오답을 적어보세요.'}</div>`}
    <div class="tip" style="margin-top:8px;color:var(--mute)">칩의 숫자는 미해결 오답 수예요. 회차를 누르면 그 기출 포도알이 열려요. 단원을 안 고른 오답은 「전체」에서만 보여요.</div>`;
}

/* ══════════ 이벤트 (app.js의 위임에서 호출) ══════════ */
const sqFind = (tid, k, id) => sqList(tid, k).find(x => x.id === id);
// 처리했으면 true. 아무것도 안 바뀌었으면(취소 등) 'skip'
function sqClick(d) {
  if (d.sqopen) { sqEnter = !sqOpen; sqOpen = d.sqopen; editing = null; sqKeepAdd = null; }
  else if (d.sqclose) { sqOpen = null; editing = null; }
  else if (d.sqview) { sqView = d.sqview; editing = null; window.scrollTo(0, 0); }
  else if (d.squnit) sqUnit = d.squnit;
  else if (d.sqtog) { const [tid, id] = d.sqtog.split('|'), x = sqFind(tid, 'confuse', id); if (x) x.done = !x.done; }
  else if (d.sqedit) editing = 'sq:' + d.sqedit;
  else if (d.sqdel) { const [tid, k, id] = d.sqdel.split('|'); SQ().items[tid][k] = sqList(tid, k).filter(x => x.id !== id); }
  else if (d.sqwedit) editing = 'sqw:' + d.sqwedit;
  else if (d.sqwdel) { if (!confirm('이 오답 메모를 지울까요?')) return 'skip'; SQ().wrong = SQ().wrong.filter(w => w.id !== d.sqwdel); }
  else if (d.sqewedit) editing = 'sqe:' + d.sqewedit;
  else if (d.sqewdel) { if (!confirm('이 오답을 지울까요?')) return 'skip'; SQ().ewrong = SQ().ewrong.filter(w => w.id !== d.sqewdel); }
  else if (d.sqread) {
    const [id, n] = d.sqread.split('|'); SQ().reads[id] = Math.max(0, sqReads(id) + +n);
    if (+n > 0) toast(isExam(id) ? `🍇 제${SQEX[id].n}회 ${sqReads(id)}번째 풀이 완료` : `🍇 ${SQLD_TOPICS[id].name} ${sqReads(id)}회독 완료`);
  }
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
  else if (d.sqesolved) { const w = SQ().ewrong.find(x => x.id === d.sqesolved); if (w) w.solved = el.checked; }
  else if (d.sqonly) sqOnlyOpen = el.checked;
  // 기출 오답 폼: 과목 ↔ 단원 맞추기 (입력 중인 폼이라 다시 그리지 않고 그 자리에서 바꿈)
  else if (d.sqsubj) { const u = el.form.elements.unit; u.innerHTML = sqUnitOpts(el.value, u.value[0] === el.value ? u.value : ''); return false; }
  else if (d.squnitsel) { if (el.value) sqSetSubj(el.form, el.value[0]); return false; }
  else return false;
  return true;
}
function sqSetSubj(form, subj) {
  const s = form.elements.subj, u = form.elements.unit;
  if (s.value === subj) return;
  const keep = u.value[0] === subj ? u.value : '';
  s.value = subj; u.innerHTML = sqUnitOpts(subj, keep);
}
// 입력할 때마다: 기출 메모는 저장(다시 그리지 않음), 문제 번호는 과목 자동 선택. 저장할 게 있으면 true
function sqInput(el) {
  const d = el.dataset;
  if (d.sqmemo) { SQ().memo[d.sqmemo] = el.value; return true; }
  if (d.sqno) { const n = parseInt(el.value, 10); if (n >= 1 && n <= 50) sqSetSubj(el.form, n <= 10 ? '1' : '2'); }
  return false;
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
  else if (d.sqew) {
    const vals = { no: v('no').replace(/\D/g, ''), subj: v('subj'), unit: v('unit'), memo: v('memo') };
    if (vals.unit && !vals.subj) vals.subj = vals.unit[0];
    if (!vals.no && !vals.unit && !vals.memo) { alert('번호·단원·메모 중 하나는 적어주세요.'); return false; }
    const w = d.sqwid && SQ().ewrong.find(x => x.id === d.sqwid);
    if (w) Object.assign(w, vals);
    else { SQ().ewrong.push(Object.assign({ id: uid(), exam: d.sqew, solved: false }, vals)); sqKeepAdd = d.sqew; sqLast = { subj: vals.subj, unit: vals.unit }; }
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
    if (to) { sqOpen = to; editing = null; sqKeepAdd = null; render(); }
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
