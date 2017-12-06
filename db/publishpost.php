<?php 
include 'dbaccess.php';
$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if (isset($_POST['title'])) {
	$title = strip_tags(trim($_POST['title']));
	$title = $mysqli->real_escape_string($title);	
	if (isset($_POST['subject'])) {
		$subject = strip_tags(trim($_POST['subject']));
		$subject = $mysqli->real_escape_string($subject);		
	} else $subject = '';
	if (isset($_POST['writerID'])) {
		$writerID = intval(strip_tags(trim($_POST['writerID'])));
	} else $writerID = 1;
	if (isset($_POST['writer'])) {
		$writer = strip_tags(trim($_POST['writer']));
		$writer = $mysqli->real_escape_string($writer);	
	} else $writer = '';
	if (isset($_POST['imageURL'])) $imageURL = trim($_POST['imageURL']); else $imageURL = '';
	$datePub = time();
	if (isset($_POST['content'])) {
		$content = strip_tags(trim($_POST['content']), 
		'<p><a><br><img><strong><del>');
		$content = $mysqli->real_escape_string($content);				
	} else $content = '';
	if (isset($_POST['categoryID'])) {
		$categoryID = intval(strip_tags(trim($_POST['categoryID'])));
	} else $categoryID = 1;

	$query="INSERT INTO tbl_blog(title, subject, writerID, writer, imageURL, datePub, content, categoryID) 
		VALUES ('$title', '$subject', '$writerID', '$writer', '$imageURL', '$datePub', '$content', '$categoryID')";
	$result = $mysqli->query($query) or die($mysqli->error.__LINE__);
	
	$query0 = "UPDATE tbl_category SET numberOfItems = numberOfItems + 1, dateUpd = '$datePub'   
		WHERE id='$categoryID'";
	$result0 = $mysqli->query($query0) or die($mysqli->error.__LINE__);

	$query1 = "SELECT * FROM tbl_blog WHERE datePub='$datePub'";
	$result1 = $mysqli->query($query1) or die($mysqli->error.__LINE__);
		
	if($result1->num_rows > 0) {
		while($row = $result1->fetch_assoc()) {
			$arr = $row;	
		}
	}
	echo json_encode($arr);	
} else {
	$resp = 'Request is empty!';
	echo json_encode($resp);
}

mysqli_close($mysqli);
?>

