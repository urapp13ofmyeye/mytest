/* ══════════ 데이터 ══════════ */
const YEAR = 2026, SEM_START = new Date(2026, 8, 1); // 1주차 = 9/1(화)
const DOW = ['일','월','화','수','목','금','토'];

const SUBJ = {
  jb:  { n: '정봉',     full: '정보봉사론',         c: '#E6C366' },
  cg:  { n: '컴구',     full: '컴퓨터구조',         c: '#A791E3' },
  db:  { n: 'DB',       full: 'DB',                 c: '#7FCB92' },
  we:  { n: '서양이코', full: '서양이코',           c: '#F5AA72' },
  dc:  { n: '디콘제',   full: '디지털콘텐츠제작론', c: '#F090A6' },
  hn:  { n: '한이음',   full: '한이음 2차평가',     c: '#7FAAE8' },
  etc: { n: '기타',     full: '기타',               c: '#B5B1A9' },
};
const PALETTE = ['#7FAAE8','#A791E3','#7FCB92','#F5AA72','#F090A6','#E6C366','#7CC8C0','#B5B1A9'];
const ALBA_C = '#B3B3B3', LIST_C = { cert: '#7CC8C0' };
const P_START = ['09:00','10:30','12:00','13:30','15:00','16:30'], P_END = ['10:15','11:45','13:15','14:45','16:15','17:45']; // 1~6교시

// 고정 시간표 (요일별)
const WD = {
  1: [['10:30','11:45','jb','정보봉사론'], ['15:00','16:15','dc','디지털콘텐츠제작론']],
  2: [['13:30','14:45','cg','컴퓨터구조']],
  3: [['09:00','10:15','jb','정보봉사론'], ['12:00','13:15','dc','디지털콘텐츠제작론']],
  4: [['12:00','16:00','alba','알바'], ['16:30','17:45','cg','컴퓨터구조']],
  5: [['09:00','11:45','db','DB'], ['12:00','16:00','alba','알바']],
};
// 밥·휴식 (요일별)
const MEAL = {
  0: [['12:30','13:30','🍚 점심 + 휴식'], ['18:00','19:00','🍚 저녁 + 휴식']],
  1: [['11:45','13:00','🍚 점심 + 휴식'], ['18:00','19:00','🍚 저녁 + 휴식']],
  2: [['12:00','13:20','🍚 점심 + 휴식'], ['18:00','19:00','🍚 저녁 + 휴식']],
  3: [['13:15','14:30','🍚 점심 + 휴식'], ['18:00','19:00','🍚 저녁 + 휴식']],
  4: [['11:00','11:50','🍚 이른 점심'], ['17:45','19:00','🍚 저녁 + 휴식']],
  5: [['11:45','12:00','🥪 간단 점심 (전날 미리 준비)'], ['16:00','19:00','🛋 간식·휴식·저녁 (알바 끝, 충분히 쉬기)']],
  6: [['12:30','13:30','🍚 점심 + 휴식'], ['18:00','19:00','🍚 저녁 + 휴식']],
};
// 시험·주요 이벤트
const EVENTS = {
  '10-13': [{ s: '', e: '', k: 'due', subj: 'hn', t: '한이음 발표자료 PPT·대본 완성 (자체 마감)' }],
  '10-20': [{ s: '16:00', e: '', k: 'due',  subj: 'hn', t: '한이음 문서 제출 마감 (16:00) — 보고서·설계서·깃허브' }],
  '10-21': [{ s: '09:00', e: '10:15', k: 'exam', subj: 'jb', t: '정보봉사론 시험', est: 1 }],
  '10-22': [{ s: '16:30', e: '17:45', k: 'exam', subj: 'cg', t: '컴퓨터구조 시험 (1~4장)', est: 1 },
            { s: '', e: '', k: 'due', subj: 'hn', t: '한이음 발표·데모 준비 마감 (연습·밀키트·예상질문)' }],
  '10-23': [{ s: '09:00', e: '11:45', k: 'exam', subj: 'db', t: 'DB 시험 (필답 · 1시간)', est: 1 },
            { s: '15:00', e: '16:00', k: 'exam', subj: 'we', t: '서양이코 시험 · 인사관 101호' }],
  '10-24': [{ s: '', e: '', k: 'due', subj: 'hn', t: '한이음 2차평가 (대면 · 코엑스)' }],
  '10-26': [{ s: '15:00', e: '16:15', k: 'exam', subj: 'dc', t: '디지털콘텐츠제작론 시험 → 끝! 🎉', est: 1 }],
};
const DAY_WARN = {
  '10-23': '⚠ 알바(12~16시)와 서양이코 시험(15~16시)이 겹쳐요. 알바 시간 조정을 미리 요청하세요!',
  '10-13': '📌 한이음 발표자료 PPT·대본은 오늘까지 완성이 목표예요.',
  '10-20': '⚠ 한이음 문서(개발보고서·제작설계서·깃허브)는 16:00 마감 — 컴구 수업(13:30) 전, 오전에 제출 끝내기',
};

