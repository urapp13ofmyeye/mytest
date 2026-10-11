/* ══════════════════════════════════════════════════════════════
   일정 데이터의 틀. 일정은 이제 코드가 아니라 각자의 계정(S.plan)에 저장됩니다.
   applyPlan(plan)이 아래 전역 변수를 계정의 일정으로 채워 화면 코드가 그대로 읽습니다.
   날짜 키는 'MM-DD', 시간은 'HH:MM' 형식
   ══════════════════════════════════════════════════════════════ */
let CONFIG, YEAR, SEM_START, SUBJ, WD, MEAL, EVENTS, DAY_WARN, PLAN, DATES, INFO, SEED_LISTS, PROMPTS, CERTS, TIPS;
const PALETTE = ['#7FAAE8','#A791E3','#7FCB92','#F5AA72','#F090A6','#E6C366','#7CC8C0','#B5B1A9'];
const OTHER_C = '#B3B3B3', LIST_C = {};
const P_START = ['09:00','10:30','12:00','13:30','15:00','16:30'], P_END = ['10:15','11:45','13:15','14:45','16:15','17:45']; // 1~6교시
const ETC = { n: '기타', full: '기타', c: '#B5B1A9' };
const MEAL_BASE = [['12:00','13:00','🍚 점심 + 휴식'], ['18:00','19:00','🍚 저녁 + 휴식']];

const isoOf = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

// 처음 가입한 사람의 빈 일정
function defaultPlan() {
  return {
    title: '공부 플래너', icon: '📚', start: isoOf(new Date()),
    SUBJ: { etc: Object.assign({}, ETC) },
    WD: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
    MEAL: { 0: MEAL_BASE, 1: MEAL_BASE, 2: MEAL_BASE, 3: MEAL_BASE, 4: MEAL_BASE, 5: MEAL_BASE, 6: MEAL_BASE },
    EVENTS: {}, DAY_WARN: {}, PLAN: {}, INFO: {},
    SEED_LISTS: [['etc', ['학생증·필기구 챙기기'], '시험 준비물', '#B5B1A9']],
    PROMPTS: { common: [
      ['모의문제 만들기', `아래는 {과목} 자료야. 시험 유형은 "{유형}"이야. 같은 형식으로 10문제를 내줘. 답은 숨기고, 내가 답하면 채점하고 해설해줘.\n\n[자료]\n(여기에 붙여넣기)`],
      ['틀린 것만 다시', '방금 내가 틀리거나 헷갈린 문제의 개념만 모아서, 형식을 바꿔 5문제를 다시 내줘. 답은 숨기고, 내가 답하면 해설해줘.'],
    ] },
    CERTS: null,
    TIPS: { title: '시험기간 생존 전략', today: ['🍅 25분 집중 + 5분 휴식', '🌙 시험 전날은 새 내용 없이 오답만'], overview: ['🎯 하루 목표는 작게 쪼개기'], notice: '' },
  };
}

// 계정의 일정(plan)을 화면 코드가 읽는 전역 변수에 연결. plan 안의 객체를 그대로 가리키므로 고친 뒤 다시 호출하면 DATES도 갱신됨
function applyPlan(p) {
  const d = defaultPlan();
  for (const k of Object.keys(d)) if (p[k] === undefined) p[k] = d[k];
  if (!p.SUBJ.etc) p.SUBJ.etc = Object.assign({}, ETC);
  for (let i = 0; i < 7; i++) { if (!p.WD[i]) p.WD[i] = []; if (!p.MEAL[i]) p.MEAL[i] = MEAL_BASE; }
  if (!p.PROMPTS.common) p.PROMPTS.common = [];
  const [y, m, dd] = p.start.split('-').map(Number);
  CONFIG = { title: p.title, icon: p.icon };
  YEAR = y; SEM_START = new Date(y, m - 1, dd);
  SUBJ = p.SUBJ; WD = p.WD; MEAL = p.MEAL; EVENTS = p.EVENTS; DAY_WARN = p.DAY_WARN; PLAN = p.PLAN;
  INFO = p.INFO; SEED_LISTS = p.SEED_LISTS; PROMPTS = p.PROMPTS; CERTS = p.CERTS; TIPS = p.TIPS;
  DATES = Object.keys(PLAN).sort();
}
