document.addEventListener("DOMContentLoaded",()=>{
    loadTasks();
})

const taskContainer = document.getElementById("taskContainer");
const addTaskButton = document.getElementById("addTaskButton");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks(){
    localStorage.setItem("tasks",JSON.stringify(tasks));
}

function loadTasks(){
    displayTask("active");
}

function addTask(){
    const taskName = document.getElementById("taskInput");
    const taskPriority = document.getElementById("priorityInput");
    const taskStartDate = document.getElementById("startDateTime");
    const taskDueDate = document.getElementById("endDateTime");


    if ( !taskName.value || !taskPriority.value || !taskStartDate.value || !taskDueDate.value ) {
        alert("Enter All the Value First");
        return;
    }

    const newTask = {
        id: Date.now(),
        name: taskName.value.trim(),
        priority: parseInt(taskPriority.value),
        startDate: new Date(taskStartDate.value),
        dueDate: new Date(taskDueDate.value),
        completed: false,
    }

    tasks.push(newTask);
    saveTasks();
    document.getElementById("taskForm").reset();
    bootstrap.Modal.getInstance(document.getElementById("taskModal")).hide();
    displayTask("active");
}

function displayTask ( filter = "active" ) {
    taskContainer.innerHTML = "";

    const now = new Date();

    let activeListPriority = tasks.some( task=>task.priority < 3 && !task.completed );

    let sortedTasks = tasks.filter( task =>{
        return ( filter === "active" && now < new Date(task.dueDate) && !task.completed && 
    ( task.priority < 3 || !activeListPriority ) )
        || ( filter === "pending" && (task.priority === 3 && activeListPriority) || now < new Date(task.startDate) )
        || ( filter === "completed" && task.completed )
    });

    sortedTasks.sort((a,b) => a.priority - b.priority);

    sortedTasks.forEach(task => {
        const taskCard = document.createElement("div");
        taskCard.className = "task_card mb-3";


        let buttonText;
        if ( task.completed ) {
            buttonText = "Undo";
        } else {
            buttonText = "Complete";
        }

        taskCard.innerHTML = `
            <h5>${task.name}</h5> 
            <p>Priority: ${task.priority}</p> 
            <p>Start: ${new Date(task.startDate).toLocaleString()}</p> 
            <p>End: ${new Date(task.dueDate).toLocaleString()}</p> 
            <button class="btn btn-success" onclick="toggleCompleteTask(${task.id})">
                ${buttonText} 
            </button> 
            <button class="btn btn-danger" onclick="deleteTask(${task.id})">Delete</button> 
        `; 

        taskContainer.appendChild(taskCard);
    });
}

window.toggleCompleteTask = function (id){
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !tasks.completed };
        } else {
            return task;
        }
    });
    saveTasks();
    displayTask("active");
}

window.deleteTask = function (id){
    tasks = tasks.filter(task=> task.id !== id);
    saveTasks();
    displayTask("active");
}

document.getElementById("active-tab").addEventListener("click", () => displayTask("active"));
document.getElementById("pending-tab").addEventListener("click", () => displayTask("pending"));
document.getElementById("completed-tab").addEventListener("click", () => displayTask("completed"));

document.getElementById("active-tab").addEventListener("click", () => setActiveTab("active"));
document.getElementById("pending-tab").addEventListener("click", () => setActiveTab("pending"));
document.getElementById("completed-tab").addEventListener("click", () => setActiveTab("completed"));

function setActiveTab(tab){
    document.querySelectorAll(".nav-link").forEach(tabElement=>{
        tabElement.classList.remove("active");
    });

    document.getElementById(`${tab}-tab`).classList.add("active");
    displayTask(tab);
}


addTaskButton.addEventListener("click",addTask);
