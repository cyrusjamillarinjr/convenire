<?php
// get_bonus_questions.php
// Called by stage3.js when the Stage 3 bonus quiz starts.
// Returns the 5 active bonus questions from the stage3_bonus_questions table
// (ordered by question_order). The correct answers and insights are NOT sent
// to the browser - answers are checked server-side by check_bonus_answer.php.

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
require_once 'db_connect.php';

const BONUS_STAGE          = 3;
const REQUIRED_QUESTIONS   = 5;

function bonus_unavailable($httpCode, $message) {
    http_response_code($httpCode);
    echo json_encode(["success" => false, "message" => $message]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT question_id, question_order, question, option_a, option_b, option_c, option_d, correct_option
     FROM stage3_bonus_questions
     WHERE stage = ? AND is_active = 1
     ORDER BY question_order ASC, question_id ASC"
);

if (!$stmt) {
    // e.g. table not created yet - log details, return a generic message
    error_log("get_bonus_questions: prepare failed: " . $conn->error);
    bonus_unavailable(500, "Bonus questions are unavailable right now.");
}

$stage = BONUS_STAGE;
$stmt->bind_param("i", $stage);

if (!$stmt->execute()) {
    error_log("get_bonus_questions: execute failed: " . $stmt->error);
    bonus_unavailable(500, "Bonus questions are unavailable right now.");
}

$result    = $stmt->get_result();
$questions = [];
$seenOrder = [];
$problems  = [];

while ($row = $result->fetch_assoc()) {
    $order   = intval($row['question_order']);
    $options = [
        trim((string)$row['option_a']),
        trim((string)$row['option_b']),
        trim((string)$row['option_c']),
        trim((string)$row['option_d'])
    ];
    $questionText  = trim((string)$row['question']);
    $correctLetter = strtoupper(trim((string)$row['correct_option']));

    // Data integrity checks (teacher edits are free-form in MySQL-Front)
    if ($questionText === '' || in_array('', $options, true)) {
        $problems[] = "question_order {$order} has an empty question or option";
    }
    if (!in_array($correctLetter, ['A', 'B', 'C', 'D'], true)) {
        $problems[] = "question_order {$order} has an invalid correct_option";
    }
    if (isset($seenOrder[$order])) {
        $problems[] = "question_order {$order} is duplicated";
    }
    $seenOrder[$order] = true;

    $questions[] = [
        "id"      => intval($row['question_id']),
        "order"   => $order,
        "q"       => $questionText,
        "options" => $options
    ];
}

$stmt->close();
$conn->close();

// Require exactly 5 active questions numbered 1..5
for ($i = 1; $i <= REQUIRED_QUESTIONS; $i++) {
    if (!isset($seenOrder[$i])) {
        $problems[] = "question_order {$i} is missing";
    }
}
if (count($questions) !== REQUIRED_QUESTIONS) {
    $problems[] = "expected " . REQUIRED_QUESTIONS . " active questions, found " . count($questions);
}

if (!empty($problems)) {
    // Details go to the server log only (teacher can check the table).
    error_log("get_bonus_questions: invalid bonus question data: " . implode("; ", array_unique($problems)));
    bonus_unavailable(503, "The bonus quiz is not set up correctly. Please ask your teacher to check the bonus questions.");
}

echo json_encode([
    "success"   => true,
    "questions" => $questions
]);
?>
