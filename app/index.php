<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Habit Tracker</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <div class="controls">
                <div class="controls-left">
                    <select id="monthSelect"></select>
                    <select id="yearSelect"></select>
                </div>
                <div class="controls-right">
                    <button id="settingsBtn" class="button">Settings</button>
                    <button id="addHabitBtn" class="button-accent">Add habit</button>
                </div>
            </div>
        </header>

        <div id="addHabitForm" class="modal" style="display: none;">
            <div class="modal-content">
                <h3>Create habit</h3>
                <input type="text" id="habitName" placeholder="Habit name">
                <div class="modal-buttons">
                    <button id="saveHabitBtn" class="button-accent">Save</button>
                    <button id="cancelHabitBtn" class="button">Cancel</button>
                </div>
            </div>
        </div>

        <div id="editHabitForm" class="modal" style="display: none;">
            <div class="modal-content">
                <h3>Edit habit</h3>
                <input type="text" id="editHabitName" placeholder="Habit name">
                <div class="modal-buttons">
                    <button id="updateHabitBtn" class="button-accent">Save</button>
                    <button id="cancelEditBtn" class="button">Cancel</button>
                </div>
            </div>
        </div>

        <div id="deleteHabitForm" class="modal" style="display: none;">
            <div class="modal-content">
                <h3>Confirm deleting</h3>
                <p class="delete-warning">Enter habit name to confirm:</p>
                <p class="delete-habit-name" id="deleteHabitNameDisplay"></p>
                <input type="text" id="deleteHabitNameInput" placeholder="Enter habit name">
                <div class="modal-buttons">
                    <button id="confirmDeleteBtn" disabled>Delete</button>
                    <button id="cancelDeleteBtn">Cancel</button>
                </div>
            </div>
        </div>

        <div id="settingsForm" class="modal" style="display: none;">
            <div class="modal-content">
                <h3>Settings</h3>
                <div class="settings-group">
                    <label class="color-picker-label">
                        <input type="color" id="checkedColorPicker" value="#2f97b4">
                        <span>Checked cell color</span>
                    </label>
                </div>
                <div class="settings-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="showWeekdaysCheckbox" checked>
                        <span>Show weekdays in cells</span>
                    </label>
                </div>
                <div class="modal-buttons">
                    <button id="saveSettingsBtn" class="button-accent">Save</button>
                    <button id="cancelSettingsBtn" class="button">Cancel</button>
                </div>
            </div>
        </div>

        <div id="contextMenu" class="context-menu" style="display: none;">
            <button id="contextEdit">Edit</button>
            <button id="contextDelete">Delete</button>
        </div>

        <div id="tableContainer"></div>
    </div>

    <div id="loadingSpinner" class="loading-overlay">
        <div class="spinner"></div>
    </div>

    <script src="script.js"></script>
</body>
</html>
