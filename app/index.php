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
                <select id="monthSelect"></select>
                <select id="yearSelect"></select>
                <button id="addHabitBtn">+ Add habit</button>
            </div>
        </header>

        <div id="addHabitForm" class="modal" style="display: none;">
            <div class="modal-content">
                <h3>Create habit</h3>
                <input type="text" id="habitName" placeholder="Habit name">
                <div class="modal-buttons">
                    <button id="saveHabitBtn">Save</button>
                    <button id="cancelHabitBtn">Cancel</button>
                </div>
            </div>
        </div>

        <div id="editHabitForm" class="modal" style="display: none;">
            <div class="modal-content">
                <h3>Edit habit</h3>
                <input type="text" id="editHabitName" placeholder="Habit name">
                <div class="modal-buttons">
                    <button id="updateHabitBtn">Save</button>
                    <button id="cancelEditBtn">Cancel</button>
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

        <div id="contextMenu" class="context-menu" style="display: none;">
            <button id="contextEdit">Edit</button>
            <button id="contextDelete">Delete</button>
        </div>

        <div id="tableContainer"></div>
    </div>

    <script src="script.js"></script>
</body>
</html>
