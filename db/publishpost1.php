<?php 
include 'dbaccess.php';
$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

//echo print_r($_REQUEST,true);
$data = json_decode(file_get_contents('php://input'));
//echo print_r($data,true);


if (isset($data->{'title'})) {
	$title = strip_tags(trim($data->{'title'}));
	$title = $mysqli->real_escape_string($title);	
	if (isset($data->{'subject'})) {
		$subject = strip_tags(trim($data->{'subject'}));
		$subject = $mysqli->real_escape_string($subject);		
	} else $subject = '';
	if (isset($data->{'writerID'})) {
		$writerID = intval(strip_tags(trim($data->{'writerID'})));
	} else $writerID = 1;
	if (isset($data->{'writer'})) {
		$writer = strip_tags(trim($data->{'writer'}));
		$writer = $mysqli->real_escape_string($writer);	
	} else $writer = '';
	if (isset($data->{'imageURL'})) $imageURL = trim($data->{'imageURL'}); else $imageURL = '';
	$datePub = time();
	if (isset($data->{'content'})) {
		$content = strip_tags(trim($data->{'content'}), 
		'<p><a><br><img><strong><del>');
		$content = $mysqli->real_escape_string($content);				
	} else $content = '';
	if (isset($data->{'categoryID'})) {
		$categoryID = intval(strip_tags(trim($data->{'categoryID'})));
	} else $categoryID = 1;

	$query="INSERT INTO tbl_blog(title, subject, writerID, writer, imageURL, datePub, content, categoryID) 
		VALUES ('$title', '$subject', '$writerID', '$writer', '$imageURL', '$datePub', '$content', '$categoryID')";
	$result = $mysqli->query($query) or die($mysqli->error.__LINE__);
	
	$query0 = "UPDATE tbl_category SET numberOfItems = numberOfItems + 1, dateUpd = '$datePub'   
		WHERE id='$categoryID'";
	$result0 = $mysqli->query($query0) or die($mysqli->error.__LINE__);

} else {
	echo json_encode('Request is empty!');
}

mysqli_close($mysqli);
?>

