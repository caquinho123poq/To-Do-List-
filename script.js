// ---------------------- DOM Elements ----------------------
const modal = document.getElementById("task-modal");
const addTaskBtn = document.getElementById("add-task-btn");
const closeModalBtn = document.getElementById("close-modal");
const addTaskBtnModal = document.getElementById("add-task-btn-modal");
const cancelBtn = document.getElementById("cancel-btn");
const taskInput = document.getElementById("task-input");
const taskDescription = document.getElementById("task-description");
const projectSelect = document.getElementById("project-select");
const prioritySelect = document.getElementById("priority-select");
const dueDateInput = document.getElementById("due-date-input");
const inputError = document.getElementById("input-error");
const rightPanel = document.getElementById("right-panel");

// ---------------------- IndexedDB Setup ----------------------
let db;
const request = indexedDB.open("TasksDB", 1);

request.onerror = (event) => {
    console.error("DB error:", event.target.errorCode);
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadTasksFromDB();
};

request.onupgradeneeded = (event) => {
    db = event.target.result;
    const store = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
};

// ---------------------- Load Tasks ----------------------
let tasks = [];

function loadTasksFromDB() {
    const transaction = db.transaction(["tasks"], "readonly");
    const store = transaction.objectStore("tasks");
    const request = store.getAll();

    request.onsuccess = (e) => {
        tasks = e.target.result;
        renderTasks();
    };
}

// ---------------------- Save / Update / Delete in DB ----------------------
function saveTaskToDB(task) {
    const transaction = db.transaction(["tasks"], "readwrite");
    const store = transaction.objectStore("tasks");
    store.put(task);
}

function deleteTaskFromDB(taskId) {
    const transaction = db.transaction(["tasks"], "readwrite");
    const store = transaction.objectStore("tasks");
    store.delete(taskId);
}

// ---------------------- Modal Management ----------------------
function openModal() {
    modal.style.display = "block";
    taskInput.focus();
}

function closeModal() {
    modal.style.display = "none";
    resetForm();
}

function resetForm() {
    taskInput.value = "";
    taskDescription.value = "";
    projectSelect.value = "";
    prioritySelect.value = "medium";
    dueDateInput.value = "";
    inputError.textContent = "";

    // Reset modal to add mode
    const modalTitle = modal.querySelector("h2");
    modalTitle.textContent = "Add New Task";
    addTaskBtnModal.textContent = "Add task";
    addTaskBtnModal.onclick = addTaskHandler;
}

// ---------------------- Event Listeners ----------------------
addTaskBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

// Close modal when clicking outside
window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// ---------------------- Add Task ----------------------
function addTaskHandler() {
    const text = taskInput.value.trim();
    const description = taskDescription.value.trim();
    const project = projectSelect.value;
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;

    if (!text) {
        inputError.textContent = "Please enter a task name";
        return;
    }

    let section = project === "team" ? "team" : "my-projects";

    const newTask = {
        text,
        description,
        project,
        priority,
        completed: false,
        time: "",
        section,
        dueDate
    };

    // Add to DB
    saveTaskToDB(newTask);

    // Update local array and render
    loadTasksFromDB();
    closeModal();
}

addTaskBtnModal.addEventListener("click", addTaskHandler);

// ---------------------- Render Tasks ----------------------
function renderTasks() {
    const myProjectsTasks = document.getElementById("my-projects-tasks");
    const teamTasks = document.getElementById("team-tasks");

    myProjectsTasks.innerHTML = "";
    teamTasks.innerHTML = "";

    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        if (task.section === "my-projects") {
            myProjectsTasks.appendChild(taskElement);
        } else if (task.section === "team") {
            teamTasks.appendChild(taskElement);
        }
    });
}

