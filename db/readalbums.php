<?php 
include 'dbaccess.php';
$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
	
$query = "SELECT * FROM tbl_albums"; 
$result = $mysqli->query($query) or die($mysqli->error.__LINE__);
		
$arr = array();
if($result->num_rows > 0) {
	while($row = $result->fetch_assoc()) {
		$arr[] = $row;	
	}
	echo json_encode($arr);	
} else {
	$resp = 'Albums is empty!';
	echo json_encode($resp);
}
mysqli_close($mysqli);
?>