// 공부 계획: [시작, 끝, 과목, 할 일, 여유(1이면 밀렸을 때 버려도 되는 블록)]
// 미루는 걸 전제로 짬: 마감 있는 일은 그날 첫 블록, 날마다 마지막은 여유/따라잡기, 토요일 오전은 통째로 따라잡기
const CATCH = '🧯 밀린 것 따라잡기 — 밀린 게 없으면 쉬기';
const PLAN = {
  '10-11': [['22:30','23:15','etc','오늘은 계획만 — 시험 범위·유형 공지 확인해서 과목 탭에 입력 + 자료 폴더 정리']],
  '10-12': [['13:00','14:30','cg','1장 — PPT 정독 + 과제 답 가리고 다시 풀기'],
            ['16:30','18:00','hn','발표자료 PPT 뼈대 잡기 + 대본 초안 (내일이 마감)'],
            ['19:00','20:00','jb','녹음본 전부 AI 전사·요약 돌려놓기 (복사-붙여넣기만, 읽는 건 수요일)']],
  '10-13': [['10:00','12:00','hn','발표자료 PPT·대본 완성 — 오전에 먼저 끝내기 (오늘이 자체 마감)'],
            ['15:00','16:30','cg','2장 — PPT 정독 + 과제 다시 풀기'],
            ['16:45','18:00','db','1~2주차 — DB vs DBMS, 스키마/인스턴스, 3단계 구조, 데이터 독립성, 데이터 모델'],
            ['19:00','20:30','hn','PPT·대본 마무리 — 오전에 못 끝낸 만큼만', 1]],
  '10-14': [['10:30','11:45','jb','오늘 수업 복습 + AI 요약본 읽고 노션에 구조화 (앞 절반)'],
            ['14:30','16:00','cg','3장 — PPT 정독 + 과제 다시 풀기'],
            ['16:15','17:45','hn','개발보고서·제작설계서 점검 — 고칠 곳 목록 만들고 수정'],
            ['19:00','20:00','we','1~4주차 요약 (AI 프롬프트로 주차별 핵심 주제 뽑기)'],
            ['20:15','21:00','etc',CATCH, 1]],
  '10-15': [['09:30','11:00','db','3주차 — 관계형 모델, 키(기본키·외래키), 무결성, 제약조건, CREATE TABLE'],
            ['19:00','20:30','cg','4장 — PPT 정독 + 과제 다시 풀기'],
            ['20:45','21:30','jb','요약본 구조화 (뒤 절반) — 나열형 항목 위주']],
  '10-16': [['19:00','20:00','db','6주차(오늘 수업분 = 시험범위 마지막) 당일 복습 — 미루지 않기'],
            ['20:15','21:15','etc',CATCH, 1]],
  '10-17': [['10:30','12:30','etc','🧯 주간 따라잡기 — 평일에 밀린 블록부터 전부. 없으면 컴구 과제 한 번 더'],
            ['13:30','15:30','db','4~5주차 SQL 손으로 쓰기 — INSERT·SELECT·WHERE·ORDER BY·UPDATE·DELETE, 함수·NULL·집계·GROUP BY'],
            ['15:45','17:45','hn','HW 데모 밀키트 만들기'],
            ['19:00','20:00','jb','3단계 — "보기 ㄱ~ㅅ 중 모두 고르기" 형식 AI 퀴즈 1회전 (+OX·단답)']],
  '10-18': [['10:30','12:00','cg','1~4장 과제형 퀴즈 전체 다시 풀기 (시간 재고)'],
            ['13:30','15:00','we','5~7주차 요약 + 서술형 예상문제 뽑고 답안 뼈대 쓰기'],
            ['15:15','16:15','hn','발표 연습 1회차(대본 소리 내어 읽기) + 심사위원 예상질문 뽑기'],
            ['16:30','17:30','dc','범위 확인 + 약어 표 만들기 (약어 – 풀네임 – 뜻)'],
            ['19:00','20:00','jb','3단계 — 모두 고르기 퀴즈 2회전 + 틀린 보기만 모은 오답노트'],
            ['20:15','21:15','etc',CATCH, 1]],
  '10-19': [['13:00','14:30','jb','오답 + 약한 주차 보강'],
            ['16:30','18:00','hn','개발보고서·제작설계서 최종 점검 + 깃허브 꾸미기 — 가능하면 오늘 제출까지'],
            ['19:00','20:30','db','강의자료 확인 문제 다시 풀기(4주차 부록 답안) + 1~3주차 개념 퀴즈'],
            ['20:45','21:30','cg','틀린 과제 문제만 다시', 1]],
  '10-20': [['10:00','11:00','hn','📮 개발보고서·제작설계서 제출 (16:00 마감 — 오전에 끝내기!)'],
            ['11:00','12:00','hn','깃허브 마무리 — 어제 못 한 만큼만', 1],
            ['15:00','17:00','jb','시험 전날 — 오답만 반복 (신규 내용 금지)'],
            ['17:15','18:00','hn','발표 연습 2회차 — 대본 안 보고 말해보기'],
            ['19:00','20:30','cg','과제형 퀴즈 2회전 + 1~4장 개념 백지복습'],
            ['20:45','21:15','jb','마지막 훑기 → 일찍 자기', 1]],
  '10-21': [['08:00','08:45','jb','오답 확인만 (새로운 것 보지 않기)', 1],
            ['10:30','11:30','hn','HW 데모 연습 — 밀키트로 처음부터 끝까지 2번 (정봉 시험 직후)'],
            ['14:30','17:00','cg','시험 전날 올인 — 과제형 퀴즈 + 지필 개념'],
            ['19:00','20:30','db','1~6주차 통합 — SQL 직접 쓰기 + 개념 서술 연습, 오답 정리'],
            ['20:45','21:15','cg','오답만 최종 확인', 1]],
  '10-22': [['08:45','09:15','hn','발표 대본 암기 최종 확인 + 예상질문 답변 한 번 읽기', 1],
            ['09:30','11:00','cg','최종 오답 확인 (신규 금지)'],
            ['19:00','21:00','db','시험 전날 — 오답 + 핵심 개념'],
            ['21:15','22:00','we','서술 답안 뼈대 키워드 암기']],
  '10-23': [['08:00','08:45','db','오답 확인만', 1],
            ['14:00','14:45','we','답안 뼈대 최종 확인 (알바 조정 필요)'],
            ['19:30','21:00','hn','최종 리허설 (발표 + HW 데모 + 예상질문) · 코엑스 이동 경로 확인']],
  '10-24': [['20:00','21:00','dc','가볍게 요약본·약어 표 훑기 — 피곤하면 쉬기', 1]],
  '10-25': [['10:30','12:30','dc','전범위 요약 + 핵심 용어 1~2문장으로 정의 쓰기'],
            ['13:30','15:30','dc','약어 풀이 암기 + 4지선다·OX 퀴즈 1회전'],
            ['15:45','17:15','dc','약한 부분 보강 (약어·짧은 서술 위주)', 1],
            ['19:00','20:30','dc','오답만 반복 → 일찍 자기']],
  '10-26': [['13:00','14:00','dc','약어 표 + 오답 확인만']],
};
const DATES = Object.keys(PLAN);

