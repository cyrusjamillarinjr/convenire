<?php
// register.php
// Receives registration data from authEngine.js and saves it into the
// students table. This runs ALONGSIDE the existing localStorage registration
// — it does not replace login/session handling, which still works as before.

header('Content-Type: application/json');
require_once 'db_connect.php';

// Read the JSON body sent by fetch()
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No data received."]);
    exit;
}

// --- Pull + trim fields from the request ---
$firstName = trim($data['firstName'] ?? '');
$lastName  = trim($data['lastName'] ?? '');
$studentId = trim($data['studentId'] ?? '');
$section   = trim($data['section'] ?? '');
$password  = $data['password'] ?? '';

// --- Basic validation (mirrors the "required" fields in the HTML form) ---
if (!$firstName || !$lastName || !$studentId || !$section || !$password) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "All required fields must be filled."]);
    exit;
}



$fullName = $firstName . " " . $lastName;

// --- Check for duplicate id_number ---
$check = $conn->prepare("SELECT student_id FROM students WHERE id_number = ?");
$check->bind_param("s", $studentId);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["success" => false, "message" => "Student ID or Username is already registered."]);
    $check->close();
    $conn->close();
    exit;
}
$check->close();

// --- Hash the password properly (never store plain text) ---
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

// --- Insert the new student ---
$stmt = $conn->prepare("INSERT INTO students (id_number, full_name, section, password_hash) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $studentId, $fullName, $section, $passwordHash);

if ($stmt->execute()) {
    $newId = $stmt->insert_id;
    // Also insert initial student_records row so new student is immediately present on the leaderboard
    $rec = $conn->prepare("INSERT INTO student_records (student_id, id_number, full_name, section, stage1_best_score, stage2_best_score, stage3_best_score, stage3_bonus_score, total_sessions) VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0) ON DUPLICATE KEY UPDATE full_name=VALUES(full_name)");
    if ($rec) {
        $rec->bind_param("isss", $newId, $studentId, $fullName, $section);
        $rec->execute();
        $rec->close();
    }

    echo json_encode([
        "success" => true,
        "message" => "Student registered in database successfully.",
        "student_id" => $newId
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database insert failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>