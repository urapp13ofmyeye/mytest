/* 오늘 탭 위쪽: 밀린 일 상자 + 지금 할 일 카드 + 뽀모도로 타이머 */
function overdueBox() {
  const od = overdue(), bh = behind(), tk = todayKey(), nx = nextDay(tk), can = DATES.includes(tk);
  if (!od.length && !bh.length) return '';
  return `<div class="odbox">
    ${od.length ? `<div class="odh"><b>⏰ 밀린 일 ${od.length}개 · ${fmtH(od.reduce((a, t) => a + t.h, 0))}</b>${od.some(t => t.opt) ? '<button data-dropopt="1">여유 블록 버리기</button>' : ''}${can ? '<button data-moveall="1">전부 오늘로</button>' : ''}</div>
      ${od.map(t => `<div class="odrow" style="--c:${SUBJ[t.subj].c}"><span><em>${SUBJ[t.subj].n}</em>${t.opt ? '<u>여유</u>' : ''}${esc(t.t)} <small>${label(t.orig)} · ${fmtH(t.h)}</small></span>
        <span class="odbtn">${can ? `<button data-move="${t.id}|${tk}">오늘</button>` : ''}${nx ? `<button data-move="${t.id}|${nx}">내일</button>` : ''}<button data-hide="${t.id}">버리기</button></span></div>`).join('')}` : ''}
    ${bh.length ? `<div class="odwarn">${bh.map(([id, g]) => `<span style="--c:${SUBJ[id].c}"><em>${SUBJ[id].n}</em> ${dday(INFO[id].date)} · 계획보다 ${fmtH(g)} 밀림</span>`).join('')}</div>` : ''}
  </div>`;
}

/* ══════════ 지금 할 일 + 뽀모도로 ══════════ */
let lastDone = null; // 방금 끝난 타이머 종류
const timerLeft = () => S.timer ? Math.max(0, Math.round((S.timer.end - Date.now()) / 1000)) : 0;
const clockStr = sec => pad(Math.floor(sec / 60)) + ':' + pad(sec % 60);
function addSpent(id, m) {
  if (m <= 0) return;
  const k = todayKey();
  if (id) S.spent[id] = (S.spent[id] || 0) + m;
  S.spentDay[k] = (S.spentDay[k] || 0) + m;
}
function nowTask() {
  const tk = todayKey(); if (!DATES.includes(tk)) return null;
  const ts = tasksOf(tk).filter(t => !S.done[t.id]); if (!ts.length) return null;
  const n = new Date(), m = n.getHours() * 60 + n.getMinutes(), timed = ts.filter(t => t.s);
  return timed.find(t => mins(t.s) <= m && m < mins(t.e)) || ts.find(t => !t.s) || timed.find(t => mins(t.s) > m) || ts[0];
}
function nowCard() {
  const tk = todayKey(), tm = S.timer;
  const t = tm && tm.id ? allTasks().find(x => x.id === tm.id) : nowTask(), sj = t ? SUBJ[t.subj] : SUBJ.etc;
  const head = t ? `<div class="nowt"><em>${sj.n}</em>${esc(t.t)}</div>
      <div class="nows">${t.s ? t.s + '~' + t.e : '이월된 일'} · 계획 ${fmtH(t.h)}${S.spent[t.id] ? ` · 실제 ${S.spent[t.id]}분` : ''}</div>`
    : '<div class="nowt">오늘 계획한 블록은 다 끝났어요 🎉</div>';
  const ctl = tm ? `<div class="clock" id="clock">${clockStr(timerLeft())}</div>
      <div class="nows">${tm.mode === 'focus' ? '🍅 집중 중 — 폰은 뒤집어 두기' : '☕ 쉬는 중'}</div>
      <div class="nowbtn"><button class="btn" data-timer="stop">${tm.mode === 'focus' ? '중단 (한 만큼 기록)' : '쉬기 끝내기'}</button></div>`
    : `<div class="nowbtn">${lastDone === 'focus' ? '<button class="btn pri" data-timer="break">☕ 5분 쉬기</button>' : ''}
      ${t ? `<button class="btn${lastDone === 'focus' ? '' : ' pri'}" data-timer="focus|${t.id}">▶ 25분 집중${lastDone === 'focus' ? ' 한 번 더' : ' 시작'}</button>
      <label class="btn"><input type="checkbox" class="sr" data-done="${t.id}">✓ 이 블록 완료</label>` : ''}</div>`;
  return `<div class="card nowcard" style="--c:${sj.c}"><div class="nowh"><b>지금 할 일</b><span>오늘 🍅 ${S.pomo[tk] || 0}세트 · ${S.spentDay[tk] || 0}분</span></div>${head}${ctl}</div>`;
}
function beep() {
  try { const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(a.destination); o.frequency.value = 880; g.gain.value = 0.15; o.start(); o.stop(a.currentTime + 0.6); } catch (e) {}
  try { navigator.vibrate && navigator.vibrate([300, 150, 300]); } catch (e) {}
}
setInterval(() => {
  if (!S || !S.timer) return;
  const left = timerLeft(), el = document.getElementById('clock');
  if (el) el.textContent = clockStr(left);
  document.title = clockStr(left) + (S.timer.mode === 'focus' ? ' 🍅 집중' : ' ☕ 휴식');
  if (left > 0) return;
  const t = S.timer;
  if (t.mode === 'focus') { addSpent(t.id, t.len); S.pomo[todayKey()] = (S.pomo[todayKey()] || 0) + 1; }
  S.timer = null; lastDone = t.mode; document.title = CONFIG.title;
  save(); beep(); render();
}, 1000);
