<?php
// db_connect.php
// Reusable MySQL connection for Convenire.
// Default values match a standard XAMPP setup (localhost, root, no password).
// If you're using a live server later, just change these 4 values.

$DB_HOST = "localhost";
$DB_USER = "root";
$DB_PASS = "";
$DB_NAME = "convenire_db";

// Don't let mysqli print raw warnings (they can contain host/user details).
mysqli_report(MYSQLI_REPORT_OFF);

$conn = @new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    // Log the real reason on the server only (Apache/PHP error log).
    error_log("Convenire DB connection failed: " . $conn->connect_error);

    // Stop everything and return JSON so the frontend can show a real error
    // instead of failing silently. No internal details are sent to the client.
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed. Please contact your teacher or administrator."
    ]);
    exit;
}

$conn->set_charset("utf8mb4");
?>