function createTaskElement(task) {
    const taskDiv = document.createElement("div");
    taskDiv.className = `task-item priority-${task.priority}`;
    taskDiv.dataset.taskId = task.id;

    const timeHtml = task.time ? `<span class="task-time">⏰ ${task.time}</span>` : "";
    const calendarHtml = task.calendar ? `<span class="task-calendar">📅 Calendar</span>` : "";

    taskDiv.innerHTML = `
        <div class="task-checkbox">
            <input type="checkbox" id="task-${task.id}" ${task.completed ? "checked" : ""} onchange="toggleTask(${task.id})">
            <label for="task-${task.id}"></label>
        </div>
        <div class="task-content" onclick="showTaskDetails(${task.id})">
            <span class="task-text ${task.completed ? "completed" : ""}">${task.text}</span>
            ${task.time || task.calendar ? `
                <div class="task-meta">
                    ${timeHtml}
                    ${calendarHtml}
                </div>
            ` : ""}
        </div>
    `;

    return taskDiv;
}


// ---------------------- Task Actions ----------------------
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTaskToDB(task);
        renderTasks();
        updateTaskDetails(taskId);
    }
}

function showTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const panelContent = rightPanel.querySelector(".panel-content");
    panelContent.innerHTML = `
        <div class="inbox-card">
            <h3>Task Details</h3>
            <div class="task-detail">
                <span class="task-title">${task.text}</span>
                <div class="task-tags">
                    ${task.project ? `<span class="tag website">📁 ${capitalizeFirst(task.project)}</span>` : ""}
                    <span class="priority-tag">🏷️ ${capitalizeFirst(task.priority)} Priority</span>
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ""}
                ${task.time ? `<div class="task-due">⏰ ${task.time}</div>` : ""}
                ${task.dueDate ? `<div class="task-due">📅 ${formatDate(task.dueDate)}</div>` : ""}
                <div class="task-actions">
                    <button onclick="editTask(${task.id})" class="btn-secondary">Edit</button>
                    <button onclick="deleteTask(${task.id})" class="btn-secondary">Delete</button>
                </div>
            </div>
        </div>
    `;
}

function updateTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskTitleElement = rightPanel.querySelector(".task-title");
    if (taskTitleElement) {
        taskTitleElement.style.textDecoration = task.completed ? "line-through" : "none";
        taskTitleElement.style.opacity = task.completed ? "0.6" : "1";
    }
}

function deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
        deleteTaskFromDB(taskId);
        loadTasksFromDB();

        const panelContent = rightPanel.querySelector(".panel-content");
        panelContent.innerHTML = `
            <div class="inbox-card">
                <h3>Inbox</h3>
                <div class="task-detail">
                    <span class="task-title">Select a task to view details</span>
                    <div class="task-description">
                        Choose any task from the list to see more information here.
                    </div>
                </div>
            </div>
        `;
    }
}

// ---------------------- Edit Task ----------------------
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    taskInput.value = task.text;
    taskDescription.value = task.description || "";
    projectSelect.value = task.project || "";
    prioritySelect.value = task.priority;
    dueDateInput.value = task.dueDate || "";

    const modalTitle = modal.querySelector("h2");
    modalTitle.textContent = "Edit Task";
    addTaskBtnModal.textContent = "Update Task";

    addTaskBtnModal.onclick = () => updateTask(taskId);
    openModal();
}

function updateTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const text = taskInput.value.trim();
    if (!text) {
        inputError.textContent = "Please enter a task name";
        return;
    }

    task.text = text;
    task.description = taskDescription.value.trim();
    task.project = projectSelect.value;
    task.priority = prioritySelect.value;
    task.dueDate = dueDateInput.value;
    task.section = task.project === "team" ? "team" : "my-projects";

    saveTaskToDB(task);
    loadTasksFromDB();
    showTaskDetails(taskId);
    closeModal();
}

// ---------------------- Utility ----------------------
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
    });
}

// ---------------------- Navigation & Mobile Menu ----------------------
document.addEventListener("click", (e) => {
    if (e.target.closest(".nav-item")) {
        document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
        e.target.closest(".nav-item").classList.add("active");
    }
});

document.addEventListener("click", (e) => {
    if (e.target.closest(".project-item")) {
        console.log("Project clicked:", e.target.closest(".project-item").querySelector(".project-name").textContent);
    }
});

function toggleMobileMenu() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("open");
}

document.addEventListener("DOMContentLoaded", () => {

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false });
    document.querySelector(".panel-time").textContent = timeStr;
});


const sidebar = document.querySelector('.sidebar');
const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);

const toggleBtn = document.getElementById('sidebar-toggle');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
});
