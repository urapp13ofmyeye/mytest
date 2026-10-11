/* 달력 탭: 주간 그리드 / 목록 */
/* ══════════ 렌더: 달력 ══════════ */
function weekDays(w) {
  return [...Array(7)].map((_, i) => { const d = toDate(w); d.setDate(d.getDate() + i); return keyOf(d); });
}
function pill(t) {
  const sj = SUBJ[t.subj] || SUBJ.etc, d = !!S.done[t.id];
  return `<label class="pill${d ? ' done' : ''}${t.opt ? ' opt' : ''}" style="--c:${sj.c}"><input type="checkbox" class="sr" data-done="${t.id}"${d ? ' checked' : ''}>
    <b>${d ? '✓ ' : ''}${sj.n}${t.opt ? ' · 여유' : ''}</b><span>${esc(t.t)}${t.h ? ' · ' + fmtH(t.h) : ''}</span></label>`;
}
function renderCal() {
  const weeks = [...new Set(DATES.map(calWeek))], tk = todayKey(), grid = S.calMode !== 'list';
  const all = weekDays(viewWeek), days = all.filter(k => DATES.includes(k));
  const total = days.reduce((a, k) => a + tasksOf(k).reduce((x, t) => x + t.h, 0), 0);
  const short = k => label(k).replace(/\(.\)/, '');
  const tabs = `<div class="wtabs">${weeks.map(w => {
      const ds = weekDays(w);
      return `<button data-week="${w}" class="${w === viewWeek ? 'on' : ''}">${short(ds[0])}~${short(ds[6])}${w === calWeek(tk) ? ' · 이번 주' : ''}</button>`;
    }).join('')}<span class="mode"><button data-mode="grid" class="${grid ? 'on' : ''}">▦ 주간</button><button data-mode="list" class="${grid ? '' : 'on'}">☰ 목록</button></span></div>`;
  const body = grid ? `<div class="gridwrap"><div class="wgrid">${all.map(k => {
      const { ev, cls } = fixedOf(k), wd = toDate(k).getDay(), on = DATES.includes(k);
      return `<div class="gcol${k === tk ? ' today' : ''}${ev.some(e => e.k === 'exam') ? ' examday' : ''}${k < tk ? ' past' : ''}">
        <div class="gh"${wd === 0 || wd === 6 ? ' style="color:var(--exam)"' : ''}>${DOW[wd]}</div>
        <div class="gd"${on ? ` data-day="${k}" data-go="today"` : ''}>${short(k)} ${k === tk ? '<span class="badge t">오늘</span>' : k > tk ? `<span class="badge h">${dday(k)}</span>` : ''}</div>
        ${ev.map(e => `<div class="pill solid ${e.k}" style="--c:${e.k === 'exam' ? 'var(--exam)' : SUBJ[e.subj].c}">${e.k === 'exam' ? '📝' : '📌'} ${e.s} ${e.t}</div>`).join('')}
        ${cls.map(c => c.type === 'alba' ? `<div class="pill cls alba">${c.s}~${c.e} 💼 ${c.t}</div>` : `<div class="pill cls" style="--c:${SUBJ[c.subj].c}">${c.s}~${c.e} 🏫 ${SUBJ[c.subj].n} 수업</div>`).join('')}
        ${tasksOf(k).map(pill).join('')}
        ${(S.custom[k] || []).map(c => pill({ id: c.id, subj: c.subj, t: c.t })).join('')}
      </div>`;
    }).join('')}</div></div>`
  : `<div class="week">${days.map(k => {
      const { ev, cls } = fixedOf(k), ts = tasksOf(k), h = ts.reduce((a, t) => a + t.h, 0);
      return `<div class="day${k === tk ? ' today' : ''}${ev.some(e => e.k === 'exam') ? ' examday' : ''}${k < tk ? ' past' : ''}">
        <h3 data-day="${k}" data-go="today">${label(k)} ${dayBadges(k)}<span class="hrs">${h ? '순공 ' + fmtH(h) : ''} ›</span></h3>
        <div class="chips">${ev.map(e => `<span class="chip ${e.k}" style="--c:${SUBJ[e.subj].c}">${e.k === 'exam' ? '📝' : '📌'} ${e.s} ${e.t}</span>`).join('')}
          ${cls.map(c => `<span class="chip cls" style="--c:${c.type === 'alba' ? OTHER_C : SUBJ[c.subj].c}">${c.s} ${c.type === 'alba' ? '💼 ' + c.t : '🏫 ' + SUBJ[c.subj].n}</span>`).join('')}</div>
        ${ts.map(t => taskRow(t, false)).join('')}
        ${(S.custom[k] || []).map(c => taskRow({ id: c.id, subj: c.subj, t: c.t, custom: 1 }, false)).join('')}
      </div>`;
    }).join('')}</div>`;
  return tabs + body + `<div class="card tip" style="margin-top:10px">🍅 이 주 순공 목표: ${days.map(k => DOW[toDate(k).getDay()] + ' ' + fmtH(tasksOf(k).reduce((x, t) => x + t.h, 0))).join(' + ')} → 총 약 <b>${fmtH(total)}</b><br>칸을 누르면 완료 체크, 날짜를 누르면 시간대별 일정으로 이동해요.</div>`;
}
