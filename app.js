const STORAGE_KEY = "notes-app-items";

const form = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const notesList = document.querySelector("#notes-list");
const emptyState = document.querySelector("#empty-state");
const statusMessage = document.querySelector("#status-message");
const submitButton = document.querySelector("#submit-button");
const clearAllButton = document.querySelector("#clear-all-button");
const noteTemplate = document.querySelector("#note-template");

let notes = loadNotes();
let editingNoteId = null;

renderNotes();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const content = noteInput.value.trim();
  if (!content) {
    showStatus("La nota no puede estar vacia.");
    return;
  }

  if (editingNoteId) {
    notes = notes.map((note) =>
      note.id === editingNoteId
        ? { ...note, content, updatedAt: new Date().toISOString() }
        : note
    );
    showStatus("Nota actualizada.");
  } else {
    notes.unshift({
      id: typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()),
      content,
      createdAt: new Date().toISOString(),
    });
    showStatus("Nota guardada.");
  }

  persistNotes();
  resetForm();
  renderNotes();
});

clearAllButton.addEventListener("click", () => {
  if (!notes.length) {
    showStatus("No hay notas para borrar.");
    return;
  }

  const confirmed = window.confirm("Seguro que quieres borrar todas las notas?");
  if (!confirmed) {
    return;
  }

  notes = [];
  persistNotes();
  resetForm();
  renderNotes();
  showStatus("Todas las notas se han borrado.");
});

function renderNotes() {
  notesList.innerHTML = "";
  emptyState.hidden = notes.length > 0;
  clearAllButton.hidden = notes.length === 0;

  notes.forEach((note) => {
    const item = noteTemplate.content.firstElementChild.cloneNode(true);
    item.querySelector(".note-content").textContent = note.content;
    item.querySelector(".note-date").textContent = buildDateLabel(note);

    item.querySelector(".edit-button").addEventListener("click", () => {
      editingNoteId = note.id;
      noteInput.value = note.content;
      submitButton.textContent = "Actualizar nota";
      noteInput.focus();
      showStatus("Editando nota.");
    });

    item.querySelector(".delete-button").addEventListener("click", () => {
      notes = notes.filter((entry) => entry.id !== note.id);
      persistNotes();

      if (editingNoteId === note.id) {
        resetForm();
      }

      renderNotes();
      showStatus("Nota eliminada.");
    });

    notesList.appendChild(item);
  });
}

function resetForm() {
  editingNoteId = null;
  form.reset();
  submitButton.textContent = "Guardar nota";
}

function persistNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function loadNotes() {
  try {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    return savedNotes ? JSON.parse(savedNotes) : [];
  } catch {
    return [];
  }
}

function showStatus(message) {
  statusMessage.textContent = message;
}

function buildDateLabel(note) {
  const date = note.updatedAt ?? note.createdAt;
  const label = note.updatedAt ? "Actualizada" : "Creada";

  return `${label} el ${new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date))}`;
}
document.getElementById("buscar").addEventListener("input", function() {
  const texto = this.value.toLowerCase();
  const notas = document.querySelectorAll(".nota");

  notas.forEach(nota => {
    if (nota.textContent.toLowerCase().includes(texto)) {
      nota.style.display = "block";
    } else {
      nota.style.display = "none";
    }
  });
});