// 과목 정보
const INFO = {
  jb: { exam: '10/21(수) 09:00~', date: '10-21', range: '', type: '객관식 · OX · 단답형 혼합 (보기 4~10개 중 모두 고르기)',
        stages: [['1단계 전사', '10/12 · 녹음본 전부 AI 전사·요약 돌려놓기'],
                 ['2단계 구조화', '10/14~15 · 노션에 계층·넘버링 재구조화 (보기로 나올 나열 항목 위주)'],
                 ['3단계 퀴즈', '10/17~20 · "모두 고르기" 형식 퀴즈 2회전 + 틀린 보기만 반복']],
        tip: '"옳은 것을 모두 고르시오"는 보기 하나하나를 OX로 판단해야 해서 대충 알면 틀려요. 나열형 항목(종류·단계·특징)을 정확히 외우고, AI에게 보기 6~10개짜리 모두 고르기 문제로 내달라고 하세요.' },
  cg: { exam: '10/22(목) 16:30~', date: '10-22', range: '1~4장', type: '과제와 같은 방식의 퀴즈 + 지필',
        stages: [['1단계 과제 재풀이', '10/12~15 · 하루 1장씩, 과제를 답 가리고 손으로 다시 풀기'],
                 ['2단계 통합 연습', '10/18, 10/20 · 1~4장 과제형 퀴즈 전체 + 개념 백지복습'],
                 ['3단계 오답', '10/21~22 · 전날 올인 + 틀린 문제만 반복']],
        tip: '"과제와 같은 방식"이 힌트 — 과제 문제를 유형별로 풀이 과정까지 재현할 수 있으면 됩니다. 눈으로 읽지 말고 직접 쓰기.' },
  db: { exam: '10/23(금) 09:00~ (1시간)', date: '10-23', range: '1~6주차 (10/16 수업분까지)', type: '필답고사 · 세부 유형 미정',
        stages: [['1단계 개념', '10/13, 10/15 · 1~3주차 — DBMS·3단계 구조·데이터 독립성·키·무결성·제약조건'],
                 ['2단계 SQL', '10/16~17 · 6주차 당일 복습 + 4~5주차 SQL을 손으로 직접 쓰기'],
                 ['3단계 문제', '10/19~22 · 강의자료 확인 문제 + 통합 문제, 오답']],
        tip: '필답(손으로 쓰는 시험)이라 SQL을 보지 않고 직접 쓸 수 있어야 해요. 개념은 "Database ≠ DBMS", "Schema vs Instance", "NULL ≠ 0 ≠ 빈 문자열", "COUNT(*) vs COUNT(컬럼)"처럼 강의자료가 비교해 둔 것 위주로.',
        links: [['1주차 · 데이터베이스, 왜 필요할까?', 'https://gabby-beak-920.notion.site/1-3a7f998a4634810296e6f169ccdfad50'],
                ['2주차 · DB 시스템의 구조와 데이터 모델', 'https://gabby-beak-920.notion.site/2-3caf998a4634806baafafdc24f71fd20'],
                ['3주차 · 관계형 데이터 모델과 테이블 구조', 'https://gabby-beak-920.notion.site/3-3d3f998a463480a582e0e7837ed6d02b'],
                ['4주차 · SQL로 데이터를 다루는 첫걸음', 'https://gabby-beak-920.notion.site/4-SQL-3e6f998a463480c7b185ecdffb795373'],
                ['5주차 · 데이터를 가공하고 요약하기', 'https://gabby-beak-920.notion.site/5-3e7f998a463480cf8b42c3055fa1fec4']] },
  we: { exam: '10/23(금) 15:00~16:00', date: '10-23', range: '7주차까지', type: '서술형 · 인사관 101호',
        stages: [['1단계 요약', '10/14, 10/18 · 주차별 핵심 주제 1~2개씩 뽑기'],
                 ['2단계 답안 뼈대', '10/18 · 예상문제별 "주장–근거 3개–정리" 뼈대 쓰기'],
                 ['3단계 암기', '10/22~23 · 뼈대 키워드만 암기']],
        tip: '서술형은 전부 외우기보다 예상문제별 답안 뼈대를 만들어 키워드를 외우는 게 효율적. ⚠ 금요일 알바와 시간이 겹칩니다.' },
  dc: { exam: '10/26(월) 15:00~', date: '10-26', range: '', type: '약어 풀이 5~6 · 1~2문장 서술 · 4지선다 6~10 · OX 6~10',
        stages: [['준비', '10/18 · 범위 확인 + 약어 표(약어 – 풀네임 – 뜻) 만들기'],
                 ['집중', '10/25(일) · 요약·용어 정의 → 약어 암기·퀴즈 → 보강 → 오답 하루 올인'],
                 ['마무리', '10/26 · 시험 전 약어 표·오답 확인만']],
        tip: '매번 같은 유형이라 준비물이 정해져 있어요: ① 약어 표(풀네임까지 쓸 수 있게) ② 핵심 용어를 1~2문장으로 설명하는 연습 ③ 4지선다·OX 퀴즈. 마지막 시험이라 10/25에 몰아서 배치했어요.' },
  hn: { exam: '문서 10/20(화) 16:00 · 대면 10/24(토)', date: '10-24', range: '2차평가', type: '문서 제출 + 대면평가(발표 · HW 데모 · 질의응답, 코엑스)',
        stages: [['발표자료', '~10/13(화) · PPT·대본 완성'],
                 ['문서 제출', '~10/20(화) 16:00 · 개발보고서·제작설계서 최종 점검 및 제출, 깃허브 꾸미기'],
                 ['발표·데모 준비', '~10/22(목) · 대본 외우기, HW 데모 밀키트 만들기·연습, 심사위원 예상질문'],
                 ['평가', '10/23 저녁 최종 리허설 → 10/24(토) 코엑스']],
        tip: '10/22 마감인 발표·데모 준비가 시험 3일(10/21~23)과 겹쳐서, 밀키트(10/17)·발표 연습 1회차와 예상질문(10/18)을 주말로 당겨 놨어요. 시험 주간엔 짧은 연습 블록만 남깁니다.' },
};

const SEED_LISTS = [
  ['jb', ['시험 유형·범위 공지 확인', 'PPT·녹음본 전부 모으기', '요약본(노션) 완성', 'AI 퀴즈 2회전', '오답노트 정리']],
  ['cg', ['1~4장 과제 전부 모으기', '1장 과제 다시 풀기', '2장 과제 다시 풀기', '3장 과제 다시 풀기', '4장 과제 다시 풀기', '지필 대비 개념 백지복습']],
  ['db', ['시험 유형 공지 확인', '10/16 수업 필기 정리', '전범위 요약', '문제 풀이', '오답 정리']],
  ['we', ['금요일 알바 시간 조정 요청', '1~7주차 자료 확보', '주차별 예상문제 뽑기', '답안 뼈대 작성', '인사관 101호 위치 확인']],
  ['dc', ['시험 유형·범위 공지 확인', '자료 요약', 'AI 퀴즈', '오답 정리']],
  ['hn', ['발표자료 PPT·대본 완성 (10/13까지)', '개발보고서·제작설계서 최종 점검', '깃허브 꾸미기', '문서 제출 (10/20 16:00 전)', '발표 연습 — 대본 외우기 (10/22까지)', 'HW 데모 밀키트 만들기 (10/22까지)', 'HW 데모 연습 (10/22까지)', '심사위원 예상질문 준비 (10/22까지)', '대면평가 시간·장소 확인']],
  ['cert', ['컴활 필기 응시/결과 확인', '컴활 실기 접수', 'SQLD 접수 일정 확인', '10/27부터 자격증 공부 재개'], '자격증', '#7CC8C0'],
  ['etc', ['학생증·필기구 챙기기', '시험 전날 알람 2개 맞추기'], '시험 준비물', '#B5B1A9'],
];

