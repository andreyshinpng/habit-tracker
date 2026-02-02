let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let loadingStartTime = null;

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function showSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    spinner.classList.remove('hidden');
    loadingStartTime = Date.now();
}

function hideSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    const elapsed = Date.now() - loadingStartTime;
    const minDisplayTime = 500;
    
    if (elapsed < minDisplayTime) {
        setTimeout(() => {
            spinner.classList.add('hidden');
        }, minDisplayTime - elapsed);
    } else {
        spinner.classList.add('hidden');
    }
}

function initSelects() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');

    monthNames.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        if (index === currentMonth) option.selected = true;
        monthSelect.appendChild(option);
    });

    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }

    monthSelect.addEventListener('change', (e) => {
        currentMonth = parseInt(e.target.value);
        loadData();
    });

    yearSelect.addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        loadData();
    });
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

async function loadData() {
    showSpinner();
    try {
        const response = await fetch(`api.php?action=getHabits&month=${currentMonth + 1}&year=${currentYear}`);
        const data = await response.json();
        renderTable(data);
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        hideSpinner();
    }
}

function getDayOfWeekShort(year, month, day) {
    const date = new Date(year, month, day);
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return days[date.getDay()];
}

function renderTable(data) {
    const container = document.getElementById('tableContainer');
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    if (!data.habits || data.habits.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No habits yet</p>
                <p>Create your first habit</p>
            </div>
        `;
        return;
    }

    let html = '<table><thead><tr><th></th>';
    
    for (let day = 1; day <= daysInMonth; day++) {
        html += `<th>${day}</th>`;
    }
    
    html += '</tr></thead><tbody>';

    data.habits.forEach(habit => {
        html += `<tr data-habit-id="${habit.id}" data-habit-name="${habit.name.replace(/"/g, '&quot;')}">
                 <td><div class="habit-name" draggable="true">
                 <span class="habit-text">${habit.name}</span>
                 </div></td>`;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isChecked = data.checks.some(check => 
                check.habit_id == habit.id && check.check_date === dateStr
            );
            const showWeekdays = localStorage.getItem('showWeekdays') !== 'false';
            const dayOfWeek = showWeekdays ? getDayOfWeekShort(currentYear, currentMonth, day) : '';
            
            html += `<td><button class="day-cell ${isChecked ? 'checked' : ''}" 
                     onclick="toggleCheck(${habit.id}, '${dateStr}')">${dayOfWeek}</button></td>`;
        }
        
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
    
    initDragAndDrop();
    initContextMenu();
}

async function toggleCheck(habitId, date) {
    try {
        await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggleCheck', habitId, date })
        });
        loadData();
    } catch (error) {
        console.error('Error toggling check:', error);
    }
}

document.getElementById('addHabitBtn').addEventListener('click', () => {
    document.getElementById('addHabitForm').style.display = 'flex';
    document.getElementById('habitName').value = '';
    document.getElementById('habitName').focus();
});

document.getElementById('cancelHabitBtn').addEventListener('click', () => {
    document.getElementById('addHabitForm').style.display = 'none';
});

document.getElementById('saveHabitBtn').addEventListener('click', async () => {
    const name = document.getElementById('habitName').value.trim();
    if (!name) return;

    try {
        await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addHabit', name })
        });
        document.getElementById('addHabitForm').style.display = 'none';
        loadData();
    } catch (error) {
        console.error('Error adding habit:', error);
    }
});

document.getElementById('habitName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('saveHabitBtn').click();
    }
});

let draggedRow = null;

function initDragAndDrop() {
    const habitNames = document.querySelectorAll('.habit-name');
    const rows = document.querySelectorAll('tbody tr');
    
    habitNames.forEach(habitName => {
        habitName.addEventListener('dragstart', (e) => {
            draggedRow = habitName.closest('tr');
            draggedRow.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        habitName.addEventListener('dragend', (e) => {
            if (draggedRow) {
                draggedRow.classList.remove('dragging');
                draggedRow = null;
            }
        });
    });
    
    rows.forEach(row => {
        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!draggedRow) return;
            
            e.dataTransfer.dropEffect = 'move';
            
            const afterElement = getDragAfterElement(row.parentElement, e.clientY);
            if (afterElement == null) {
                row.parentElement.appendChild(draggedRow);
            } else {
                row.parentElement.insertBefore(draggedRow, afterElement);
            }
        });
        
        row.addEventListener('drop', async (e) => {
            e.preventDefault();
            if (draggedRow) {
                await updateHabitOrder();
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('tr:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function updateHabitOrder() {
    const rows = document.querySelectorAll('tbody tr');
    const habitIds = Array.from(rows).map(row => parseInt(row.dataset.habitId));
    
    try {
        await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reorderHabits', habitIds })
        });
    } catch (error) {
        console.error('Error updating order:', error);
    }
}

let currentContextHabitId = null;

function initContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        row.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            currentContextHabitId = parseInt(row.dataset.habitId);
            
            contextMenu.style.display = 'block';
            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.top = e.pageY + 'px';
        });
    });
    
    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
    });
}

document.getElementById('contextEdit').addEventListener('click', () => {
    const row = document.querySelector(`tr[data-habit-id="${currentContextHabitId}"]`);
    const habitName = row.dataset.habitName;
    
    document.getElementById('editHabitName').value = habitName;
    document.getElementById('editHabitForm').style.display = 'flex';
    document.getElementById('editHabitName').focus();
});

document.getElementById('contextDelete').addEventListener('click', () => {
    const row = document.querySelector(`tr[data-habit-id="${currentContextHabitId}"]`);
    const habitName = row.dataset.habitName;
    
    document.getElementById('deleteHabitNameDisplay').textContent = habitName;
    document.getElementById('deleteHabitNameInput').value = '';
    document.getElementById('deleteHabitNameInput').dataset.expectedName = habitName;
    document.getElementById('confirmDeleteBtn').disabled = true;
    document.getElementById('deleteHabitForm').style.display = 'flex';
    document.getElementById('deleteHabitNameInput').focus();
});

document.getElementById('cancelEditBtn').addEventListener('click', () => {
    document.getElementById('editHabitForm').style.display = 'none';
});

document.getElementById('updateHabitBtn').addEventListener('click', async () => {
    const name = document.getElementById('editHabitName').value.trim();
    if (!name) return;

    try {
        await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'updateHabit', 
                habitId: currentContextHabitId,
                name 
            })
        });
        document.getElementById('editHabitForm').style.display = 'none';
        loadData();
    } catch (error) {
        console.error('Error updating habit:', error);
    }
});

document.getElementById('editHabitName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('updateHabitBtn').click();
    }
});

document.getElementById('deleteHabitNameInput').addEventListener('input', (e) => {
    const input = e.target;
    const expectedName = input.dataset.expectedName;
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    if (input.value === expectedName) {
        confirmBtn.disabled = false;
    } else {
        confirmBtn.disabled = true;
    }
});

document.getElementById('deleteHabitNameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !document.getElementById('confirmDeleteBtn').disabled) {
        document.getElementById('confirmDeleteBtn').click();
    }
});

document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    document.getElementById('deleteHabitForm').style.display = 'none';
});

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    try {
        await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteHabit', habitId: currentContextHabitId })
        });
        document.getElementById('deleteHabitForm').style.display = 'none';
        loadData();
    } catch (error) {
        console.error('Error deleting habit:', error);
    }
});

document.getElementById('settingsBtn').addEventListener('click', () => {
    const savedColor = localStorage.getItem('checkedCellColor') || '#2f97b4';
    const showWeekdays = localStorage.getItem('showWeekdays') !== 'false';
    document.getElementById('checkedColorPicker').value = savedColor;
    document.getElementById('showWeekdaysCheckbox').checked = showWeekdays;
    document.getElementById('settingsForm').style.display = 'flex';
});

document.getElementById('cancelSettingsBtn').addEventListener('click', () => {
    document.getElementById('settingsForm').style.display = 'none';
});

document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    const color = document.getElementById('checkedColorPicker').value;
    const showWeekdays = document.getElementById('showWeekdaysCheckbox').checked;
    localStorage.setItem('checkedCellColor', color);
    localStorage.setItem('showWeekdays', showWeekdays);
    applyCheckedCellColor();
    document.getElementById('settingsForm').style.display = 'none';
    loadData();
});

function applyCheckedCellColor() {
    const color = localStorage.getItem('checkedCellColor') || '#2f97b4';
    const hoverColor = adjustColor(color, 30);
    const style = document.getElementById('dynamic-style') || document.createElement('style');
    style.id = 'dynamic-style';
    style.textContent = `
        .checkbox-label input[type="checkbox"]:checked + span::before {
            background: ${color};
            border-color: ${color};
        }
        .checkbox-label:hover span::before {
            border-color: ${color};
        }
        .day-cell.checked {
            background: ${color} !important;
            border-color: ${hoverColor} !important;
        }
        .button-accent {
            background: ${color} !important;
        }
        .spinner {
            border-top-color: ${color} !important;
        }
    `;
    if (!document.getElementById('dynamic-style')) {
        document.head.appendChild(style);
    }
}

function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

applyCheckedCellColor();
initSelects();
loadData();
