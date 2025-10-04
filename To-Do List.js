document.addEventListener('DOMContentLoaded', () => {
    // simple auth guard: redirect to login page if not logged in
    try {
        const ok = localStorage.getItem('todo_logged_in') === '1'
        if (!ok) {
            window.location.href = 'login.html'
            return
        }
    } catch (e) {}
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('task-list');

    const allCountEl = document.getElementById('allCount');
    const completedCountEl = document.getElementById('completedCount');
    const pendingCountEl = document.getElementById('pendingCount');
    const statBoxes = document.querySelectorAll('.stat-box');

    let tasks = []; // {id, text, completed, due}
    let filter = 'all';

    function save() {
        localStorage.setItem('todo_tasks_v1', JSON.stringify(tasks));
    }

    function load() {
        try {
            const raw = localStorage.getItem('todo_tasks_v1');
            if (!raw) return;
            tasks = JSON.parse(raw);
        } catch (e) {
            tasks = [];
        }
    }

    function render() {
        // clear
        taskList.innerHTML = '';

        const visible = tasks.filter(t => {
            if (filter === 'all') return true;
            if (filter === 'completed') return t.completed;
            if (filter === 'pending') return !t.completed;
        });

        visible.forEach(t => {
            const li = document.createElement('li');
                li.className = 'task-item';
                li.dataset.id = t.id;

                // mark overdue if due date is set and in the past and not completed
                if (t.due && !t.completed) {
                    const now = new Date();
                    const dueDate = new Date(t.due);
                    // compare dates without time
                    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                    const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
                    if (dueDay < nowDay) {
                        li.classList.add('overdue');
                    }
                }

            // checkbox circle
            const cb = document.createElement('span');
            cb.className = 'task-checkbox' + (t.completed ? ' checked' : '');
            cb.setAttribute('role', 'checkbox');
            cb.setAttribute('aria-checked', t.completed ? 'true' : 'false');
            cb.tabIndex = 0;

            // text
            const text = document.createElement('span');
            text.className = 'task-text';
            text.textContent = t.text;

            // edit button
            const edit = document.createElement('button');
            edit.type = 'button';
            edit.className = 'edit-btn';
            edit.textContent = 'Edit';

            // delete
            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'delete-btn';
            del.textContent = 'Delete';

            li.appendChild(cb);
            li.appendChild(text);

            // due badge
            if (t.due) {
                const badge = document.createElement('span');
                badge.className = 'due-badge';
                const d = new Date(t.due);
                badge.textContent = d.toLocaleDateString();
                li.appendChild(badge);
            }

            li.appendChild(edit);
            li.appendChild(del);

            taskList.appendChild(li);

            // events
            cb.addEventListener('click', () => toggleComplete(t.id));
            cb.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleComplete(t.id); } });
            edit.addEventListener('click', () => startEdit(t.id));
            del.addEventListener('click', () => deleteTask(t.id));
        });

        updateCounts();
        updateActiveStat();
    }

    function updateCounts() {
        const all = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = all - completed;
        allCountEl.textContent = all;
        completedCountEl.textContent = completed;
        pendingCountEl.textContent = pending;
    }

    function updateActiveStat() {
        statBoxes.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
    }

    function addTask(text) {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
        const dueInput = document.getElementById('due-date');
        const dueVal = dueInput ? dueInput.value : '';
        tasks.push({ id, text, completed: false, due: dueVal || null });
        save();
        render();
    }

    function toggleComplete(id) {
        const t = tasks.find(x => x.id === id);
        if (!t) return;
        t.completed = !t.completed;
        save();
        render();
    }

    function deleteTask(id) {
        tasks = tasks.filter(x => x.id !== id);
        save();
        render();
    }

    function startEdit(id) {
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) return;
        const task = tasks[index];

        // find the li in the DOM
        const li = taskList.querySelector('[data-id="' + id + '"]');
        if (!li) return;

        // replace content with input + save/cancel
        li.innerHTML = '';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.text;
    input.style.flex = '1';

    // due date input for editing
    const dueEdit = document.createElement('input');
    dueEdit.type = 'date';
    dueEdit.value = task.due || '';
    dueEdit.style.marginLeft = '8px';

        function finishEdit() {
            const val = input.value.trim();
            if (val.length === 0) {
                if (confirm('Empty — delete task?')) {
                    deleteTask(id);
                } else {
                    render();
                }
            } else {
                tasks[index].text = val;
                save();
                render();
            }
        }

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') finishEdit();
            if (e.key === 'Escape') render();
        });

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'save-btn';
    saveBtn.addEventListener('click', finishEdit);

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'cancel-btn';
    cancelBtn.addEventListener('click', render);

    li.appendChild(input);
    li.appendChild(dueEdit);
        li.appendChild(saveBtn);
        li.appendChild(cancelBtn);

        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }

    // wire up add controls
    addTaskBtn.addEventListener('click', () => {
        const v = taskInput.value.trim();
        const dueInput = document.getElementById('due-date');
        const dueVal = dueInput ? dueInput.value : '';
        if (!v) return;
        if (!dueVal) {
            // require due date
            if (dueInput) {
                dueInput.focus();
            }
            alert('Please select a due date before adding a task.');
            return;
        }
        addTask(v);
        taskInput.value = '';
        if (dueInput) dueInput.value = '';
    });
    taskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTaskBtn.click(); });

    // stat box filters
    statBoxes.forEach(b => {
        b.addEventListener('click', () => {
            filter = b.dataset.filter;
            render();
        });
    });

    // initial load
    load();
    render();

    // logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            try { localStorage.removeItem('todo_logged_in'); } catch (e) {}
            window.location.href = 'login.html';
        });
    }
});