// AI 프롬프트: [제목, 내용]. {과목}·{유형}은 자동으로 채워짐. 과목별 → 공통 순으로 표시
const PROMPTS = {
  jb: [['모두 고르기 모의문제', `아래는 {과목} 시험 범위 자료야. 실제 시험처럼 문제를 만들어줘.

[형식]
1) "다음 중 옳은 것을(또는 옳지 않은 것을) 모두 고르시오" 8문제
   - 보기는 ㄱ, ㄴ, ㄷ … 으로 문제마다 6~10개
   - 정답 개수는 문제마다 다르게 (1개뿐이거나 전부인 경우도 섞기)
   - 틀린 보기는 원문을 살짝 비틀어서: 용어 바꿔치기, 순서 뒤바꾸기, 주체 바꾸기, 범위 과장
2) OX 5문제
3) 단답형 5문제

[진행]
문제만 먼저 내고 답은 숨겨줘. 내가 답을 쓰면 채점하고, 보기 하나하나가 왜 맞고 틀린지 원문 근거와 함께 해설해줘.

[자료]
(여기에 붙여넣기)`]],
  cg: [['과제 변형 문제', `아래는 {과목} 과제 문제와 내 풀이야. 시험이 "과제와 같은 방식"으로 나와.

1) 각 문제와 같은 유형·난이도로 숫자와 조건만 바꾼 변형 문제를 2개씩 만들어줘.
2) 풀이는 숨기고 문제만 먼저 줘. 내가 풀면 단계별로 채점하고, 틀린 단계가 어디인지 짚어줘.
3) 마지막에 이 과제들이 묻는 핵심 개념을 한 줄씩 정리해줘.

[과제 문제와 풀이]
(여기에 붙여넣기)`],
       ['지필 개념 문제', `아래는 {과목} 1~4장 강의자료야. 지필시험 대비로
1) 개념을 2~3문장으로 설명하는 서술형 8문제
2) 헷갈리기 쉬운 개념 쌍을 비교하는 문제 4문제
를 내줘. 답은 숨기고, 내가 쓰면 빠진 핵심어를 기준으로 채점해줘.

[자료]
(여기에 붙여넣기)`]],
  db: [['필답 모의문제 (개념 + SQL)', `아래는 {과목} 1~6주차 강의자료야. 손으로 쓰는 필답고사(1시간)를 대비해 모의문제를 만들어줘.

1) 개념 비교 서술 6문제 — 예: Database vs DBMS, Schema vs Instance, 3단계 구조와 데이터 독립성, 기본키 vs 외래키, 무결성 제약조건, NULL vs 0 vs 빈 문자열, COUNT(*) vs COUNT(컬럼)
2) SQL 직접 쓰기 6문제 — 테이블 구조를 먼저 제시하고 INSERT / SELECT+WHERE+ORDER BY / UPDATE / DELETE / 함수 / GROUP BY 집계를 고르게
3) 틀린 SQL을 찾아 고치기 3문제
4) CREATE TABLE에 제약조건 넣기 1문제

답은 숨기고 문제만 먼저 줘. 내가 답을 쓰면 실제 채점하듯 감점 이유까지 알려줘.

[자료]
(여기에 붙여넣기)`]],
  we: [['서술형 예상문제 + 답안 뼈대', `아래는 {과목} 1~7주차 자료야. 시험은 서술형이야.

1) 주차별로 나올 만한 서술형 문제를 1~2개씩 뽑아줘.
2) 문제마다 답안 뼈대를 만들어줘: 핵심 주장 1문장 → 근거 3개 → 정리 1문장
3) 문제마다 답안에 꼭 들어가야 할 키워드 5개
4) 그다음 문제를 하나씩 내줘. 내가 답안을 쓰면 빠진 키워드와 논리 흐름을 기준으로 채점해줘.

[자료]
(여기에 붙여넣기)`]],
  dc: [['약어 표 뽑기', `아래 {과목} 자료에 나오는 약어를 하나도 빠짐없이 뽑아서 표로 만들어줘.
열: 약어 | 풀네임(영문) | 한 줄 뜻
그리고 암기 카드에 붙여넣을 수 있게 "약어 - 풀네임 (뜻)" 형식으로 한 줄에 하나씩도 따로 줘.

[자료]
(여기에 붙여넣기)`],
       ['교수님 유형 그대로 모의고사', `아래는 {과목} 시험 범위 자료야. 교수님 시험은 매번 이 구성이야. 그대로 모의고사 1회분을 만들어줘.

1) 약어 풀이 6문제 (예: "ISO는 무엇의 약어인가?")
2) "○○에 대해 1~2문장으로 설명하시오" 5문제
3) 4지선다 8문제
4) OX 8문제

답은 숨기고 문제만 먼저 줘. 내가 답하면 채점하고, 서술 문제는 모범답안을 1~2문장으로 보여줘.

[자료]
(여기에 붙여넣기)`]],
  hn: [['대면평가 예상 질문', `아래는 한이음 2차평가에 제출한 서류야. 평가위원 입장에서
1) 날카로운 예상 질문 10개 (기술 선택 이유, 진행률, 역할 분담, 차별점, 남은 일정의 위험 요소)
2) 질문마다 30초 분량의 답변 요지
3) 서류에서 근거가 약해 보이는 부분 3곳
을 알려줘.

[서류]
(여기에 붙여넣기)`]],
  common: [['녹음본 → 핵심 정리', `아래는 {과목} 강의 녹음을 받아쓴 글이야. 시험 유형은 "{유형}"이야.

1) 교수님이 강조하거나 반복한 내용, "시험", "중요", "꼭" 같은 말이 붙은 부분을 먼저 뽑아줘.
2) 전체를 주제별로 번호를 매긴 계층 구조로 정리해줘.
3) 종류·단계·특징처럼 나열되는 항목은 표로 만들어줘.
4) 받아쓰기 오류로 보이는 용어는 추정해서 고치고 (?) 표시해줘.

[받아쓴 글]
(여기에 붙여넣기)`],
           ['틀린 것만 다시', `방금 내가 틀리거나 헷갈린 문제의 개념만 모아서, 문제 형식과 보기를 바꿔 5문제를 다시 내줘. 이번에도 답은 숨기고, 내가 답하면 해설해줘.`]],
};

