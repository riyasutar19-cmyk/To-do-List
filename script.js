
// 1. Get HTML elements
const input = document.getElementById("taskInput");
const form = document.getElementById("taskForm");
const priorityInput = document.getElementById("priorityInput");
const list = document.getElementById("taskList");
const counter = document.getElementById("taskCounter");
const summaryTitle = document.getElementById("summaryTitle");
const footerNote = document.getElementById("footerNote");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");

const STORAGE_KEY = "tasks";

let activeFilter = "all";
let tasks = loadTasks();

// Display saved tasks when the page opens
renderTasks();


// 2. Load tasks from Local Storage
function loadTasks() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(saved)) {
            return [];
        }

        return saved.map((task, index) => {
            // Support tasks saved by your previous version
            if (typeof task === "string") {
                return {
                    id: Date.now() + index,
                    text: task,
                    completed: false,
                    priority: "medium"
                };
            }

            return {
                id: task.id ?? (Date.now() + index),
                text: String(task.text ?? ""),
                completed: Boolean(task.completed),
                priority: ["high", "medium", "low"].includes(task.priority)
                    ? task.priority
                    : "medium"
            };
        }).filter(task => task.text.trim() !== "");

    } catch (error) {
        console.error("Could not load tasks:", error);
        return [];
    }
}


// 3. Save tasks
function saveTasks() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}


// 4. Add a new task
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const text = input.value.trim();

    if (text === "") {
        alert("Please enter a task!");
        input.focus();
        return;
    }

    const newTask = {
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now()) + Math.random(),
        text: text,
        completed: false,
        priority: priorityInput.value
    };

    tasks.unshift(newTask);

    saveTasks();
    renderTasks();

    input.value = "";
    priorityInput.value = "medium";
    input.focus();
});


// 5. Create one task element
function createTaskElement(task) {
    const row = document.createElement("li");

    row.className = "task-item";

    if (task.completed) {
        row.classList.add("completed");
    }

    // Complete button
    const checkButton = document.createElement("button");

    checkButton.type = "button";
    checkButton.className = "check-btn";
    checkButton.textContent = task.completed ? "✓" : "";
    checkButton.setAttribute(
        "aria-label",
        task.completed ? "Mark as active" : "Mark as completed"
    );

    checkButton.addEventListener("click", function() {
        task.completed = !task.completed;

        saveTasks();
        renderTasks();
    });


    // Task text and details
    const content = document.createElement("div");
    content.className = "task-content";

    const taskText = document.createElement("div");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const priority = document.createElement("span");

    priority.className = "priority priority-" + task.priority;
    priority.textContent =
        task.priority.charAt(0).toUpperCase() +
        task.priority.slice(1) +
        " Priority";

    const status = document.createElement("span");
    status.className = "status";
    status.textContent = task.completed
        ? "Completed"
        : "In progress";

    meta.append(priority, status);
    content.append(taskText, meta);


    // Delete button
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "🗑";
    deleteButton.setAttribute(
        "aria-label",
        "Delete " + task.text
    );

    deleteButton.addEventListener("click", function() {
        tasks = tasks.filter(function(item) {
            return item.id !== task.id;
        });

        saveTasks();
        renderTasks();
    });


    // Add elements to the task row
    row.append(checkButton, content, deleteButton);

    return row;
}


// 6. Display tasks and apply filters
function renderTasks() {
    list.replaceChildren();

    const visibleTasks = tasks.filter(function(task) {
        if (activeFilter === "active") {
            return !task.completed;
        }

        if (activeFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    if (visibleTasks.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty";

        if (activeFilter === "active") {
            empty.textContent = "No active tasks. You're all caught up!";
        } else if (activeFilter === "completed") {
            empty.textContent = "No completed tasks yet.";
        } else {
            empty.textContent = "No tasks yet. Add your first task!";
        }

        list.appendChild(empty);
    } else {
        visibleTasks.forEach(function(task) {
            list.appendChild(createTaskElement(task));
        });
    }

    // Update task counters
    const remaining = tasks.filter(function(task) {
        return !task.completed;
    }).length;

    const completed = tasks.length - remaining;

    counter.textContent =
        remaining + (remaining === 1 ? " task left" : " tasks left");

    summaryTitle.textContent =
        activeFilter === "all"
            ? "Your Tasks"
            : activeFilter === "active"
                ? "Active Tasks"
                : "Completed Tasks";

    footerNote.textContent =
        tasks.length + (tasks.length === 1
            ? " task saved on this device."
            : " tasks saved on this device.");

    clearCompletedBtn.disabled = completed === 0;
    clearCompletedBtn.style.opacity =
        completed === 0 ? "0.5" : "1";
}


// 7. Filter buttons
filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        activeFilter = button.dataset.filter;

        filterButtons.forEach(function(filterButton) {
            filterButton.classList.toggle(
                "active",
                filterButton === button
            );
        });

        renderTasks();
    });
});


// 8. Clear completed tasks
clearCompletedBtn.addEventListener("click", function() {
    tasks = tasks.filter(function(task) {
        return !task.completed;
    });

    saveTasks();
    renderTasks();
});
