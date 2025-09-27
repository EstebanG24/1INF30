const STORAGE_KEY = 'softinv-warehouses';

const state = {
    warehouses: [],
    filtered: [],
    editingId: null,
};

const elements = {
    form: document.getElementById('warehouse-form'),
    idInput: document.getElementById('warehouse-id'),
    nameInput: document.getElementById('warehouse-name'),
    centralInput: document.getElementById('warehouse-central'),
    cancelButton: document.getElementById('cancel-edit'),
    list: document.getElementById('warehouse-list'),
    emptyState: document.getElementById('empty-state'),
    formTitle: document.getElementById('form-title'),
    searchInput: document.getElementById('search'),
    rowTemplate: document.getElementById('warehouse-row-template'),
};

function loadWarehouses() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        state.warehouses = [
            { id: 1, name: 'Almacén Central', isCentral: true },
            { id: 2, name: 'Depósito Sur', isCentral: false },
            { id: 3, name: 'Hub Norte', isCentral: false },
        ];
        saveWarehouses();
    } else {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                state.warehouses = parsed;
            }
        } catch (error) {
            console.error('No se pudo leer la información guardada', error);
            state.warehouses = [];
        }
    }
    state.filtered = [...state.warehouses];
}

function saveWarehouses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.warehouses));
}

function resetForm() {
    state.editingId = null;
    elements.idInput.value = '';
    elements.nameInput.value = '';
    elements.centralInput.checked = false;
    elements.formTitle.textContent = 'Registrar almacén';
    elements.cancelButton.classList.add('hidden');
}

function handleFormSubmit(event) {
    event.preventDefault();

    const name = elements.nameInput.value.trim();
    const isCentral = elements.centralInput.checked;

    if (name.length === 0) {
        alert('El nombre del almacén es obligatorio.');
        return;
    }

    if (state.editingId) {
        const index = state.warehouses.findIndex((item) => item.id === state.editingId);
        if (index >= 0) {
            state.warehouses[index].name = name;
            state.warehouses[index].isCentral = isCentral;
        }
    } else {
        const newWarehouse = {
            id: generateId(),
            name,
            isCentral,
        };
        state.warehouses.push(newWarehouse);
    }

    saveWarehouses();
    applyFilter();
    resetForm();
}

function generateId() {
    if (state.warehouses.length === 0) {
        return 1;
    }
    const ids = state.warehouses.map((item) => item.id);
    return Math.max(...ids) + 1;
}

function startEdit(id) {
    const warehouse = state.warehouses.find((item) => item.id === id);
    if (!warehouse) return;

    state.editingId = id;
    elements.idInput.value = id;
    elements.nameInput.value = warehouse.name;
    elements.centralInput.checked = warehouse.isCentral;
    elements.formTitle.textContent = 'Editar almacén';
    elements.cancelButton.classList.remove('hidden');
    elements.nameInput.focus();
}

function deleteWarehouse(id) {
    const warehouse = state.warehouses.find((item) => item.id === id);
    if (!warehouse) return;

    const confirmation = confirm(`¿Eliminar "${warehouse.name}"?`);
    if (!confirmation) return;

    state.warehouses = state.warehouses.filter((item) => item.id !== id);
    saveWarehouses();
    applyFilter();
    if (state.editingId === id) {
        resetForm();
    }
}

function applyFilter() {
    const term = elements.searchInput.value.trim().toLowerCase();
    if (term.length === 0) {
        state.filtered = [...state.warehouses];
    } else {
        state.filtered = state.warehouses.filter((item) => item.name.toLowerCase().includes(term));
    }
    renderList();
}

function renderList() {
    elements.list.innerHTML = '';
    if (state.filtered.length === 0) {
        elements.emptyState.classList.remove('hidden');
        return;
    }

    elements.emptyState.classList.add('hidden');
    const fragment = document.createDocumentFragment();
    state.filtered.forEach((warehouse) => {
        const row = elements.rowTemplate.content.firstElementChild.cloneNode(true);
        row.querySelector('[data-cell="id"]').textContent = warehouse.id;
        row.querySelector('[data-cell="name"]').textContent = warehouse.name;
        row.querySelector('[data-cell="type"]').textContent = warehouse.isCentral ? 'Central' : 'Satélite';
        row.querySelector('[data-action="edit"]').addEventListener('click', () => startEdit(warehouse.id));
        row.querySelector('[data-action="delete"]').addEventListener('click', () => deleteWarehouse(warehouse.id));
        fragment.appendChild(row);
    });

    elements.list.appendChild(fragment);
}

function setupListeners() {
    elements.form.addEventListener('submit', handleFormSubmit);
    elements.cancelButton.addEventListener('click', resetForm);
    elements.searchInput.addEventListener('input', applyFilter);
}

function init() {
    loadWarehouses();
    setupListeners();
    renderList();
}

document.addEventListener('DOMContentLoaded', init);
