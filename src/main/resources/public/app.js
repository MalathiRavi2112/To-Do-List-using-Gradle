// DOM Elements
const tasksList = document.getElementById('tasks-list');
const emptyState = document.getElementById('empty-state');
const pendingCount = document.getElementById('pending-count');
const modal = document.getElementById('add-modal');
const addForm = document.getElementById('add-task-form');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');

let tasks = [];

// API Base URL
const API_URL = '/api/tasks';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
    
    // Close modal if user clicks outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }
    
    // Listen for Escape key to close modal
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Set minimum date to today for the date picker
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('task-date').setAttribute('min', today);
});

// Fetch tasks from Spark Java backend
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        showToast('Error loading tasks', true);
        console.error(error);
    }
}

// Render tasks to DOM
function renderTasks() {
    tasksList.innerHTML = '';
    
    let pending = 0;
    
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        
        tasks.forEach((task, index) => {
            if (!task.complete) pending++;
            
            // Check if task is overdue (and not complete)
            const isOverdue = !task.complete && new Date(task.dueDate) < new Date(new Date().toDateString());
            
            const taskEl = document.createElement('div');
            taskEl.className = `task-card ${task.complete ? 'completed' : ''}`;
            
            taskEl.innerHTML = `
                <div class="task-content">
                    <div class="checkbox-wrapper" onclick="toggleTask(${index})">
                        <i class="fas fa-check check-icon"></i>
                    </div>
                    <div class="task-info">
                        <h3>${task.title}</h3>
                        <div class="task-meta">
                            <span class="meta-item tag-date ${isOverdue ? 'overdue' : ''}">
                                <i class="far fa-calendar-alt"></i> 
                                ${formatDate(task.dueDate)} 
                                ${isOverdue ? '(Overdue)' : ''}
                            </span>
                            ${task.project ? `
                            <span class="meta-item tag-project">
                                <i class="far fa-folder"></i> ${task.project}
                            </span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn delete" onclick="deleteTask(${index})" title="Delete task">
                        <i class="far fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            tasksList.appendChild(taskEl);
        });
    }
    
    pendingCount.textContent = pending;
}

// Add a new task
async function submitTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value;
    const project = document.getElementById('task-project').value;
    const dueDate = document.getElementById('task-date').value;
    
    const newTask = { title, project, dueDate };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });
        
        if (!response.ok) throw new Error('Failed to add task');
        
        tasks = await response.json();
        renderTasks();
        closeModal();
        showToast('Task added successfully');
    } catch (error) {
        showToast('Error adding task', true);
        console.error(error);
    }
}

// Toggle Task Completion Status
async function toggleTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/toggle`, { method: 'PUT' });
        if (!response.ok) throw new Error('Failed to update task');
        
        tasks = await response.json();
        renderTasks();
        
        const isNowComplete = tasks[id].complete;
        if (isNowComplete) {
            showToast('Task marked as complete!');
        }
    } catch (error) {
        showToast('Error updating task', true);
        console.error(error);
    }
}

// Delete Task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete task');
        
        tasks = await response.json();
        renderTasks();
        showToast('Task deleted');
    } catch (error) {
        showToast('Error deleting task', true);
        console.error(error);
    }
}

// UI Helpers
function openModal() {
    addForm.reset();
    // Set default date to today
    document.getElementById('task-date').value = new Date().toISOString().split('T')[0];
    modal.classList.remove('hidden');
    document.getElementById('task-title').focus();
}

function closeModal() {
    modal.classList.add('hidden');
}

function showToast(message, isError = false) {
    toast.style.backgroundColor = isError ? 'var(--danger-color)' : 'var(--success-color)';
    toastMsg.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const date = new Date(dateString);
    // Add timezone offset so it doesn't change day based on local timezone
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('en-US', options);
}
