document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todoInput');
    const addBtn = document.getElementById('addBtn');
    const todoList = document.getElementById('todoList');
    const resetBtn = document.getElementById('resetBtn');
    const filterAll = document.getElementById('filterAll');
    const filterCompleted = document.getElementById('filterCompleted');
    const filterPending = document.getElementById('filterPending');

    let tasks = [];

    // Load tasks from local storage on page load
    loadTasks();

    addBtn.addEventListener('click', addTask);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    resetBtn.addEventListener('click', resetTasks);

    todoList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            deleteTask(e.target.closest('.list-group-item'));
        } else if (e.target.classList.contains('form-check-input')) {
            toggleTaskComplete(e.target.closest('.list-group-item'));
        } else if (e.target.classList.contains('edit-btn')) {
            editTask(e.target.closest('.list-group-item'));
        }
    });

    filterAll.addEventListener('click', () => filterTasks('all'));
    filterCompleted.addEventListener('click', () => filterTasks('completed'));
    filterPending.addEventListener('click', () => filterTasks('pending'));

    function addTask() {
        const taskText = todoInput.value.trim();
        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        tasks.push(newTask);
        renderTasks();
        saveTasks();
        todoInput.value = '';
    }

    function deleteTask(taskElement) {
        const taskId = parseInt(taskElement.dataset.id);
        tasks = tasks.filter(task => task.id !== taskId);
        taskElement.remove();
        saveTasks();
    }

    function toggleTaskComplete(taskElement) {
        const taskId = parseInt(taskElement.dataset.id);
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            renderTasks();
            saveTasks();
        }
    }

    function editTask(taskElement) {
        const taskId = parseInt(taskElement.dataset.id);
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            const newText = prompt('Edit task:', task.text);
            if (newText !== null && newText.trim() !== '') {
                task.text = newText.trim();
                renderTasks();
                saveTasks();
            }
        }
    }

    function saveTasks() {
        localStorage.setItem('todos', JSON.stringify(tasks));
    }

    function loadTasks() {
        const storedTasks = JSON.parse(localStorage.getItem('todos')) || [];
        tasks = storedTasks;
        renderTasks();
    }

    function renderTasks(filterType = 'all') {
        todoList.innerHTML = '';
        tasks.forEach(task => {
            if (filterType === 'completed' && !task.completed) return;
            if (filterType === 'pending' && task.completed) return;

            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.dataset.id = task.id;
            li.innerHTML = `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" ${task.completed ? 'checked' : ''}>
                    <label class="form-check-label" style="text-decoration: ${task.completed ? 'line-through' : 'none'}">${task.text}</label>
                </div>
                <div>
                    <button class="btn btn-warning btn-sm edit-btn">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                </div>
            `;
            todoList.appendChild(li);
        });
    }

    function filterTasks(filterType) {
        renderTasks(filterType);
    }

    function resetTasks() {
        if (confirm('Are you sure you want to reset the entire to-do list?')) {
            tasks = [];
            todoList.innerHTML = '';
            localStorage.removeItem('todos');
        }
    }
});