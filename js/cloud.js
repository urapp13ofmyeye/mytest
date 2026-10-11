/* 로그인(이메일+비밀번호) · Supabase 저장/불러오기. 이 기기(localStorage)는 오프라인 보관용 사본 */
const SB_URL = 'https://kxxabmejgzdgabeloyex.supabase.co';
// anon 키는 공개용입니다. 데이터는 DB의 행 보안 정책(자기 행만 읽기/쓰기)으로 보호됩니다
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eGFibWVqZ3pkZ2FiZWxveWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MjkwNjEsImV4cCI6MjEwNzMwNTA2MX0.tAkLNnSgKKMFhHYqi68JuS4eHsxgQS0bn2yiH-35Vx0';
let sb = null, user = null, dirty = false, pushTimer = null, authMode = 'login';

const $ = id => document.getElementById(id);
const SYNC_TEXT = { saving: '☁ 저장 중…', ok: '☁ 저장됨', error: '⚠ 저장 실패 (이 기기엔 저장됨)', off: '' };
let syncState = 'off';
function setSync(s) {
  syncState = s;
  const el = $('sync'); if (el) el.textContent = SYNC_TEXT[s] || '';
  const el2 = $('syncmore'); if (el2) el2.textContent = SYNC_TEXT[s] || '☁ 동기화됨';
}

/* ── 저장 ── */
function payload() { const d = Object.assign({}, S); delete d.timer; delete d.tab; return d; } // 타이머·현재 탭은 기기마다 따로
function cloudPush() {
  if (!sb || !user) return;
  dirty = true; setSync('saving');
  clearTimeout(pushTimer); pushTimer = setTimeout(flush, 800);
}
async function flush() {
  if (!sb || !user || !dirty) return;
  dirty = false;
  const { error } = await sb.from('planner').upsert({ user_id: user.id, data: payload(), updated_at: new Date().toISOString() });
  if (error) { dirty = true; setSync('error'); clearTimeout(pushTimer); pushTimer = setTimeout(flush, 10000); }
  else if (!dirty) setSync('ok');
}

/* ── 불러오기 ── */
async function fetchRemote() {
  const { data, error } = await sb.from('planner').select('data').eq('user_id', user.id).maybeSingle();
  if (error) return { error };
  return { row: data && data.data && Array.isArray(data.data.lists) ? data.data : null };
}
function readLocal() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
function legacyLocal() { // 로그인 도입 전 이 기기에 저장돼 있던 기록 (예전 키 'exam-planner-…')
  try {
    const k = Object.keys(localStorage).find(x => /^exam-planner-/.test(x));
    const v = k && JSON.parse(localStorage.getItem(k));
    return v && Array.isArray(v.lists) ? v : null;
  } catch (e) { return null; }
}
function adopt(st, keep) { // 불러온 상태로 교체 (이 기기의 타이머·탭은 유지)
  S = Object.assign(seed(st.plan), st, keep || {});
  applyPlan(S.plan); resetView();
  if (KEY) { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
}
async function boot(u) {
  user = u; KEY = 'planner-v2:' + u.id;
  const local = readLocal(), r = await fetchRemote();
  const remote = r.row, newer = (a, b) => (a.savedAt || 0) >= (b.savedAt || 0);
  let st = null, pushIt = false;
  if (remote && local) { st = newer(remote, local) ? remote : local; pushIt = st === local; }
  else if (remote) st = remote;
  else if (local) { st = local; pushIt = true; }
  else {
    const old = legacyLocal();
    if (old && confirm('이 기기에 예전 플래너 기록(체크·메모)이 있어요.\n이 계정으로 가져올까요?')) { st = old; pushIt = true; }
  }
  if (r.error && !st) { showAuth('서버에 연결하지 못했어요. 인터넷을 확인하고 새로고침 해주세요.'); return; }
  if (st) adopt(st, { timer: local && local.timer || null, tab: (local && local.tab) || 'today' });
  else { S = seed(defaultPlan()); applyPlan(S.plan); resetView(); pushIt = true; }
  if (!r.error && pushIt) save();
  else if (r.error) setSync('error');
  else setSync('ok');
  $('auth').hidden = true; $('app').hidden = false;
  importFromHash();
  startApp();
}
// 앱으로 돌아왔을 때 다른 기기에서 바꾼 내용을 가져옴
async function cloudPull() {
  if (!sb || !user || dirty) return;
  const r = await fetchRemote();
  if (r.error || !r.row || dirty || (r.row.savedAt || 0) <= (S.savedAt || 0)) return;
  adopt(r.row, { timer: S.timer, tab: S.tab });
  render();
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { clearTimeout(pushTimer); flush(); }
  else cloudPull();
});
window.addEventListener('pagehide', () => { clearTimeout(pushTimer); flush(); });

