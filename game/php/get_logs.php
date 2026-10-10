<?php
// php/get_logs.php
// Fetches all play logs from MySQL database for Teacher Dashboard.

header('Content-Type: application/json');
require_once 'db_connect.php';

$query = "SELECT g.log_id, g.stage, g.play_date, g.play_time, g.score, 
                 g.student_id AS id_number, 
                 COALESCE(s.full_name, g.student_id) AS full_name, 
                 COALESCE(s.section, 'N/A') AS section 
          FROM game_logs g 
          LEFT JOIN students s ON g.student_id = s.id_number 
          ORDER BY g.play_date DESC, g.play_time DESC";

$result = $conn->query($query);

$logs = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $logs[] = [
            'log_id'     => intval($row['log_id']),
            'stage'      => intval($row['stage']),
            'play_date'  => $row['play_date'],
            'play_time'  => $row['play_time'],
            'score'      => intval($row['score']),
            'id_number'  => $row['id_number'],
            'full_name'  => $row['full_name'],
            'section'    => $row['section'],
            'timestamp'  => $row['play_date'] . ' ' . $row['play_time']
        ];
    }
}

$conn->close();

echo json_encode([
    'success' => true,
    'logs'    => $logs
]);
?>
