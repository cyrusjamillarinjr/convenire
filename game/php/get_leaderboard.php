<?php
// get_leaderboard.php
// Returns sorted student leaderboard directly from student_records table.

header('Content-Type: application/json');
require_once 'db_connect.php';

$sql = "SELECT id_number, full_name, section, 
               stage1_best_score, stage2_best_score, stage3_best_score, IFNULL(stage3_bonus_score, 0) AS stage3_bonus_score,
               (LEAST(100, stage1_best_score) + LEAST(100, stage2_best_score) + LEAST(100, stage3_best_score) + LEAST(50, IFNULL(stage3_bonus_score, 0))) AS total_score
        FROM student_records
        ORDER BY total_score DESC, last_updated DESC";

$result = $conn->query($sql);
$leaderboard = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $s1 = min(100, intval($row['stage1_best_score']));
        $s2 = min(100, intval($row['stage2_best_score']));
        $s3 = min(100, intval($row['stage3_best_score']));
        $sBonus = min(50, intval($row['stage3_bonus_score']));
        $total = $s1 + $s2 + $s3 + $sBonus;

        $leaderboard[] = [
            "studentId" => $row['id_number'],
            "fullName"  => $row['full_name'],
            "name"      => $row['full_name'],
            "section"   => $row['section'],
            "scores"    => [
                "stage1" => $s1,
                "stage2" => $s2,
                "stage3" => $s3,
                "stage3_bonus" => $sBonus
            ],
            "stageProgress" => [
                "stage1" => $s1 > 0,
                "stage2" => $s2 > 0,
                "stage3" => $s3 > 0,
                "stage3_bonus" => $sBonus > 0
            ],
            "total"     => $total
        ];
    }
}

$conn->close();

echo json_encode([
    "success"     => true,
    "leaderboard" => $leaderboard
]);
?>
