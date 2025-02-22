let activeTimers = {};
let currentTimerId = null;
let timerInterval = null;
let isPaused = false;
let remainingTime = 0;

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    loadTheme();

    // Refresh task list every minute to handle pending -> active transitions
    setInterval(() => {
        const activeTab = document.querySelector(".nav-link.active").id.replace("-tab", "");
        displayTask(activeTab);
    }, 60000); // Refresh every minute
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
        const startDate = new Date(task.startDate);
        const dueDate = new Date(task.dueDate);

        if (filter === "active") {
            // Task is active if the current time is between the start and due dates
            return now >= startDate && now < dueDate && !task.completed;
        } else if (filter === "pending") {
            // Task is pending if the start date is in the future
            return now < startDate;
        } else if (filter === "completed") {
            // Task is completed if it's marked as completed
            return task.completed;
        }
        return false;
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
            <button class="btn btn-primary" onclick="startTask(${task.id})">Start Task</button>
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

function markTaskComplete(id) {
    tasks = tasks.map(task => (task.id === id ? { ...task, completed: true } : task));
    saveTasks();
    displayTask("active");
}

window.startTask = function (id) {
    const minutes = parseInt(prompt("Enter time in minutes for this task:"));
    if (isNaN(minutes) || minutes <= 0) {
        alert("Please enter a valid number greater than zero.");
        return;
    }

    const task = tasks.find(task => task.id === id);
    if (!task) return;

    currentTimerId = id;
    remainingTime = minutes * 60000; // Convert minutes to milliseconds

    // Set the total time for the task
    task.totalTime = remainingTime;

    updateTimerDisplay(task.name, remainingTime);
    startTimer();
};

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    isPaused = false;

    const startTime = Date.now();
    const endTime = startTime + remainingTime;

    timerInterval = setInterval(() => {
        if (!isPaused) {
            const now = Date.now();
            remainingTime = Math.max(0, endTime - now);

            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                updateTimerDisplay("No Active Timer", 0);
                markTaskComplete(currentTimerId);
                currentTimerId = null;
            } else {
                updateTimerDisplay(tasks.find(task => task.id === currentTimerId).name, remainingTime);
            }
        }
    }, 1000);
}

function updateTimerDisplay(taskName, time) {
    const progressBarFill = document.querySelector(".progress-bar-fill");
    const taskNameElement = document.querySelector(".timer-text .task-name");
    const timeRemainingElement = document.querySelector(".timer-text .time-remaining");

    // Update task name and time remaining
    taskNameElement.textContent = taskName;

    const minutesLeft = Math.floor(time / 60000);
    const secondsLeft = Math.floor((time % 60000) / 1000);
    timeRemainingElement.textContent = `${minutesLeft}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;

    // Calculate progress percentage
    const task = tasks.find(task => task.id === currentTimerId);
    if (!task || !task.totalTime) return; // Avoid division by zero

    const progress = ((task.totalTime - time) / task.totalTime) * 100; // Calculate progress percentage
    progressBarFill.style.width = `${progress}%`; // Update progress bar width
}

document.getElementById("startTimer").addEventListener("click", () => {
    if (currentTimerId) startTimer();
});

document.getElementById("pauseTimer").addEventListener("click", () => {
    isPaused = true;
});

document.getElementById("endTimer").addEventListener("click", () => {
    clearInterval(timerInterval);
    updateTimerDisplay("No Active Timer", 0);
    currentTimerId = null;
});

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