/* ══════════ 상태 저장 ══════════ */
const KEY = 'exam-planner-2026-2';
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
// v2: 한이음 체크리스트를 새 할 일로 교체 (직접 추가했거나 이미 체크한 항목은 남김)
if (!S.v || S.v < 2) {
  const old = ['서류 양식·제출 방법 확인', '초안 작성', '팀원 검토', '10/20 16:00 전 제출', '대면평가 시간·장소 확인', '발표·질의응답 리허설'], neu = ['발표자료 PPT·대본 완성 (10/13까지)', '개발보고서·제작설계서 최종 점검', '깃허브 꾸미기', '문서 제출 (10/20 16:00 전)', '발표 연습 — 대본 외우기 (10/22까지)', 'HW 데모 밀키트 만들기 (10/22까지)', 'HW 데모 연습 (10/22까지)', '심사위원 예상질문 준비 (10/22까지)', '대면평가 시간·장소 확인'];
  const l = S.lists.find(x => x.id === 'hn');
  if (l) {
    const keep = l.items.filter(i => i.done || !old.includes(i.t));
    l.items = [...neu.filter(t => !keep.some(i => i.t === t)).map(t => ({ id: uid(), t, done: false })), ...keep];
  }
  S.v = 2;
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
}
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
  if (!S.timer) return;
  const left = timerLeft(), el = document.getElementById('clock');
  if (el) el.textContent = clockStr(left);
  document.title = clockStr(left) + (S.timer.mode === 'focus' ? ' 🍅 집중' : ' ☕ 휴식');
  if (left > 0) return;
  const t = S.timer;
  if (t.mode === 'focus') { addSpent(t.id, t.len); S.pomo[todayKey()] = (S.pomo[todayKey()] || 0) + 1; }
  S.timer = null; lastDone = t.mode; document.title = '중간고사 플래너';
  save(); beep(); render();
}, 1000);

function allTasks() { return DATES.flatMap(k => tasksOf(k).map(t => Object.assign(t, { day: k }))); }
function progress(filter) {
  let tot = 0, dn = 0;
  allTasks().filter(filter || (() => true)).forEach(t => { tot += t.h; if (S.done[t.id]) dn += t.h; });
  return { tot, dn, pct: tot ? Math.round(dn / tot * 100) : 0 };
}

/* ══════════ 렌더: 하루 ══════════ */
function taskRow(t, showTime) {
  const sj = SUBJ[t.subj] || SUBJ.etc, d = !!S.done[t.id];
  return `<div class="row task${d ? ' done' : ''}${t.opt ? ' opt' : ''}" style="--c:${sj.c}">
    ${showTime ? `<div class="tm">${t.moved ? '이월' : (t.s || '') + '<br>' + (t.e || '')}</div>` : ''}
    <label class="body"><input type="checkbox" data-done="${t.id}"${d ? ' checked' : ''}>
      <span class="txt"><em>${sj.n}</em>${t.opt ? '<u>여유</u>' : ''}${esc(t.t)}${t.h ? `<small>${showTime || !t.s ? '' : t.s + ' · '}${fmtH(t.h)}${t.moved ? ' · ' + label(t.orig) + '에서 이월' : ''}</small>` : ''}</span></label>
    ${showTime && t.day && nextDay(t.day) && !d ? `<button class="x" data-move="${t.id}|${nextDay(t.day)}" title="다음 날로 미루기" aria-label="다음 날로 미루기">↪</button>` : ''}
    <button class="x" data-${t.custom ? 'delc' : 'hide'}="${t.id}" aria-label="삭제">×</button></div>`;
}
function fixedOf(k) {
  const ev = EVENTS[k] || [], exams = ev.filter(e => e.k === 'exam').map(e => e.subj);
  const cls = (WD[toDate(k).getDay()] || []).filter(f => !exams.includes(f[2]))
    .map(f => ({ s: f[0], e: f[1], type: f[2] === 'alba' ? 'alba' : 'class', subj: f[2], t: f[3] }));
  return { ev, cls };
}
function timeline(k) {
  const { ev, cls } = fixedOf(k);
  const rows = [
    ...cls.map(c => ({ s: c.s, html: `<div class="row" style="--c:${c.type === 'alba' ? ALBA_C : SUBJ[c.subj].c}"><div class="tm">${c.s}<br>${c.e}</div><div class="body">${c.type === 'alba' ? '💼 알바' : '🏫 ' + c.t + ' 수업'}</div></div>` })),
    ...MEAL[toDate(k).getDay()].map(m => ({ s: m[0], html: `<div class="row meal"><div class="tm">${m[0]}<br>${m[1]}</div><div class="body">${m[2]}</div></div>` })),
    ...ev.map(e => ({ s: e.s || '00:00', html: `<div class="row ${e.k}" style="--c:${SUBJ[e.subj].c}"><div class="tm">${e.s}<br>${e.e}</div><div class="body">${e.k === 'exam' ? '📝 ' : '📌 '}${e.t}${e.est ? '<small>수업시간 기준</small>' : ''}</div></div>` })),
    ...tasksOf(k).map(t => ({ s: t.s || '99:99', html: taskRow(t, true) })),
  ].sort((a, b) => a.s < b.s ? -1 : a.s > b.s ? 1 : 0);
  const custom = (S.custom[k] || []).map(c => taskRow({ id: c.id, subj: c.subj, t: c.t, custom: 1 }, true)).join('');
  return rows.map(r => r.html).join('') + custom;
}
function dayBadges(k) {
  const tk = todayKey(), ev = EVENTS[k] || [];
  return (k === tk ? '<span class="badge t">오늘</span>' : '') +
    (ev.some(e => e.k === 'exam') ? '<span class="badge e">시험</span>' : '') +
    (ev.some(e => e.subj === 'hn') ? '<span class="badge h">한이음</span>' : '');
}

