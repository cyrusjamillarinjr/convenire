<?php
// php/teacher_auth.php
// Verifies teacher / admin credentials from the MySQL `teachers` table.

header('Content-Type: application/json');
require_once 'db_connect.php';

// Support both JSON input and POST body
$rawInput = @file_get_contents("php://input");
$input = !empty($rawInput) ? json_decode($rawInput, true) : [];
$username = trim($input['username'] ?? $_POST['username'] ?? '');
$password = trim($input['password'] ?? $_POST['password'] ?? '');

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Please enter both Username and Password."]);
    exit;
}

// Query the teachers table
$stmt = $conn->prepare("SELECT teacher_id, full_name, username, password_hash FROM teachers WHERE username = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
    exit;
}

$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $row = $result->fetch_assoc()) {
    $storedHash = $row['password_hash'];
    $isValid = false;

    // 1. Verify bcrypt/argon hash
    if (password_verify($password, $storedHash)) {
        $isValid = true;
    } 
    // 2. Fallback to plain text match (useful when teachers/admins are manually typed into MySQL-Front)
    else if ($password === $storedHash) {
        $isValid = true;
        // Auto-upgrade plain text to secure hash in DB
        $newHash = password_hash($password, PASSWORD_DEFAULT);
        $upgrade = $conn->prepare("UPDATE teachers SET password_hash = ? WHERE teacher_id = ?");
        if ($upgrade) {
            $upgrade->bind_param("si", $newHash, $row['teacher_id']);
            $upgrade->execute();
            $upgrade->close();
        }
    }

    if ($isValid) {
        echo json_encode([
            "success" => true,
            "role"    => "admin",
            "user"    => [
                "username"   => $row['username'],
                "name"       => $row['full_name'],
                "teacher_id" => intval($row['teacher_id']),
                "role"       => "admin"
            ]
        ]);
        $stmt->close();
        $conn->close();
        exit;
    } else {
        echo json_encode(["success" => false, "message" => "Invalid password for Teacher / Admin account."]);
        $stmt->close();
        $conn->close();
        exit;
    }
}

$stmt->close();
$conn->close();

echo json_encode(["success" => false, "message" => "Teacher account not found."]);
?>
