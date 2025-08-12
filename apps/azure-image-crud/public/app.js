const listEl = document.getElementById("images-list");
const form = document.getElementById("image-form");
const idInput = document.getElementById("image-id");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");
const imageInput = document.getElementById("image");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const fileField = document.getElementById("file-field");

let editingId = null;

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || res.statusText);
  }
  return res.json();
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024; i++;
  }
  return `${n.toFixed(1)} ${units[i]}`;
}

function render(items) {
  listEl.innerHTML = "";
  if (!items.length) {
    listEl.innerHTML = "<p>No images yet. Upload one above!</p>";
    return;
  }

  for (const it of items) {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = it.url;
    img.alt = it.title;
    img.loading = "lazy";
    card.appendChild(img);

    const h3 = document.createElement("h3");
    h3.textContent = it.title;
    card.appendChild(h3);

    const p = document.createElement("p");
    p.textContent = it.description || "";
    card.appendChild(p);

    const meta = document.createElement("div");
    meta.className = "meta";
    const left = document.createElement("span");
    left.textContent = new Date(it.createdAt).toLocaleString();
    const right = document.createElement("span");
    right.textContent = [it.contentType || "", formatSize(it.size || 0)].filter(Boolean).join(" • ");
    meta.appendChild(left);
    meta.appendChild(right);
    card.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => startEdit(it);
    actions.appendChild(editBtn);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "danger";
    delBtn.onclick = () => remove(it.id);
    actions.appendChild(delBtn);

    card.appendChild(actions);

    listEl.appendChild(card);
  }
}

async function load() {
  const items = await fetchJSON("/api/images");
  render(items);
}

function resetForm() {
  editingId = null;
  idInput.value = "";
  titleInput.value = "";
  descInput.value = "";
  imageInput.value = "";
  fileField.style.display = "";
  formTitle.textContent = "Upload Image";
  submitBtn.textContent = "Create";
  cancelEditBtn.style.display = "none";
}

function startEdit(item) {
  editingId = item.id;
  idInput.value = item.id;
  titleInput.value = item.title;
  descInput.value = item.description || "";
  imageInput.value = "";
  fileField.style.display = ""; // keep visible so user can replace image
  formTitle.textContent = "Edit Image";
  submitBtn.textContent = "Update";
  cancelEditBtn.style.display = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

cancelEditBtn.onclick = resetForm;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const fd = new FormData();
    fd.set("title", titleInput.value.trim());
    fd.set("description", descInput.value.trim());
    if (imageInput.files[0]) {
      fd.set("image", imageInput.files[0]);
    }

    if (!editingId) {
      await fetchJSON("/api/images", { method: "POST", body: fd });
      resetForm();
    } else {
      await fetchJSON(`/api/images/${editingId}`, { method: "PUT", body: fd });
      resetForm();
    }

    await load();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

async function remove(id) {
  if (!confirm("Delete this image?")) return;
  try {
    await fetchJSON(`/api/images/${id}`, { method: "DELETE" });
    await load();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

load().catch((e) => console.error(e));