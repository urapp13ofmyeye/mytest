/* 기타 탭: 고정 시간표 · 자격증 · 백업 */
/* ══════════ 렌더: 기타 ══════════ */
function renderMore() {
  return `<div class="sect">내 일정</div>
    <div class="card"><div class="tip">과목, 시간표, 시험, 공부 계획을 여기서 입력하고 고쳐요.</div>
      <div class="addrow"><button class="btn pri" data-tab="setup">내 일정 설정</button></div></div>
    <div class="sect">고정 시간표</div>
    ${timetable()}
    ${CERTS ? `<div class="sect">${CERTS.title}</div>
    <div class="card">
      ${CERTS.items.map(([id, n, g]) => `<div class="certrow"><b>${n}<br><small style="font-weight:400;color:var(--mute)">${g}</small></b>
        <input type="date" class="field" data-cert="${id}" value="${S.certs[id] || ''}" aria-label="${n} 시험일">
        <span class="badge h">${S.certs[id] ? ddayFull(S.certs[id]) : '시험일 입력'}</span></div>`).join('')}
      <div class="tip" style="margin-top:8px">${CERTS.note}</div>
    </div>` : ''}
    <div class="sect">계정</div>
    <div class="card">
      <div class="acct"><b>${user ? esc(user.email) : ''}</b><span id="syncmore">${SYNC_TEXT[syncState]}</span></div>
      <div class="tip">내용은 계정에 자동으로 저장돼요. 다른 기기에서도 같은 이메일로 로그인하면 이어서 볼 수 있어요.</div>
      <div class="addrow"><button class="btn" data-act="logout">로그아웃</button></div>
    </div>
    <div class="sect">파일 백업</div>
    <div class="card">
      <div class="tip">혹시 모를 때를 위해 파일로 따로 보관할 수 있어요. 불러오면 지금 내용을 덮어써요.<br>마지막 변경: ${fmtTime(S.savedAt)}</div>
      <div class="addrow"><button class="btn" data-act="filesave">파일로 저장</button><button class="btn" data-act="fileload">파일에서 불러오기</button>
        <input type="file" id="bkfile" accept=".json,application/json" class="sr" aria-label="백업 파일 선택"></div>
      <div class="addrow"><button class="btn danger" data-act="reset">체크·메모 초기화</button></div>
    </div>`;
}
function timetable() {
  const times = [...P_START, ...P_END, ...Object.values(WD).flat().flatMap(f => [f[0], f[1]])].map(mins);
  const H0 = Math.floor(Math.min(...times) / 60), H1 = Math.ceil(Math.max(...times) / 60), PX = 54, wd = new Date().getDay();
  const per = (a, b) => { const i = P_START.indexOf(a), j = P_END.indexOf(b); return i < 0 || j < 0 ? '' : (i === j ? i + 1 : (i + 1) + '~' + (j + 1)) + '교시 · '; };
  return `<div class="ttwrap">
    <div class="tth"></div>${[1, 2, 3, 4, 5].map(d => `<div class="tth${d === wd ? ' on' : ''}">${DOW[d]}</div>`).join('')}
    <div class="tthr" style="height:${(H1 - H0) * PX}px">${P_START.map((t, i) => `<span style="top:${(mins(t) - H0 * 60) / 60 * PX}px"><b>${i + 1}교시</b>${+t.slice(0, 2)}:${t.slice(3)}</span>`).join('')}</div>
    ${[1, 2, 3, 4, 5].map(d => `<div class="ttcol">${WD[d].map(f => {
      const alba = !SUBJ[f[2]];
      return `<div class="ttb" style="--c:${alba ? OTHER_C : SUBJ[f[2]].c};top:${(mins(f[0]) - H0 * 60) / 60 * PX}px;height:${hrs(f[0], f[1]) * PX}px">
        <b>${f[3]}</b><small>${per(f[0], f[1])}${f[0]}~${f[1]}</small></div>`;
    }).join('')}</div>`).join('')}
  </div>
  <div class="tip" style="margin-top:6px;color:var(--mute)">학교 주차는 ${DOW[SEM_START.getDay()]}요일 시작(1주차 ${SEM_START.getMonth() + 1}/${SEM_START.getDate()}~) · 지금은 ${DATES.includes(todayKey()) ? weekNo(todayKey()) + '주차' : '-'}</div>`;
}
function ddayFull(iso) {
  const [y, m, d] = iso.split('-').map(Number), n = new Date();
  const diff = Math.round((new Date(y, m - 1, d) - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5);
  return diff === 0 ? 'D-DAY' : diff > 0 ? 'D-' + diff : 'D+' + -diff;
}
