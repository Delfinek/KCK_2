<?php
//phpinfo();
//echo session_save_path();
session_start();
$_SESSION['timestamp'] = time();
$dir = new DirectoryIterator(session_save_path());
$s = 0;
foreach($dir as $fileinfo){
	$s++;
	$filename =  $fileinfo->getFilename();
	if(preg_match('/sess_/', $filename)>0){
		$path = session_save_path() . "/$filename";
		echo $path;
		echo "<br/>";
	}
}
echo $s;