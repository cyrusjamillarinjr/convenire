<?php
// reset_records.php
// Clears game logs (and automatically updates student_records view)
// for Teacher/Admin Dashboard.

header('Content-Type: application/json');
require_once 'db_connect.php';

// Support both JSON input and standard POST/GET
$rawInput = (php_sapi_name() === 'cli') ? '' : @file_get_contents("php://input");
$input = !empty($rawInput) ? json_decode($rawInput, true) : [];
$studentIdParam = $input['studentId'] ?? $_POST['studentId'] ?? $_GET['studentId'] ?? null;
$fullReset = !empty($input['fullReset']) || !empty($_POST['fullReset']);

if ($studentIdParam !== null && trim($studentIdParam) !== '') {
    $studentIdParam = trim($studentIdParam);
    $stmt = $conn->prepare(
        "DELETE FROM game_logs WHERE student_id = ?"
    );
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
        $conn->close();
        exit;
    }

    $stmt->bind_param("s", $studentIdParam);
    if ($stmt->execute()) {
        $affected = $stmt->affected_rows;
        $stmt->close();
        $conn->close();
        echo json_encode([
            "success" => true,
            "message" => "Records for student cleared successfully.",
            "affected_rows" => $affected
        ]);
        exit;
    } else {
        $error = $stmt->error;
        $stmt->close();
        $conn->close();
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to reset student records: " . $error
        ]);
        exit;
    }
}

if ($fullReset) {
    // Full reset: disable FK checks so TRUNCATE works regardless of constraint order
    $conn->query("SET FOREIGN_KEY_CHECKS = 0");
    $conn->query("TRUNCATE TABLE game_logs");
    $conn->query("TRUNCATE TABLE student_records");
    $conn->query("TRUNCATE TABLE students");
    $conn->query("SET FOREIGN_KEY_CHECKS = 1");

    $conn->close();
    echo json_encode([
        "success" => true,
        "message" => "All student accounts, records, and game logs have been fully reset."
    ]);
    exit;
}

// Default: reset only game_logs & scores (scores reset to 0, students accounts KEPT)
$deleteQuery = "DELETE FROM game_logs";
if ($conn->query($deleteQuery)) {
    $affected = $conn->affected_rows;
    @$conn->query("ALTER TABLE game_logs AUTO_INCREMENT = 1");
    @$conn->query("UPDATE student_records SET stage1_best_score = 0, stage2_best_score = 0, stage3_best_score = 0, stage3_bonus_score = 0, total_sessions = 0");
    $conn->close();
    echo json_encode([
        "success" => true,
        "message" => "All game logs and scores have been reset. Student accounts were kept.",
        "affected_rows" => $affected
    ]);
} else {
    $error = $conn->error;
    $conn->close();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to reset records: " . $error
    ]);
}
?>

