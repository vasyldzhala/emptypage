<?php 
include 'dbaccess.php';
$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if (isset($_REQUEST['jsonData'])) {
	$postData = json_decode($_REQUEST['jsonData']);
	$urls = explode(",", $postData->{'URL'}); 

	if (isset($postData->{'albumID'})) {
		$albumID = intval(strip_tags(trim($postData->{'albumID'})));
	} else $albumID = 1;
	if (isset($postData->{'userID'})) {
		$userID = intval(strip_tags(trim($postData->{'userID'})));
	} else $albumID = 1;
	if (isset($postData->{'title'})) {
		$title = strip_tags(trim($postData->{'title'}));
		$title = $mysqli->real_escape_string($title);
	} else $title = "***";
	if (isset($postData->{'description'})) {
		$description = strip_tags(trim($postData->{'description'}));
		$description = $mysqli->real_escape_string($description);		
	} else $description = '***';
	$datePub = time();

	for ($i=0; $i < sizeof($urls); $i++) { 
		$url = trim($urls[$i]);
		if (strlen($url) > 0) {
			$query="INSERT INTO tbl_images(URL, albumID, userID, title, description, datePub) 
				VALUES ('$url', '$albumID', '$userID', '$title', '$description', '$datePub')";
			$result = $mysqli->query($query) or die($mysqli->error.__LINE__);
			$query1="UPDATE tbl_albums SET numberOfItems = numberOfItems + 1, dateUpd = '$datePub' WHERE id='$albumID'";
			$result1 = $mysqli->query($query1) or die($mysqli->error.__LINE__);
		}
	}
	echo "OK";
} else {
	echo "Oops, something is wrong";
}
mysqli_close($mysqli);
?>

