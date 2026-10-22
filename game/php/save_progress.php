<?php
// save_progress.php
// Called by authEngine.js whenever a student completes a stage.
// Inserts a session row into game_logs and updates the student_records best scores.

header('Content-Type: application/json');
require_once 'db_connect.php';

// Read JSON body
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No data received."]);
    exit;
}

$studentIdNumber = trim($data['studentId'] ?? '');
$stage           = intval($data['stage'] ?? 0);
$score           = intval($data['score'] ?? 0);
$bonusScore      = isset($data['bonusScore']) ? intval($data['bonusScore']) : null;

if (!$studentIdNumber || $stage < 1 || $stage > 3) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid studentId or stage number."]);
    exit;
}

// --- Look up the internal student_id (PK) and full_name from id_number ---
$lookup = $conn->prepare("SELECT student_id, full_name FROM students WHERE id_number = ?");
$lookup->bind_param("s", $studentIdNumber);
$lookup->execute();
$lookup->bind_result($dbStudentId, $dbFullName);
$lookup->fetch();
$lookup->close();

if (!$dbStudentId) {
    // Auto-provision student in students table so progress is never rejected
    $defaultName = "Student " . $studentIdNumber;
    $defaultSection = "N/A";
    $defaultHash = "";
    $autoInsert = $conn->prepare("INSERT INTO students (id_number, full_name, section, password_hash) VALUES (?, ?, ?, ?)");
    $autoInsert->bind_param("ssss", $studentIdNumber, $defaultName, $defaultSection, $defaultHash);
    $autoInsert->execute();
    $dbStudentId = $autoInsert->insert_id;
    $autoInsert->close();
}

// --- Insert a new session row into game_logs ---
$now      = new DateTime();
$playDate = $now->format('Y-m-d');
$playTime = $now->format('H:i:s');
$bonusVal = ($stage === 3 && $bonusScore !== null) ? min(50, max(0, $bonusScore)) : 0;

$insert = $conn->prepare(
    "INSERT INTO game_logs (student_id, stage, play_date, play_time, score, bonus_score) VALUES (?, ?, ?, ?, ?, ?)"
);
$insert->bind_param("sissii", $studentIdNumber, $stage, $playDate, $playTime, $score, $bonusVal);
$insert->execute();
$logId = $insert->insert_id;
$insert->close();

// --- Update student_records best score for this stage ---
$scoreCol = "stage{$stage}_best_score";

if ($stage === 3 && $bonusScore !== null) {
    $upsert = $conn->prepare(
        "INSERT INTO student_records (student_id, id_number, full_name, section, stage3_best_score, stage3_bonus_score, total_sessions)
         SELECT s.student_id, s.id_number, s.full_name, s.section, ?, ?, 1
         FROM students s WHERE s.student_id = ?
         ON DUPLICATE KEY UPDATE
             stage3_best_score = IF(VALUES(stage3_best_score) > IFNULL(stage3_best_score, 0), VALUES(stage3_best_score), stage3_best_score),
             stage3_bonus_score = IF(VALUES(stage3_bonus_score) > IFNULL(stage3_bonus_score, 0), VALUES(stage3_bonus_score), stage3_bonus_score),
             total_sessions = total_sessions + 1"
    );
    $upsert->bind_param("iii", $score, $bonusVal, $dbStudentId);
} else {
    $upsert = $conn->prepare(
        "INSERT INTO student_records (student_id, id_number, full_name, section, {$scoreCol}, total_sessions)
         SELECT s.student_id, s.id_number, s.full_name, s.section, ?, 1
         FROM students s WHERE s.student_id = ?
         ON DUPLICATE KEY UPDATE
             {$scoreCol} = IF(VALUES({$scoreCol}) > IFNULL({$scoreCol}, 0), VALUES({$scoreCol}), {$scoreCol}),
             total_sessions = total_sessions + 1"
    );
    $upsert->bind_param("ii", $score, $dbStudentId);
}
$upsert->execute();
$upsert->close();

$conn->close();

echo json_encode([
    "success"  => true,
    "message"  => "Stage {$stage} progress saved to database.",
    "log_id"   => $logId,
    "stage"    => $stage,
    "score"    => $score
]);
?>