function renderToday() {
  const k = viewDay, i = DATES.indexOf(k), tk = todayKey();
  const marks = [['10-20', 'hn', '한이음 서류'], ['10-21', 'jb', '정봉'], ['10-22', 'cg', '컴구'], ['10-23', 'db', 'DB'],
                 ['10-23', 'we', '서양이코'], ['10-24', 'hn', '한이음 평가'], ['10-26', 'dc', '디콘제']];
  const h = tasksOf(k).reduce((a, t) => a + t.h, 0);
  return `<div class="dstrip">${marks.map(([d, s, n]) =>
      `<div class="dcard${d < tk ? ' past' : ''}" style="--c:${SUBJ[s].c}"><b>${dday(d)}</b><span>${n}</span><small>${label(d)}</small></div>`).join('')}</div>
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
    <div class="sect">⚡ 일주일 생존 전략</div>
    <div class="card tip">
      🍅 뽀모도로 25분 집중 + 5분 휴식 · 4세트마다 20분 쉬기<br>
      📵 폰은 서랍에, 노트북은 공부 탭만 · 기숙사에서 안 되면 바로 도서관<br>
      🎯 완벽주의 금지 — 60% 이해하면 다음으로<br>
      🧯 밀려도 괜찮게 짰어요: 점선 <b>여유</b> 블록은 밀리면 버려도 되고, 실선 블록만 지키면 시험은 볼 수 있어요. 밀린 건 다음 따라잡기 칸(수·금 저녁, 토 오전, 일 저녁)에서 처리<br>
      🌙 시험 전날은 신규 내용 금지, 오답만 보고 일찍 자기
    </div>`;
}

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
        ${cls.map(c => c.type === 'alba' ? `<div class="pill cls alba">${c.s}~${c.e} 💼 알바</div>` : `<div class="pill cls" style="--c:${SUBJ[c.subj].c}">${c.s}~${c.e} 🏫 ${SUBJ[c.subj].n} 수업</div>`).join('')}
        ${tasksOf(k).map(pill).join('')}
        ${(S.custom[k] || []).map(c => pill({ id: c.id, subj: c.subj, t: c.t })).join('')}
      </div>`;
    }).join('')}</div></div>`
  : `<div class="week">${days.map(k => {
      const { ev, cls } = fixedOf(k), ts = tasksOf(k), h = ts.reduce((a, t) => a + t.h, 0);
      return `<div class="day${k === tk ? ' today' : ''}${ev.some(e => e.k === 'exam') ? ' examday' : ''}${k < tk ? ' past' : ''}">
        <h3 data-day="${k}" data-go="today">${label(k)} ${dayBadges(k)}<span class="hrs">${h ? '순공 ' + fmtH(h) : ''} ›</span></h3>
        <div class="chips">${ev.map(e => `<span class="chip ${e.k}" style="--c:${SUBJ[e.subj].c}">${e.k === 'exam' ? '📝' : '📌'} ${e.s} ${e.t}</span>`).join('')}
          ${cls.map(c => `<span class="chip cls" style="--c:${c.type === 'alba' ? ALBA_C : SUBJ[c.subj].c}">${c.s} ${c.type === 'alba' ? '💼 알바' : '🏫 ' + SUBJ[c.subj].n}</span>`).join('')}</div>
        ${ts.map(t => taskRow(t, false)).join('')}
        ${(S.custom[k] || []).map(c => taskRow({ id: c.id, subj: c.subj, t: c.t, custom: 1 }, false)).join('')}
      </div>`;
    }).join('')}</div>`;
  return tabs + body + `<div class="card tip" style="margin-top:10px">🍅 이 주 순공 목표: ${days.map(k => DOW[toDate(k).getDay()] + ' ' + fmtH(tasksOf(k).reduce((x, t) => x + t.h, 0))).join(' + ')} → 총 약 <b>${fmtH(total)}</b><br>칸을 누르면 완료 체크, 날짜를 누르면 시간대별 일정으로 이동해요.</div>`;
}

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
        <div class="dt">${f.exam} <span class="tag-exam">${id === 'hn' ? '평가' : '시험'} ${dday(f.date)}</span></div>
        <div class="tp">${infoShow(id, 'type')} · 범위: ${infoShow(id, 'range')}<br>${f.stages.map(s => s[0]).join(' → ')}</div>
        <div class="bar-label"><span>진행도</span><span>${p.pct}% · ${fmtH(p.dn)} / ${fmtH(p.tot)}</span></div>
        <div class="bar"><i style="width:${p.pct}%"></i></div></button>`;
    }).join('')}</div>
    <div class="warn" style="margin-top:12px">${DAY_WARN['10-23']}</div>
    <div class="sect">⚡ 일주일 생존 전략</div>
    <div class="card tip">
      🍅 뽀모도로 25분 집중 + 5분 휴식 · 4세트마다 20분 쉬기<br>
      📵 폰은 서랍에, 노트북은 공부 탭만 · 기숙사에서 안 되면 바로 도서관<br>
      🎯 하루 목표는 작게 쪼개기 · 완벽주의 금지 — 60% 이해하면 다음으로<br>
      🔑 시험 순서대로: 정봉 → 컴구 → DB·서양이코 → (한이음) → 디콘제 · 전날은 신규 없이 오답만
    </div>`;
  const id = viewSubj, f = INFO[id], sj = SUBJ[id], p = progress(t => t.subj === id), ts = allTasks().filter(t => t.subj === id);
  return tabs + `<div style="--c:${sj.c}">
    <div class="metacards">
      <div class="card"><small>${id === 'hn' ? '일정' : '시험일'}</small><b>${f.exam} <span class="tag-exam">${dday(f.date)}</span></b></div>
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

/* ══════════ 렌더: 체크리스트 ══════════ */
function renderCheck() {
  return `<div style="height:14px"></div><div class="lists">${S.lists.map(l => {
      const dn = l.items.filter(i => i.done).length;
      return `<div class="card list" style="--c:${(SUBJ[l.id] || {}).c || LIST_C[l.id] || l.color}">
        <h3>${esc(l.name)}<small>${dn}/${l.items.length}</small><button class="x" data-dellist="${l.id}" aria-label="카테고리 삭제">×</button></h3>
        <div class="bar" style="margin-bottom:4px"><i style="width:${l.items.length ? dn / l.items.length * 100 : 0}%"></i></div>
        ${l.items.map(i => `<div class="item${i.done ? ' done' : ''}"><label><input type="checkbox" data-item="${l.id}|${i.id}"${i.done ? ' checked' : ''}><span>${esc(i.t)}</span></label>
          <button class="x" data-delitem="${l.id}|${i.id}" aria-label="삭제">×</button></div>`).join('')}
        <form class="addrow" data-additem="${l.id}"><input name="t" placeholder="항목 추가" aria-label="항목 추가" required><button class="btn">＋</button></form>
      </div>`;
    }).join('')}</div>
    <div class="sect">카테고리 추가</div>
    <form class="card" data-addlist>
      <div class="addrow" style="margin-top:0"><input name="name" placeholder="새 카테고리 이름" aria-label="새 카테고리 이름" required><button class="btn pri">만들기</button></div>
      <div class="colors" style="margin-top:10px">${PALETTE.map((c, i) => `<input type="radio" name="color" id="col${i}" value="${c}"${i ? '' : ' checked'}><label for="col${i}" style="--c:${c}"><span class="sr">색 ${i + 1}</span></label>`).join('')}</div>
    </form>`;
}

/* ══════════ 렌더: 기타 ══════════ */
function renderMore() {
  const certs = [['pilgi', '컴활 필기', '목표: 9월 말~10월 초 응시'], ['silgi', '컴활 실기', '목표: SQLD 시험일 전에 응시'], ['sqld', 'SQLD', '목표: 10월부터 공부 시작']];
  return `<div class="sect">🗓 고정 시간표</div>
    ${timetable()}
    <div class="sect">📜 자격증 (시험기간 7~8·14~16주차엔 쉬어감)</div>
    <div class="card">
      ${certs.map(([id, n, g]) => `<div class="certrow"><b>${n}<br><small style="font-weight:400;color:var(--mute)">${g}</small></b>
        <input type="date" class="field" data-cert="${id}" value="${S.certs[id] || ''}" aria-label="${n} 시험일">
        <span class="badge h">${S.certs[id] ? ddayFull(S.certs[id]) : '시험일 입력'}</span></div>`).join('')}
      <div class="tip" style="margin-top:8px">⏸ 10/13~10/26(7~8주차)은 자격증 공부 쉬기 → <b>10/27(화)부터 재개</b>. 시험일을 입력하면 D-day가 표시돼요.</div>
    </div>
    <div class="sect">💾 백업 · 기기 간 옮기기</div>
    <div class="card">
      <div class="tip">체크·메모·암기 카드는 <b>이 기기의 브라우저</b>에만 저장돼요. 다른 기기로 옮기면 그쪽 내용을 <b>덮어써요</b> (합쳐지지 않음).<br>이 기기 마지막 변경: <b>${fmtTime(S.savedAt)}</b></div>
      <div class="bk"><b>① 링크로 보내기</b><small>배포한 주소에서만 가능. 링크를 카톡 "나에게 보내기" 등으로 보내고 다른 기기에서 열면 끝.</small>
        <div class="addrow"><button class="btn pri" data-act="link">링크 만들기</button></div></div>
      <div class="bk"><b>② 파일로 옮기기</b><small>파일을 저장해 두면 백업도 돼요.</small>
        <div class="addrow"><button class="btn" data-act="filesave">파일로 저장</button><button class="btn" data-act="fileload">파일에서 불러오기</button>
          <input type="file" id="bkfile" accept=".json,application/json" class="sr" aria-label="백업 파일 선택"></div></div>
      <div class="bk"><b>③ 코드 복사·붙여넣기</b>
        <textarea class="field" id="backup" placeholder="여기에 백업 코드를 붙여넣기" aria-label="백업 코드"></textarea>
        <div class="addrow"><button class="btn" data-act="export">코드 복사</button><button class="btn" data-act="import">코드 불러오기</button></div></div>
      <div class="addrow"><button class="btn" data-act="reset" style="margin-left:auto;color:var(--exam)">전부 초기화</button></div>
    </div>`;
}
function timetable() {
  const H0 = 9, H1 = 18, PX = 54, wd = new Date().getDay();
  const per = (a, b) => { const i = P_START.indexOf(a), j = P_END.indexOf(b); return i < 0 || j < 0 ? '' : (i === j ? i + 1 : (i + 1) + '~' + (j + 1)) + '교시 · '; };
  return `<div class="ttwrap">
    <div class="tth"></div>${[1, 2, 3, 4, 5].map(d => `<div class="tth${d === wd ? ' on' : ''}">${DOW[d]}</div>`).join('')}
    <div class="tthr" style="height:${(H1 - H0) * PX}px">${P_START.map((t, i) => `<span style="top:${(mins(t) - H0 * 60) / 60 * PX}px"><b>${i + 1}교시</b>${+t.slice(0, 2)}:${t.slice(3)}</span>`).join('')}</div>
    ${[1, 2, 3, 4, 5].map(d => `<div class="ttcol">${WD[d].map(f => {
      const alba = f[2] === 'alba';
      return `<div class="ttb" style="--c:${alba ? ALBA_C : SUBJ[f[2]].c};top:${(mins(f[0]) - H0 * 60) / 60 * PX}px;height:${hrs(f[0], f[1]) * PX}px">
        <b>${f[3]}</b><small>${per(f[0], f[1])}${f[0]}~${f[1]}</small></div>`;
    }).join('')}</div>`).join('')}
  </div>
  <div class="tip" style="margin-top:6px;color:var(--mute)">학교 주차는 화요일 시작(1주차 9/1~9/7) · 지금은 ${DATES.includes(todayKey()) ? weekNo(todayKey()) + '주차' : '-'}</div>`;
}
function ddayFull(iso) {
  const [y, m, d] = iso.split('-').map(Number), n = new Date();
  const diff = Math.round((new Date(y, m - 1, d) - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5);
  return diff === 0 ? 'D-DAY' : diff > 0 ? 'D-' + diff : 'D+' + -diff;
}

/* ══════════ 렌더 루프 · 이벤트 ══════════ */
const VIEWS = { today: renderToday, cal: renderCal, subj: renderSubj, check: renderCheck, more: renderMore };
function render() {
  if (!VIEWS[S.tab]) S.tab = 'today';
  const gw = document.querySelector('.gridwrap'), keep = gw ? gw.scrollLeft : null;
  document.getElementById('view').innerHTML = VIEWS[S.tab]();
  const ngw = document.querySelector('.gridwrap');
  if (ngw) { const t = ngw.querySelector('.today'); ngw.scrollLeft = keep != null ? keep : t ? t.offsetLeft - ngw.offsetLeft - 16 : 0; }
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === S.tab));
  const n = new Date(), p = progress();
  document.getElementById('now').textContent = `${n.getMonth() + 1}/${n.getDate()}(${DOW[n.getDay()]}) · 디콘제까지 ${dday('10-26')}`;
  document.getElementById('allpct').textContent = `${p.pct}% (${fmtH(p.dn)} / ${fmtH(p.tot)})`;
  document.getElementById('allbar').style.width = p.pct + '%';
}
const findItem = v => { const [l, i] = v.split('|'), list = S.lists.find(x => x.id === l); return { list, i }; };

document.addEventListener('click', e => {
  const t = e.target.closest('button, [data-day], [data-subj]'); if (!t) return;
  const d = t.dataset;
  if (d.tab) { S.tab = d.tab; window.scrollTo(0, 0); }
  else if (d.day) { viewDay = d.day; if (d.go) { S.tab = d.go; window.scrollTo(0, 0); } }
  else if (d.week) viewWeek = d.week;
  else if (d.mode) S.calMode = d.mode;
  else if (d.subj) { viewSubj = d.subj; study = null; window.scrollTo(0, 0); }
  else if (d.move) { const [id, day] = d.move.split('|'); S.moved[id] = day; }
  else if (d.moveall) overdue().forEach(t => { S.moved[t.id] = todayKey(); });
  else if (d.dropopt) overdue().filter(t => t.opt).forEach(t => { S.hidden[t.id] = 1; });
  else if (d.timer) {
    const [mode, id] = d.timer.split('|');
    if (mode === 'stop') { const t = S.timer; if (t && t.mode === 'focus') addSpent(t.id, Math.round((t.len * 60 - timerLeft()) / 60)); S.timer = null; lastDone = null; document.title = '중간고사 플래너'; }
    else { const len = mode === 'focus' ? 25 : 5; S.timer = { mode, id: id || null, len, end: Date.now() + len * 60000 }; lastDone = null; }
  }
  else if (d.copy) {
    const [id, i] = d.copy.split('|'), text = promptsOf(id)[+i][1];
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => { t.textContent = '복사됨 ✓'; setTimeout(() => { t.textContent = '복사'; }, 1500); },
      () => { t.parentNode.querySelector('details').open = true; alert('자동 복사가 안 돼요. 펼쳐진 내용을 직접 복사하세요.'); });
    return;
  }
  else if (d.card) {
    const [act, arg] = d.card.split('|'), cs = S.cards[viewSubj] || [];
    if (act === 'start') { const ids = cs.filter(c => arg === 'all' || c.ok === false).map(c => c.id).sort(() => Math.random() - 0.5); study = { subj: viewSubj, ids, i: 0, show: false }; }
    else if (act === 'flip') study.show = !study.show;
    else if (act === 'exit') study = null;
    else { const c = cs.find(x => x.id === study.ids[study.i]); if (c) c.ok = act === 'ok'; study.i++; study.show = false; }
  }
  else if (d.delcard) { const [id, cid] = d.delcard.split('|'); S.cards[id] = (S.cards[id] || []).filter(c => c.id !== cid); }
  else if (d.hide) { if (!confirm('이 계획을 삭제할까요?')) return; S.hidden[d.hide] = 1; }
  else if (d.delc) { for (const k in S.custom) S.custom[k] = S.custom[k].filter(c => c.id !== d.delc); delete S.done[d.delc]; }
  else if (d.delitem) { const { list, i } = findItem(d.delitem); list.items = list.items.filter(x => x.id !== i); }
  else if (d.dellist) { if (!confirm('이 카테고리를 통째로 삭제할까요?')) return; S.lists = S.lists.filter(l => l.id !== d.dellist); }
  else if (d.act === 'export') {
    const box = document.getElementById('backup'); box.value = JSON.stringify(S); box.select();
    (navigator.clipboard ? navigator.clipboard.writeText(box.value) : Promise.reject()).then(() => alert('복사했어요!'), () => alert('아래 코드를 직접 복사하세요.'));
    return;
  }
  else if (d.act === 'import') { if (!importData(document.getElementById('backup').value, '붙여넣은')) return; }
  else if (d.act === 'filesave') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' }));
    a.download = '플래너-백업-' + todayKey() + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return;
  }
  else if (d.act === 'fileload') { document.getElementById('bkfile').click(); return; }
  else if (d.act === 'link') {
    if (location.protocol === 'file:') { alert('지금은 PC 안의 파일을 직접 연 상태라 링크를 다른 기기에서 열 수 없어요.\n배포한 주소(vercel.app)에서 열고 눌러주세요. 그 전에는 ② 파일이나 ③ 코드를 쓰세요.'); return; }
    const url = location.origin + location.pathname + '#data=' + b64.enc(JSON.stringify(S));
    if (navigator.share) navigator.share({ title: '플래너 데이터', url }).catch(() => {});
    else (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => alert('링크를 복사했어요. 다른 기기로 보내서 열면 됩니다.'), () => prompt('이 링크를 복사하세요', url));
    return;
  }
  else if (d.act === 'reset') { if (!confirm('체크·메모·체크리스트를 모두 처음 상태로 되돌릴까요?')) return; S = seed(); S.tab = 'more'; }
  else return;
  save(); render();
});
document.addEventListener('change', e => {
  if (e.target.id === 'bkfile') {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { if (importData(r.result, '파일의')) { save(); render(); } };
    r.readAsText(f); e.target.value = '';
    return;
  }
  const d = e.target.dataset;
  if (d.done) { if (e.target.checked) S.done[d.done] = 1; else delete S.done[d.done]; }
  else if (d.item) { const { list, i } = findItem(d.item); list.items.find(x => x.id === i).done = e.target.checked; }
  else if (d.cert) S.certs[d.cert] = e.target.value;
  else if (d.info) { const [id, k] = d.info.split('|'); (S.info[id] = S.info[id] || {})[k] = e.target.value.trim(); }
  else return;
  save(); render();
});
document.addEventListener('input', e => {
  if (e.target.dataset.note) { S.notes[e.target.dataset.note] = e.target.value; save(); }
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, d = f.dataset, v = n => f.elements[n].value.trim();
  if (d.addtask) (S.custom[d.addtask] = S.custom[d.addtask] || []).push({ id: 'c' + uid(), subj: v('subj'), t: v('t') });
  else if (d.additem) S.lists.find(l => l.id === d.additem).items.push({ id: uid(), t: v('t'), done: false });
  else if ('addlist' in d) S.lists.push({ id: uid(), name: v('name'), color: v('color'), items: [] });
  else if (d.addcard) (S.cards[d.addcard] = S.cards[d.addcard] || []).push({ id: uid(), q: v('q'), a: v('a') });
  else if (d.bulkcard) {
    // 한 줄에 한 장: 탭, |, " - ", ": " 중 처음 나오는 구분자로 앞면/뒷면을 나눔
    const list = S.cards[d.bulkcard] = S.cards[d.bulkcard] || [];
    const bad = v('bulk').split('\n').map(l => l.trim()).filter(Boolean).filter(l => {
      const m = l.match(/^(.+?)(?:\t+|\s*\|\s*|\s+[-–—=]\s+|\s*:\s+)(.+)$/);
      if (m) list.push({ id: uid(), q: m[1].trim(), a: m[2].trim() });
      return !m;
    });
    if (bad.length) alert('구분자(" - ")를 못 찾아서 건너뛴 줄 ' + bad.length + '개:\n' + bad.slice(0, 5).join('\n'));
  }
  save(); render();
});
render();
