/* 기타 탭: 고정 시간표 · 자격증 · 백업 */
/* ══════════ 렌더: 기타 ══════════ */
function renderMore() {
  return `<div class="sect">🗓 고정 시간표</div>
    ${timetable()}
    ${CERTS ? `<div class="sect">📜 ${CERTS.title}</div>
    <div class="card">
      ${CERTS.items.map(([id, n, g]) => `<div class="certrow"><b>${n}<br><small style="font-weight:400;color:var(--mute)">${g}</small></b>
        <input type="date" class="field" data-cert="${id}" value="${S.certs[id] || ''}" aria-label="${n} 시험일">
        <span class="badge h">${S.certs[id] ? ddayFull(S.certs[id]) : '시험일 입력'}</span></div>`).join('')}
      <div class="tip" style="margin-top:8px">${CERTS.note}</div>
    </div>` : ''}
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
