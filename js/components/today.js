/* 오늘 탭: 하루 시간대별 일정 */
/* ══════════ 렌더: 하루 ══════════ */
function taskEditForm(id) {
  const t = allTasks().find(x => x.id === id) || DATES.flatMap(customOf).find(x => x.id === id); if (!t) return '';
  return `<form class="editrow" data-edittask="${t.id}" style="--c:${(SUBJ[t.subj] || SUBJ.etc).c}">
    <input name="t" value="${esc(t.t)}" aria-label="할 일" data-editfocus required>
    <div class="editline">
      <select name="subj" aria-label="과목">${Object.entries(SUBJ).map(([k, s]) => `<option value="${k}"${k === t.subj ? ' selected' : ''}>${esc(s.n)}</option>`).join('')}</select>
      <input type="time" name="s" value="${t.s}" aria-label="시작 시간"><span>~</span><input type="time" name="e" value="${t.e}" aria-label="끝 시간">
      ${t.custom ? '' : `<label class="optck"><input type="checkbox" name="opt"${t.opt ? ' checked' : ''}>여유</label>`}
    </div>
    <div class="editline"><button class="btn pri">저장</button><button type="button" class="btn" data-canceledit="1">취소</button></div>
  </form>`;
}
function taskRow(t, showTime) {
  if (editing === 'task:' + t.id) return taskEditForm(t.id);
  const sj = SUBJ[t.subj] || SUBJ.etc, d = !!S.done[t.id];
  return `<div class="row task${d ? ' done' : ''}${t.opt ? ' opt' : ''}" style="--c:${sj.c}">
    ${showTime ? `<div class="tm">${t.moved && !t.s ? '이월' : (t.s || '') + '<br>' + (t.e || '')}</div>` : ''}
    <label class="body"><input type="checkbox" data-done="${t.id}"${d ? ' checked' : ''}>
      <span class="txt"><em>${sj.n}</em>${t.opt ? '<u>여유</u>' : ''}${esc(t.t)}${t.h ? `<small>${showTime || !t.s ? '' : t.s + ' · '}${fmtH(t.h)}${t.moved ? ' · ' + label(t.orig) + '에서 이월' : ''}</small>` : ''}</span></label>
    ${showTime && t.day && nextDay(t.day) && !d ? `<button class="x" data-move${t.custom ? 'c' : ''}="${t.id}|${nextDay(t.day)}" title="다음 날로 미루기" aria-label="다음 날로 미루기">↪</button>` : ''}
    <button class="x" data-edit="task:${t.id}" title="수정" aria-label="수정">✎</button>
    <button class="x" data-${t.custom ? 'delc' : 'hide'}="${t.id}" aria-label="삭제">×</button></div>`;
}
function fixedOf(k) {
  const ev = EVENTS[k] || [], exams = ev.filter(e => e.k === 'exam').map(e => e.subj);
  const cls = (WD[toDate(k).getDay()] || []).filter(f => !exams.includes(f[2]))
    .map(f => ({ s: f[0], e: f[1], type: !SUBJ[f[2]] ? 'alba' : 'class', subj: f[2], t: f[3] }));
  return { ev, cls };
}
function timeline(k) {
  const { ev, cls } = fixedOf(k);
  const rows = [
    ...cls.map(c => ({ s: c.s, html: `<div class="row" style="--c:${c.type === 'alba' ? OTHER_C : SUBJ[c.subj].c}"><div class="tm">${c.s}<br>${c.e}</div><div class="body">${c.type === 'alba' ? '💼 ' + c.t : '🏫 ' + c.t + ' 수업'}</div></div>` })),
    ...MEAL[toDate(k).getDay()].map(m => ({ s: m[0], html: `<div class="row meal"><div class="tm">${m[0]}<br>${m[1]}</div><div class="body">${m[2]}</div></div>` })),
    ...ev.map(e => ({ s: e.s || '00:00', html: `<div class="row ${e.k}" style="--c:${SUBJ[e.subj].c}"><div class="tm">${e.s}<br>${e.e}</div><div class="body">${e.k === 'exam' ? '📝 ' : '📌 '}${esc(e.t)}${e.place ? ' · ' + esc(e.place) : ''}${e.est ? '<small>수업시간 기준</small>' : ''}${e.desc ? `<div style="font-weight:400;font-size:12px">${esc(e.desc)}</div>` : ''}</div></div>` })),
    ...[...tasksOf(k), ...customOf(k)].map(t => ({ s: t.s || '99:99', html: taskRow(t, true) })),
  ].sort((a, b) => a.s < b.s ? -1 : a.s > b.s ? 1 : 0);
  return rows.map(r => r.html).join('');
}
function dayBadges(k) {
  const tk = todayKey(), ev = EVENTS[k] || [];
  return (k === tk ? '<span class="badge t">오늘</span>' : '') +
    (ev.some(e => e.k === 'exam') ? '<span class="badge e">시험</span>' : '') +
    [...new Set(ev.filter(e => e.k === 'due').map(e => SUBJ[e.subj].n))].map(n => `<span class="badge h">${n}</span>`).join('');
}

function renderToday() {
  if (!DATES.length) return emptyState();
  const k = viewDay, i = DATES.indexOf(k), tk = todayKey();
  const marks = Object.keys(EVENTS).sort().flatMap(d => EVENTS[d].filter(e => e.mark).map(e => [d, e.subj, e.mark]));
  const h = tasksOf(k).reduce((a, t) => a + t.h, 0);
  return `<div class="dstrip">${marks.map(([d, s, n]) =>
      `<div class="dcard${d < tk ? ' past' : ''}" style="--c:${SUBJ[s].c}"><b>${dday(d)}</b><span>${esc(n)}</span><small>${label(d)}</small></div>`).join('')}</div>
    ${overdueBox()}${k === tk ? nowCard() : ''}
    <div class="daynav">
      <button data-day="${DATES[i - 1] || ''}"${i <= 0 ? ' disabled' : ''} aria-label="이전 날">◀</button>
      <h2>${label(k)} ${dayBadges(k)}</h2>
      ${k !== tk && DATES.includes(tk) ? `<button data-day="${tk}">오늘로</button>` : ''}
      <button data-day="${DATES[i + 1] || ''}"${i >= DATES.length - 1 ? ' disabled' : ''} aria-label="다음 날">▶</button>
    </div>
    ${DAY_WARN[k] ? `<div class="warn">${DAY_WARN[k]}</div>` : ''}
    <div class="card">
      <div class="bar-label"><span>${weekNo(k)}주차 · 순공 목표 ${fmtH(h)}</span><span>${fmtH(tasksOf(k).filter(t => S.done[t.id]).reduce((a, t) => a + t.h, 0))} 완료${S.spentDay[k] ? ` · 🍅 실제 ${S.spentDay[k]}분` : ''}</span></div>
      ${timeline(k)}
      <form class="addrow" data-addtask="${k}">
        <select name="subj" aria-label="과목">${Object.entries(SUBJ).map(([id, s]) => `<option value="${id}">${s.n}</option>`).join('')}</select>
        <input name="t" placeholder="이 날 할 일 추가" aria-label="할 일" required>
        <button class="btn pri">추가</button>
      </form>
    </div>
    ${tipCard(TIPS.today)}`;
}
