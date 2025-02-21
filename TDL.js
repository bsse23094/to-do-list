document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    loadTheme();
});

const taskContainer = document.getElementById("taskContainer");
const addTaskButton = document.getElementById("addTaskButton");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    displayTask("active");
}

function addTask() {
    const taskName = document.getElementById("taskInput");
    const taskPriority = document.getElementById("priorityInput");
    const taskStartDate = document.getElementById("startDateTime");
    const taskDueDate = document.getElementById("endDateTime");

    if (!taskName.value || !taskPriority.value || !taskStartDate.value || !taskDueDate.value) {
        alert("Enter all the values first");
        return;
    }

    const now = new Date();
    const startDate = new Date(taskStartDate.value);
    const dueDate = new Date(taskDueDate.value);

    const newTask = {
        id: Date.now(),
        name: taskName.value.trim(),
        priority: parseInt(taskPriority.value),
        startDate: startDate,
        dueDate: dueDate,
        completed: false,
    };

    tasks.push(newTask);
    saveTasks();
    document.getElementById("taskForm").reset();
    bootstrap.Modal.getInstance(document.getElementById("taskModal")).hide();

    // Automatically decide where to display it
    displayTask(startDate > now ? "pending" : "active");
}

function displayTask(filter = "active") {
    taskContainer.innerHTML = "";
    const now = new Date();

    let sortedTasks = tasks.filter(task => {
        return (
            (filter === "active" && now >= new Date(task.startDate) && now < new Date(task.dueDate) && !task.completed) ||
            (filter === "pending" && now < new Date(task.startDate)) ||
            (filter === "completed" && task.completed)
        );
    });

    sortedTasks.sort((a, b) => a.priority - b.priority);

    sortedTasks.forEach(task => {
        const taskCard = document.createElement("div");
        taskCard.className = "task_card mb-3";
        
        let buttonText = task.completed ? "Undo" : "Complete";
        
        taskCard.innerHTML = `
            <h5>${task.name}</h5>
            <p>Priority: ${task.priority}</p>
            <p>Start: ${new Date(task.startDate).toLocaleString()}</p>
            <p>End: ${new Date(task.dueDate).toLocaleString()}</p>
            <button class="btn btn-success" onclick="toggleCompleteTask(${task.id})">${buttonText}</button>
            <button class="btn btn-danger" onclick="deleteTask(${task.id})">Delete</button>
        `;

        taskContainer.appendChild(taskCard);
    });
}

window.toggleCompleteTask = function (id) {
    let activeTab = document.querySelector(".nav-link.active").id.replace("-tab", "");
    tasks = tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task));
    saveTasks();
    displayTask(activeTab);
};

window.deleteTask = function (id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    displayTask("active");
};

document.getElementById("active-tab").addEventListener("click", () => displayTask("active"));
document.getElementById("pending-tab").addEventListener("click", () => displayTask("pending"));
document.getElementById("completed-tab").addEventListener("click", () => displayTask("completed"));

document.getElementById("active-tab").addEventListener("click", () => setActiveTab("active"));
document.getElementById("pending-tab").addEventListener("click", () => setActiveTab("pending"));
document.getElementById("completed-tab").addEventListener("click", () => setActiveTab("completed"));

function setActiveTab(tab) {
    document.querySelectorAll(".nav-link").forEach(tabElement => tabElement.classList.remove("active"));
    document.getElementById(`${tab}-tab`).classList.add("active");
    displayTask(tab);
}

const themeSwitch = document.getElementById("themeSwitch");
const icon = document.getElementById("themeIcon");

function toggleTheme() {
    const body = document.body;
    body.classList.toggle("light-mode");

    const isLightMode = body.classList.contains("light-mode");
    localStorage.setItem("theme", isLightMode ? "light" : "dark");

    icon.innerHTML = isLightMode ? `<i class="fas fa-sun"></i>` : `<i class="fas fa-moon"></i>`;
}

function loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    const body = document.body;

    if (savedTheme === "light") {
        body.classList.add("light-mode");
        themeSwitch.checked = true;
        icon.innerHTML = `<i class="fas fa-sun"></i>`;
    } else {
        body.classList.remove("light-mode");
        themeSwitch.checked = false;
        icon.innerHTML = `<i class="fas fa-moon"></i>`;
    }
}

themeSwitch.addEventListener("change", toggleTheme);
document.addEventListener("DOMContentLoaded", loadTheme);
addTaskButton.addEventListener("click", addTask);
