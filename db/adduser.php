<?php 
include 'dbaccess.php';
$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if (isset($_POST['name'])) {
	$name = strip_tags(trim($_POST['name']));
	$query0 = "SELECT * FROM tbl_users WHERE name='$name'";
	$result0 = $mysqli->query($query0) or die($mysqli->error.__LINE__);
	if($result0->num_rows > 0) {
		$resp ='User already exists!';
		echo json_encode($resp);
	} else {
		if (isset($_POST['email'])) $email = strip_tags(trim($_POST['email']));
		if (isset($_POST['firstName'])) $firstName = strip_tags(trim($_POST['firstName'])); 
		else $firstName = '';
		if (isset($_POST['lastName'])) $lastName = strip_tags(trim($_POST['lastName']));
		else $lastName = '';
		if (isset($_POST['password'])) $pass = strip_tags(trim($_POST['password']));
		$created = time();
		if (isset($_POST['useCookies'])) $useCookies = intval(strip_tags(trim($_POST['useCookies'])));
		else $useCookies = 0;

		$query="INSERT INTO tbl_users(name, email, firstName, lastName, password, dateReg, useCookies) 
		VALUES ('$name', '$email', '$firstName', '$lastName','$pass','$created', '$useCookies')";
		$result = $mysqli->query($query) or die($mysqli->error.__LINE__);
	
		$query1 = "SELECT * FROM tbl_users WHERE name='$name'";
		$result1 = $mysqli->query($query1) or die($mysqli->error.__LINE__);

		
		if($result1->num_rows > 0) {
			while($row = $result1->fetch_assoc()) {
				$arr = $row;	
			}
		}
		echo json_encode($arr);	
	}	
} else {
	$resp = 'Request is empty!';
	echo json_encode($resp);
}
mysqli_close($mysqli);
?>