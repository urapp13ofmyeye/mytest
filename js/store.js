/* 저장 상태 · 날짜/시간 도우미 · 공부 블록 계산 (화면 코드 공용) */
const DOW = ['일','월','화','수','목','금','토'];
/* ══════════ 상태 저장 ══════════ */
const KEY = CONFIG.storageKey;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function seed() {
  return {
    done: {}, hidden: {}, custom: {}, notes: {}, certs: {}, info: {}, tab: 'today',
    moved: {}, spent: {}, spentDay: {}, pomo: {}, cards: {}, timer: null,
    lists: SEED_LISTS.map(([k, items, name, color]) => ({
      id: k, name: name || SUBJ[k].full, color: color || SUBJ[k].c,
      items: items.map(t => ({ id: uid(), t, done: false })),
    })),
  };
}
let S;
try { S = Object.assign(seed(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = seed(); }
function save() { S.savedAt = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
const fmtTime = t => t ? new Date(t).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '기록 없음';
const b64 = { enc: s => encodeURIComponent(btoa(unescape(encodeURIComponent(s)))), dec: s => decodeURIComponent(escape(atob(decodeURIComponent(s)))) };
// 백업 데이터로 이 기기 내용을 덮어씀 (확인 후). 성공하면 true
function importData(text, src) {
  let v;
  try { v = JSON.parse(text); if (!v || !Array.isArray(v.lists)) throw 0; } catch (e) { alert('백업 데이터가 올바르지 않아요.'); return false; }
  if (!confirm(src + ' 데이터로 이 기기의 내용을 덮어쓸까요?\n\n가져올 데이터: ' + fmtTime(v.savedAt) + ' 저장\n이 기기 데이터: ' + fmtTime(S.savedAt) + ' 저장')) return false;
  S = Object.assign(seed(), v, { timer: null, tab: 'more' });
  return true;
}
if (location.hash.indexOf('#data=') === 0) {
  let txt = null;
  try { txt = b64.dec(location.hash.slice(6)); } catch (e) { alert('링크의 데이터가 올바르지 않아요.'); }
  history.replaceState(null, '', location.pathname + location.search);
  if (txt && importData(txt, '링크의')) save();
}

/* ══════════ 유틸 ══════════ */
const pad = n => String(n).padStart(2, '0');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const toDate = k => new Date(YEAR, +k.slice(0, 2) - 1, +k.slice(3));
const keyOf = d => pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const mins = t => +t.slice(0, 2) * 60 + +t.slice(3);
const hrs = (s, e) => (mins(e) - mins(s)) / 60;
const fmtH = h => (Math.round(h * 10) / 10) + 'h';
const label = k => `${+k.slice(0, 2)}/${+k.slice(3)}(${DOW[toDate(k).getDay()]})`;
const weekNo = k => Math.floor((toDate(k) - SEM_START) / 6048e5) + 1;
function todayKey() { const n = new Date(); return n.getFullYear() === YEAR ? keyOf(n) : (n < SEM_START ? '00-00' : '99-99'); }
function dday(k) {
  const n = new Date(), t = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  const d = Math.round((toDate(k) - t) / 864e5);
  return d === 0 ? 'D-DAY' : d > 0 ? 'D-' + d : 'D+' + -d;
}
let viewDay = DATES.includes(todayKey()) ? todayKey() : (todayKey() < DATES[0] ? DATES[0] : DATES[DATES.length - 1]);
const calWeek = k => { const d = toDate(k); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return keyOf(d); }; // 그 주 월요일
let viewWeek = calWeek(viewDay);

// 계획 블록 전체(원래 날짜 기준). S.moved[id]가 있으면 그 날짜로 이월된 것
function baseTasks() {
  return Object.keys(PLAN).flatMap(k => PLAN[k].map((p, i) => ({ id: k + '#' + i, orig: k, s: p[0], e: p[1], subj: p[2], t: p[3], h: hrs(p[0], p[1]), opt: !!p[4] })))
    .filter(t => !S.hidden[t.id]);
}
const lastMark = () => { for (const d of Object.keys(EVENTS).sort().reverse()) { const e = EVENTS[d].filter(x => x.mark).pop(); if (e) return [d, e.mark]; } return null; };
const tipCard = lines => lines && lines.length ? `<div class="sect">⚡ ${TIPS.title}</div><div class="card tip">${lines.join('<br>')}</div>` : '';
function tasksOf(k) {
  return baseTasks().filter(t => (S.moved[t.id] || t.orig) === k)
    .map(t => Object.assign(t, { day: k }, S.moved[t.id] && S.moved[t.id] !== t.orig ? { s: '', e: '', moved: 1 } : {}))
    .sort((a, b) => (a.s || '99') < (b.s || '99') ? -1 : (a.s || '99') > (b.s || '99') ? 1 : 0);
}
const nextDay = k => DATES[DATES.indexOf(k) + 1];
const overdue = () => { const tk = todayKey(); return allTasks().filter(t => t.day < tk && !S.done[t.id]); };
// 과목별로 "어제까지 계획한 시간 − 실제 완료한 시간"이 1시간 이상이면 경고
function behind() {
  const tk = todayKey();
  return Object.keys(INFO).filter(id => INFO[id].date >= tk).map(id => {
    const ts = baseTasks().filter(t => t.subj === id && !t.opt);
    const gap = ts.filter(t => t.orig < tk).reduce((a, t) => a + t.h, 0) - ts.filter(t => S.done[t.id]).reduce((a, t) => a + t.h, 0);
    return gap >= 1 ? [id, gap] : null;
  }).filter(Boolean);
}
function allTasks() { return DATES.flatMap(k => tasksOf(k).map(t => Object.assign(t, { day: k }))); }
function progress(filter) {
  let tot = 0, dn = 0;
  allTasks().filter(filter || (() => true)).forEach(t => { tot += t.h; if (S.done[t.id]) dn += t.h; });
  return { tot, dn, pct: tot ? Math.round(dn / tot * 100) : 0 };
}