/* ── 로그인 화면 ── */
function showAuth(msg) {
  $('app').hidden = true; $('auth').hidden = false;
  const signup = authMode === 'signup';
  $('authtitle').textContent = signup ? '처음이에요 (가입)' : '로그인';
  $('authgo').textContent = signup ? '가입하고 시작' : '로그인';
  $('authswitch').textContent = signup ? '이미 계정이 있어요 → 로그인' : '처음이에요 → 가입하기';
  $('authpw').autocomplete = signup ? 'new-password' : 'current-password';
  $('authmsg').textContent = msg || '';
}
const AUTH_ERR = [
  [/Invalid login credentials/i, '이메일 또는 비밀번호가 맞지 않아요.'],
  [/already registered|already been registered/i, '이미 가입된 이메일이에요. "로그인"으로 들어가 주세요.'],
  [/at least 6|Password should/i, '비밀번호는 6자 이상으로 해주세요.'],
  [/valid email|invalid format|Unable to validate email/i, '이메일 형식이 올바르지 않아요.'],
  [/rate limit|too many/i, '시도가 너무 많아요. 잠시 뒤에 다시 해주세요.'],
  [/Email not confirmed/i, '이메일 인증이 필요한 설정이에요. 관리자에게 알려주세요.'],
];
const authErr = m => (AUTH_ERR.find(([re]) => re.test(m)) || [0, '문제가 생겼어요: ' + m])[1];

$('authform').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('authemail').value.trim(), pw = $('authpw').value, btn = $('authgo');
  btn.disabled = true; $('authmsg').textContent = '잠시만요…';
  try {
    const signup = authMode === 'signup';
    const { data, error } = signup ? await sb.auth.signUp({ email, password: pw }) : await sb.auth.signInWithPassword({ email, password: pw });
    if (error) { showAuth(authErr(error.message)); return; }
    if (!data.session) { showAuth('가입은 됐지만 이메일 인증이 필요한 설정이에요. 관리자에게 알려주세요.'); return; }
    $('authpw').value = '';
    await boot(data.user);
  } catch (err) { showAuth('서버에 연결하지 못했어요. 인터넷을 확인해주세요.'); }
  finally { btn.disabled = false; }
});
$('authswitch').addEventListener('click', () => { authMode = authMode === 'login' ? 'signup' : 'login'; showAuth(''); });

async function logout() {
  if (dirty) { clearTimeout(pushTimer); await flush(); }
  await sb.auth.signOut();
}
async function cloudInit() {
  if (!window.supabase) { showAuth('인터넷에 연결돼야 시작할 수 있어요.'); return; }
  sb = window.supabase.createClient(SB_URL, SB_KEY);
  sb.auth.onAuthStateChange((ev, session) => { // 다른 탭에서 로그아웃하거나 세션이 만료되면 로그인 화면으로
    if (ev === 'SIGNED_OUT') { user = null; KEY = null; S = null; setSync('off'); showAuth(''); }
  });
  const { data } = await sb.auth.getSession();
  if (data.session) await boot(data.session.user); else showAuth('');
}
