<?php
//ATTACH define location to move file 
if (isset($_FILES['ticket_attach'])) {
    $fname = str_replace(",", "+", $_FILES['ticket_attach']['name']);
    $fname = str_replace("'", "", $fname);
    $pinfo = pathinfo($fname);
    $icn = findIcon("." . $pinfo['extension'], '1x');
    $fname .= "," . $ufname = md5(time() . $pinfo['filename']) . "." . $pinfo['extension'];
    $fr = @copy($_FILES['ticket_attach']['tmp_name'], ATTACH . "/$ufname");
    $error = ob_get_contents();
    @ob_end_clean();
    echo json_encode(array("error" => $error, "fname" => $fname, 'icon' => $icn));
}
