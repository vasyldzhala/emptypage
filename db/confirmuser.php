<?php 
include 'dbaccess.php';
$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if (isset($_POST['name'])) {
	$name = strip_tags(trim($_POST['name']));
	if (isset($_POST['password'])) $pass = strip_tags(trim($_POST['password']));
	$query = "SELECT * FROM tbl_users WHERE name='$name' AND password='$pass'";
	$result = $mysqli->query($query) or die($mysqli->error.__LINE__);
	if($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			$arr = $row;	
		}
		# JSON-encode the response
		echo json_encode($arr);
	} else {
		$resp = 'Invalid login or password';
		echo json_encode($resp);
	}
}

mysqli_close($mysqli);
?>