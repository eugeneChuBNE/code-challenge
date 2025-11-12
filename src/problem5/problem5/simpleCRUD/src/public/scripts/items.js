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

/** Simple JSON fetch helpers (no external Http wrapper needed) */
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
                                  Run
******************************************************************************/

displayItems();

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
}

/** Load items from API and render */
function displayItems() {
  jget(`${API_BASE}?limit=100&offset=0&sort=createdAt&order=desc`)
    .then((resp) => renderItems(resp.items))
    .catch((err) => {
      console.error(err);
      alert('Failed to load items');
    });
}

/** Add a new item from the left form */
function addItem() {
  const nameInput = document.getElementById('name-input');
  const descInput = document.getElementById('desc-input') || document.getElementById('email-input'); // fallback if not renamed

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
      displayItems();
    })
    .catch((err) => {
      console.error(err);
      alert('Failed to create item');
    });
}

/** Show edit view for a card */
function showEditView(itemEle) {
  const normal = itemEle.getElementsByClassName('normal-view')[0];
  const edit = itemEle.getElementsByClassName('edit-view')[0];
  normal.style.display = 'none';
  edit.style.display = 'block';
}

/** Cancel edit for a card */
function cancelEdit(itemEle) {
  const normal = itemEle.getElementsByClassName('normal-view')[0];
  const edit = itemEle.getElementsByClassName('edit-view')[0];
  normal.style.display = 'block';
  edit.style.display = 'none';
}

/** Submit edit (PATCH name/description) */
function submitEdit(ele) {
  const itemEle = ele.parentNode.parentNode;
  const nameInput = itemEle.getElementsByClassName('name-edit-input')[0];
  const descInput =
    itemEle.getElementsByClassName('desc-edit-input')[0] ||
    itemEle.getElementsByClassName('email-edit-input')[0]; // fallback

  const id = Number(ele.getAttribute('data-item-id'));
  const body = {};
  if (nameInput && nameInput.value.trim() !== '') body.name = nameInput.value.trim();
  if (descInput) body.description = descInput.value;

  if (Object.keys(body).length === 0) {
    // nothing to update
    cancelEdit(itemEle);
    return;
  }

  jpatch(`${API_BASE}/${id}`, body)
    .then(() => displayItems())
    .catch((err) => {
      console.error(err);
      alert('Failed to update item');
    });
}

/** Delete an item */
function deleteItem(ele) {
  const id = Number(ele.getAttribute('data-item-id'));
  if (!confirm('Delete this item?')) return;

  jdel(`${API_BASE}/${id}`)
    .then(() => displayItems())
    .catch((err) => {
      console.error(err);
      alert('Failed to delete item');
    });
}

/** Global click handlers (reuse template’s structure) */
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
    }
  },
  false
);
