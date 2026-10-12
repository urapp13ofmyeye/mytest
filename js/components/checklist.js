/* 체크리스트 탭 */
/* ══════════ 렌더: 체크리스트 ══════════ */
function renderCheck() {
  return `<div style="height:14px"></div><div class="lists">${S.lists.map(l => {
      const dn = l.items.filter(i => i.done).length;
      return `<div class="card list" style="--c:${(SUBJ[l.id] || {}).c || LIST_C[l.id] || l.color}">
        ${editing === 'list:' + l.id
          ? `<form class="addrow" style="margin:0 0 8px" data-editlist="${l.id}"><input name="t" value="${esc(l.name)}" aria-label="카테고리 이름" data-editfocus required><button class="btn pri">저장</button><button type="button" class="btn" data-canceledit="1">취소</button></form>`
          : `<h3>${esc(l.name)}<small>${dn}/${l.items.length}</small><button class="x" data-edit="list:${l.id}" title="이름 수정" aria-label="카테고리 이름 수정">✎</button><button class="x" data-dellist="${l.id}" aria-label="카테고리 삭제">×</button></h3>`}
        <div class="bar" style="margin-bottom:4px"><i style="width:${l.items.length ? dn / l.items.length * 100 : 0}%"></i></div>
        ${l.items.map(i => editing === 'item:' + l.id + '|' + i.id
          ? `<form class="addrow" style="margin:4px 0" data-edititem="${l.id}|${i.id}"><input name="t" value="${esc(i.t)}" aria-label="항목" data-editfocus required><button class="btn pri">저장</button><button type="button" class="btn" data-canceledit="1">취소</button></form>`
          : `<div class="item${i.done ? ' done' : ''}"><label><input type="checkbox" data-item="${l.id}|${i.id}"${i.done ? ' checked' : ''}><span>${esc(i.t)}</span></label>
          <button class="x" data-edit="item:${l.id}|${i.id}" title="수정" aria-label="수정">✎</button><button class="x" data-delitem="${l.id}|${i.id}" aria-label="삭제">×</button></div>`).join('')}
        <form class="addrow" data-additem="${l.id}"><input name="t" placeholder="항목 추가" aria-label="항목 추가" required><button class="btn">＋</button></form>
      </div>`;
    }).join('')}</div>
    <div class="sect">카테고리 추가</div>
    <form class="card" data-addlist>
      <div class="addrow" style="margin-top:0"><input name="name" placeholder="새 카테고리 이름" aria-label="새 카테고리 이름" required><button class="btn pri">만들기</button></div>
      <div class="colors" style="margin-top:10px">${PALETTE.map((c, i) => `<input type="radio" name="color" id="col${i}" value="${c}"${i ? '' : ' checked'}><label for="col${i}" style="--c:${c}"><span class="sr">색 ${i + 1}</span></label>`).join('')}</div>
    </form>`;
}
