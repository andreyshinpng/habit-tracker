<?php
header('Content-Type: application/json');

$host = getenv('DB_HOST');
$dbname = getenv('DB_NAME');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getHabits') {
    $month = $_GET['month'] ?? date('m');
    $year = $_GET['year'] ?? date('Y');
    
    $stmt = $pdo->prepare("SELECT id, name, color FROM habits WHERE deleted_at IS NULL ORDER BY sort_order ASC, id ASC");
    $stmt->execute();
    $habits = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $firstDay = "$year-" . str_pad($month, 2, '0', STR_PAD_LEFT) . "-01";
    $lastDay = date("Y-m-t", strtotime($firstDay));
    
    $stmt = $pdo->prepare("SELECT habit_id, check_date FROM habit_checks WHERE check_date BETWEEN ? AND ?");
    $stmt->execute([$firstDay, $lastDay]);
    $checks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['habits' => $habits, 'checks' => $checks]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    
    if ($action === 'addHabit') {
        $name = trim($data['name'] ?? '');
        $color = $data['color'] ?? null;
        if ($name) {
            $stmt = $pdo->prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM habits WHERE deleted_at IS NULL");
            $stmt->execute();
            $nextOrder = $stmt->fetch(PDO::FETCH_ASSOC)['next_order'];
            
            $stmt = $pdo->prepare("INSERT INTO habits (name, sort_order, color) VALUES (?, ?, ?)");
            $stmt->execute([$name, $nextOrder, $color]);
            echo json_encode(['success' => true]);
        }
    }
    
    if ($action === 'deleteHabit') {
        $habitId = $data['habitId'] ?? 0;
        $stmt = $pdo->prepare("UPDATE habits SET deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$habitId]);
        echo json_encode(['success' => true]);
    }
    
    if ($action === 'updateHabit') {
        $habitId = $data['habitId'] ?? 0;
        $name = trim($data['name'] ?? '');
        $color = $data['color'] ?? null;
        if ($name && $habitId) {
            $stmt = $pdo->prepare("UPDATE habits SET name = ?, color = ? WHERE id = ?");
            $stmt->execute([$name, $color, $habitId]);
            echo json_encode(['success' => true]);
        }
    }
    
    if ($action === 'toggleCheck') {
        $habitId = $data['habitId'] ?? 0;
        $date = $data['date'] ?? '';
        
        $stmt = $pdo->prepare("SELECT id FROM habit_checks WHERE habit_id = ? AND check_date = ?");
        $stmt->execute([$habitId, $date]);
        
        if ($stmt->fetch()) {
            $stmt = $pdo->prepare("DELETE FROM habit_checks WHERE habit_id = ? AND check_date = ?");
            $stmt->execute([$habitId, $date]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO habit_checks (habit_id, check_date) VALUES (?, ?)");
            $stmt->execute([$habitId, $date]);
        }
        
        echo json_encode(['success' => true]);
    }
    
    if ($action === 'reorderHabits') {
        $habitIds = $data['habitIds'] ?? [];
        
        foreach ($habitIds as $index => $habitId) {
            $stmt = $pdo->prepare("UPDATE habits SET sort_order = ? WHERE id = ?");
            $stmt->execute([$index, $habitId]);
        }
        
        echo json_encode(['success' => true]);
    }
    
    exit;
}

echo json_encode(['error' => 'Invalid request']);
