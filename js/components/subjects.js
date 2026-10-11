/* 과목 탭: 전체 개요 · 과목 상세 · AI 프롬프트 · 암기 카드 */
/* ══════════ 렌더: 과목 ══════════ */
let viewSubj = 'all';
// 유형·범위: 직접 입력한 값 > 기본값. 비어 있으면 "확인 필요"로 강조
const FIELDS = { type: '유형', range: '범위' };
const infoVal = (id, key) => ((S.info[id] || {})[key] || INFO[id][key] || '').trim();
const infoTodo = (id, key) => !infoVal(id, key) || /미정/.test(infoVal(id, key));
const infoShow = (id, key) => !infoVal(id, key) ? `<span class="todo">${FIELDS[key]} 확인 필요</span>` : infoTodo(id, key) ? `<span class="todo">${esc(infoVal(id, key))}</span>` : esc(infoVal(id, key));
const missing = () => Object.keys(INFO).map(id => [id, Object.keys(FIELDS).filter(k => infoTodo(id, k))]).filter(m => m[1].length);
function promptsOf(id) { return [...(PROMPTS[id] || []), ...PROMPTS.common].map(p => [p[0], p[1].split('{과목}').join(SUBJ[id].full).split('{유형}').join(infoVal(id, 'type') || '미정')]); }
function promptSection(id) {
  return `<div class="sect">🤖 AI 프롬프트 — 복사해서 자료와 함께 붙여넣기</div>
    <div class="card">${promptsOf(id).map((p, i) => `<div class="prow"><details><summary>${p[0]}</summary><pre>${esc(p[1])}</pre></details><button class="btn" data-copy="${id}|${i}">복사</button></div>`).join('')}</div>`;
}
let study = null; // 암기 카드 테스트 중: { subj, ids, i, show }
function cardSection(id) {
  const cs = S.cards[id] || [], known = cs.filter(c => c.ok === true).length, weak = cs.filter(c => c.ok === false).length;
  if (study && study.subj === id) {
    const c = cs.find(x => x.id === study.ids[study.i]);
    return `<div class="sect">🃏 암기 카드 테스트 ${Math.min(study.i + 1, study.ids.length)}/${study.ids.length}</div>` + (c
      ? `<button class="flash" data-card="flip"><small>${study.show ? '답' : '문제 — 눌러서 답 보기'}</small><b>${esc(study.show ? c.a : c.q)}</b>${study.show ? `<i>${esc(c.q)}</i>` : ''}</button>
        <div class="nowbtn">${study.show ? '<button class="btn" data-card="no">✗ 몰라요</button><button class="btn pri" data-card="ok">✓ 알아요</button>' : ''}<button class="btn" data-card="exit">그만</button></div>`
      : `<div class="card"><div class="nowt">한 바퀴 끝! 알아요 ${known} · 몰라요 ${weak}</div>
        <div class="nowbtn">${weak ? `<button class="btn pri" data-card="start|weak">모르는 것만 다시 (${weak})</button>` : ''}<button class="btn" data-card="exit">닫기</button></div></div>`);
  }
  return `<div class="sect">🃏 암기 카드 ${cs.length}장${cs.length ? ` · 알아요 ${known} · 몰라요 ${weak}` : ''}</div>
    <div class="card">
      ${cs.length ? `<div class="nowbtn" style="margin:0 0 8px"><button class="btn pri" data-card="start|all">▶ 전체 테스트</button>${weak ? `<button class="btn" data-card="start|weak">모르는 것만 (${weak})</button>` : ''}</div>
        <details><summary>카드 목록 ${cs.length}장 보기 · 지우기</summary>${cs.map(c => `<div class="item"><label><span>${c.ok === true ? '✓ ' : c.ok === false ? '✗ ' : ''}<b>${esc(c.q)}</b> — ${esc(c.a)}</span></label><button class="x" data-delcard="${id}|${c.id}" aria-label="삭제">×</button></div>`).join('')}</details>`
        : '<div class="tip">아직 카드가 없어요. 약어·용어를 넣어두면 답을 가리고 셀프 테스트할 수 있어요.</div>'}
      <form class="addrow" data-addcard="${id}"><input name="q" placeholder="앞면 (예: ISO)" aria-label="앞면" required><input name="a" placeholder="뒷면 (뜻)" aria-label="뒷면" required><button class="btn">＋</button></form>
      <details><summary>여러 장 한 번에 붙여넣기</summary>
        <form data-bulkcard="${id}"><textarea class="field" name="bulk" aria-label="여러 장 붙여넣기" placeholder="한 줄에 한 장 — 앞면 - 뒷면&#10;ISO - International Organization for Standardization" required></textarea>
        <div class="addrow"><button class="btn">한꺼번에 추가</button></div></form></details>
    </div>`;
}
function renderSubj() {
  const tabs = `<div class="stabs"><button data-subj="all" class="${viewSubj === 'all' ? 'on' : ''}">전체 개요</button>${Object.keys(INFO).map(id =>
    `<button data-subj="${id}" class="${viewSubj === id ? 'on' : ''}" style="--c:${SUBJ[id].c}">${SUBJ[id].n}</button>`).join('')}</div>`;
  if (viewSubj === 'all') return tabs + (missing().length ? `<div class="todobox"><b>❓ 아직 확인 안 한 것 ${missing().reduce((a, m) => a + m[1].length, 0)}개</b>
      ${missing().map(([id, ks]) => `<button data-subj="${id}"><em style="--c:${SUBJ[id].c}">${SUBJ[id].n}</em> ${ks.map(k => FIELDS[k]).join(' · ')} ›</button>`).join('')}
      <small>공지 확인 후 과목을 눌러 입력하면 여기서 사라져요.</small></div>` : '') + `<div class="ovgrid">${Object.entries(INFO).map(([id, f]) => {
      const p = progress(t => t.subj === id);
      return `<button class="ov" data-subj="${id}" style="--c:${SUBJ[id].c}">
        <div class="nm">${SUBJ[id].full}</div>
        <div class="dt">${f.exam} <span class="tag-exam">${f.kind || '시험'} ${dday(f.date)}</span></div>
        <div class="tp">${infoShow(id, 'type')} · 범위: ${infoShow(id, 'range')}<br>${f.stages.map(s => s[0]).join(' → ')}</div>
        <div class="bar-label"><span>진행도</span><span>${p.pct}% · ${fmtH(p.dn)} / ${fmtH(p.tot)}</span></div>
        <div class="bar"><i style="width:${p.pct}%"></i></div></button>`;
    }).join('')}</div>
    ${TIPS.notice ? `<div class="warn" style="margin-top:12px">${TIPS.notice}</div>` : ''}
    ${tipCard(TIPS.overview)}`;
  const id = viewSubj, f = INFO[id], sj = SUBJ[id], p = progress(t => t.subj === id), ts = allTasks().filter(t => t.subj === id);
  return tabs + `<div style="--c:${sj.c}">
    <div class="metacards">
      <div class="card"><small>${f.kind ? '일정' : '시험일'}</small><b>${f.exam} <span class="tag-exam">${dday(f.date)}</span></b></div>
      ${Object.entries(FIELDS).map(([k, n]) => `<div class="card${infoTodo(id, k) ? ' need' : ''}"><small>${n}${infoTodo(id, k) ? ' · ❓ 확인 필요' : ''}</small>
        <input class="infoin" data-info="${id}|${k}" value="${esc(infoVal(id, k))}" placeholder="공지 확인 후 여기에 입력" aria-label="${sj.full} ${n}"></div>`).join('')}
      <div class="card"><small>계획된 공부 시간</small><b>${fmtH(p.tot)} (${ts.length}블록)</b></div>
    </div>
    <div class="banner">💡 ${f.tip}</div>
    <div class="card">
      ${f.stages.map(s => `<div class="stage"><span>${s[0]}</span><div>${s[1]}</div></div>`).join('')}
      <div class="bar-label" style="margin-top:10px"><span>전체 진행도</span><span>${p.pct}% (${fmtH(p.dn)} / ${fmtH(p.tot)})</span></div>
      <div class="bar"><i style="width:${p.pct}%"></i></div>
    </div>
    <div class="sect">할 일 ${ts.filter(t => S.done[t.id]).length}/${ts.length}</div>
    <div class="card">${ts.map(t => taskRow(Object.assign({}, t, { t: label(t.day) + ' — ' + t.t }), false)).join('')}</div>
    ${promptSection(id)}
    ${cardSection(id)}
    ${f.links ? `<div class="sect">강의자료</div><div class="card links">${f.links.map(l => `<a href="${l[1]}" target="_blank" rel="noopener">${l[0]} ↗</a>`).join('')}</div>` : ''}
    <div class="sect">메모</div>
    <textarea class="field" style="margin-top:0" data-note="${id}" placeholder="시험 유형, 교수님이 강조한 내용 등" aria-label="${sj.full} 메모">${esc(S.notes[id] || '')}</textarea>
  </div>`;
}
