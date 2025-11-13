// @ts-nocheck

/******************************************************************************
                                Helpers
******************************************************************************/

const API_BASE = '/api/items';

const DateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const formatDate = (iso) => (iso ? DateFormatter.format(new Date(iso)) : '');

/** Simple JSON fetch helpers */
async function jget(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function jpost(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function jpatch(url, body) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function jdel(url) {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}

/******************************************************************************
                        State (filters + pagination)
******************************************************************************/

const state = {
  search: '',
  sort: 'createdAt',
  order: 'desc',
  limit: 10,
  offset: 0,
  total: 0,
};

function buildQuery() {
  const p = new URLSearchParams({
    search: state.search || '',
    sort: state.sort,
    order: state.order,
    limit: String(state.limit),
    offset: String(state.offset),
  });
  return `${API_BASE}?${p.toString()}`;
}

/******************************************************************************
                                  Run
******************************************************************************/

refresh().catch((err) => {
  console.error(err);
  alert('Failed to load items');
});

/******************************************************************************
                              Functions
******************************************************************************/

/** Render list using Handlebars template */
function renderItems(items) {
  const tplEle = document.getElementById('all-items-template');
  const tplHtml = tplEle.innerHTML;
  const template = Handlebars.compile(tplHtml);
  const anchor = document.getElementById('all-items-anchor');

  anchor.innerHTML = template({
    items: (items || []).map((it) => ({
      ...it,
      createdFormatted: formatDate(it.createdAt),
    })),
  });

  // Update total count
  const totalEl = document.getElementById('total-count');
  if (totalEl) totalEl.textContent = String(state.total);

  // pagination
  const currentPage =
    state.total > 0 ? Math.floor(state.offset / state.limit) + 1 : 1;
  const totalPages =
    state.total > 0 ? Math.ceil(state.total / state.limit) : 1;

  const pageEl = document.getElementById('page-index');
  if (pageEl) pageEl.textContent = String(currentPage);

  const totalPageEl = document.getElementById('page-total');
  if (totalPageEl) totalPageEl.textContent = String(totalPages);

  // Enable/disable pagination buttons
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  if (prevBtn) prevBtn.disabled = state.offset <= 0;
  if (nextBtn) nextBtn.disabled = state.offset + state.limit >= state.total;
}

/** Load items from API and render with current filters/pagination */
async function refresh() {
  const sortSel = document.getElementById('sort-select');
  const orderSel = document.getElementById('order-select');
  const limitSel = document.getElementById('limit-select');
  const searchInp = document.getElementById('search-input');

  if (sortSel && !sortSel.value) sortSel.value = state.sort;
  if (orderSel && !orderSel.value) orderSel.value = state.order;
  if (limitSel && !limitSel.value) limitSel.value = String(state.limit);

  const data = await jget(buildQuery());
  state.total = Number(data.total || 0);
  renderItems(data.items || []);
}

/** Add new item */
function addItem() {
  const nameInput = document.getElementById('name-input');
  const descInput =
    document.getElementById('desc-input') ||
    document.getElementById('email-input');

  const name = (nameInput?.value || '').trim();
  const description = (descInput?.value || '').trim();

  if (!name) {
    alert('Name is required');
    return;
  }

  jpost(API_BASE, { name, description })
    .then(() => {
      if (nameInput) nameInput.value = '';
      if (descInput) descInput.value = '';
      state.offset = 0;
      return refresh();
    })
    .catch((err) => {
      console.error(err);
      alert('Failed to create item');
    });
}

/** Edit view switch */
function showEditView(itemEle) {
  const normal = itemEle.getElementsByClassName('normal-view')[0];
  const edit = itemEle.getElementsByClassName('edit-view')[0];
  normal.style.display = 'none';
  edit.style.display = 'block';
}

function cancelEdit(itemEle) {
  const normal = itemEle.getElementsByClassName('normal-view')[0];
  const edit = itemEle.getElementsByClassName('edit-view')[0];
  normal.style.display = 'block';
  edit.style.display = 'none';
}

/** Submit edit */
function submitEdit(ele) {
  const itemEle = ele.parentNode.parentNode;
  const nameInput = itemEle.getElementsByClassName('name-edit-input')[0];
  const descInput =
    itemEle.getElementsByClassName('desc-edit-input')[0] ||
    itemEle.getElementsByClassName('email-edit-input')[0];

  const id = Number(ele.getAttribute('data-item-id'));
  const body = {};
  if (nameInput && nameInput.value.trim() !== '') body.name = nameInput.value.trim();
  if (descInput !== undefined) body.description = descInput.value;

  if (Object.keys(body).length === 0) {
    cancelEdit(itemEle);
    return;
  }

  jpatch(`${API_BASE}/${id}`, body)
    .then(() => refresh())
    .catch((err) => {
      console.error(err);
      alert('Failed to update item');
    });
}

/** Delete item */
function deleteItem(ele) {
  const id = Number(ele.getAttribute('data-item-id'));
  if (!confirm('Delete this item?')) return;

  jdel(`${API_BASE}/${id}`)
    .then(() => {
      const lastPageStart = Math.max(
        0,
        state.total - 1 - ((state.total - 1) % state.limit)
      );
      if (state.offset > lastPageStart) state.offset = lastPageStart;
      return refresh();
    })
    .catch((err) => {
      console.error(err);
      alert('Failed to delete item');
    });
}

/******************************************************************************
                    Filters + Pagination (UI Wiring)
******************************************************************************/

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

document.addEventListener(
  'click',
  (event) => {
    const ele = event.target;

    if (ele.matches('#add-item-btn')) {
      event.preventDefault();
      addItem();

    } else if (ele.matches('.edit-item-btn')) {
      event.preventDefault();
      showEditView(ele.parentNode.parentNode);

    } else if (ele.matches('.cancel-edit-btn')) {
      event.preventDefault();
      cancelEdit(ele.parentNode.parentNode);

    } else if (ele.matches('.submit-edit-btn')) {
      event.preventDefault();
      submitEdit(ele);

    } else if (ele.matches('.delete-item-btn')) {
      event.preventDefault();
      deleteItem(ele);

    } else if (ele.matches('#prev-page')) {
      event.preventDefault();
      state.offset = Math.max(0, state.offset - state.limit);
      refresh().catch(console.error);

    } else if (ele.matches('#next-page')) {
      event.preventDefault();
      if (state.offset + state.limit < state.total) {
        state.offset += state.limit;
        refresh().catch(console.error);
      }

    } else if (ele.matches('#apply-filters')) {
      event.preventDefault();
      const searchEl = document.getElementById('search-input');
      const sortEl = document.getElementById('sort-select');
      const orderEl = document.getElementById('order-select');
      const limitEl = document.getElementById('limit-select');

      if (searchEl) state.search = searchEl.value.trim();
      if (sortEl) state.sort = sortEl.value;
      if (orderEl) state.order = orderEl.value;
      if (limitEl) state.limit = Number(limitEl.value);

      state.offset = 0;
      refresh().catch(console.error);
    }
  },
  false
);

// Live search debounce
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener(
    'input',
    debounce(() => {
      state.search = searchInput.value.trim();
      state.offset = 0;
      refresh().catch(console.error);
    }, 300)
  );
}
