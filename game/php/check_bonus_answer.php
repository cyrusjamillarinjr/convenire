<?php
// check_bonus_answer.php
// Called by stage3.js when a student picks a choice in the Stage 3 bonus quiz.
// Compares the selected letter (A-D) with correct_option in the
// stage3_bonus_questions table and returns whether it was correct.
// (Same rule as the original quiz: exactly one correct choice per question.)

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
require_once 'db_connect.php';

const BONUS_STAGE = 3;

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No data received."]);
    exit;
}

$questionId = intval($data['questionId'] ?? 0);
$selected   = strtoupper(trim((string)($data['selected'] ?? '')));

if ($questionId < 1 || !in_array($selected, ['A', 'B', 'C', 'D'], true)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid question or answer."]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT correct_option, insight, option_a, option_b, option_c, option_d
     FROM stage3_bonus_questions
     WHERE question_id = ? AND stage = ? AND is_active = 1
     LIMIT 1"
);

if (!$stmt) {
    error_log("check_bonus_answer: prepare failed: " . $conn->error);
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Could not check the answer right now."]);
    exit;
}

$stage = BONUS_STAGE;
$stmt->bind_param("ii", $questionId, $stage);
$stmt->execute();
$stmt->bind_result($correctOption, $insight, $optA, $optB, $optC, $optD);
$found = $stmt->fetch();
$stmt->close();
$conn->close();

if (!$found) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "This bonus question is no longer available."]);
    exit;
}

$rawCorrect    = trim((string)$correctOption);
$correctLetter = strtoupper($rawCorrect);

// Flexible extraction: handles 'A', 'a', 'A.', 'A)', '1', or matching option text
if (preg_match('/^([A-D])\b/i', $rawCorrect, $m)) {
    $correctLetter = strtoupper($m[1]);
} elseif (in_array($rawCorrect, ['1', '2', '3', '4'], true)) {
    $map = ['1' => 'A', '2' => 'B', '3' => 'C', '4' => 'D'];
    $correctLetter = $map[$rawCorrect];
} else {
    $opts = [$optA, $optB, $optC, $optD];
    foreach ($opts as $idx => $opt) {
        if ($opt !== '' && (strcasecmp($rawCorrect, (string)$opt) === 0 || stripos((string)$opt, $rawCorrect) !== false)) {
            $correctLetter = ['A', 'B', 'C', 'D'][$idx];
            break;
        }
    }
}

if (!in_array($correctLetter, ['A', 'B', 'C', 'D'], true)) {
    error_log("check_bonus_answer: invalid correct_option for question_id {$questionId}");
    http_response_code(503);
    echo json_encode(["success" => false, "message" => "This bonus question is not set up correctly."]);
    exit;
}

// The correct letter is only revealed AFTER the student has answered,
// matching the original quiz behaviour (correct choice is highlighted).
echo json_encode([
    "success"       => true,
    "correct"       => ($selected === $correctLetter),
    "correctOption" => $correctLetter,
    "insight"       => (string)$insight
]);
?>
