<?php


function clean($value){
    $value = trim($value);
    $value = stripslashes($value);
    $value = strip_tags($value);
    $value = htmlspecialchars($value);
    return $value;
}

// $name = clean($_POST["name"]);
// $phone = clean($_POST["phone"]);
$object = "object";

echo $object;


// use PHPMailer\PHPMailer\PHPMailer;
// use PHPMailer\PHPMailer\Exception;

// require 'PHPMailer/src/Exception.php';
// require 'PHPMailer/src/PHPMailer.php';
// require 'PHPMailer/src/SMTP.php';


// //получаем экземпляр
//     $mail = new PHPMailer();
// //задаём как  работать с SMTP сервером
//     $mail->IsSMTP();
// //адрес smtp сервера
//     $mail->Host       = "smtp.yandex.ru";
// //сообщения дебагера, 0-не показываем
//     $mail->SMTPDebug  = 0;
// //если сервер требует авторизации
//     $mail->SMTPAuth   = true;
// //тип шифрования
//     $mail->SMTPSecure = "ssl";
// //порт сервера
//     $mail->Port       = 465;
// //приоритет почты, 3 - нормально
//     $mail->Priority    = 3;
// //кодировка
//     $mail->CharSet     = 'UTF-8';
//     $mail->Encoding    = '8bit';
// //тема письма
//     $mail->Subject     = $name." — ".$phone;
//     $mail->ContentType = "text/html; charset=utf-8\r\n";
// //адрес почтового ящика gmail
//     $mail->Username   = "khidarovweb@yandex.ru";
// //ваш пароль от ящика
//     $mail->Password   = 'Gt726cjs';
//     $mail->isHTML(true);
// //текст письма
//     $mail->Body = "Имя: ".$name."<br>"."Телефон: ".$phone;
//     $mail->WordWrap = 50;
// //от кого письмо
//     $mail->SetFrom('khidarovweb@yandex.ru');
// //адрес, на который нужно отправить письмо
//     // doctorkhidarov@gmail.com
//     $mail->AddAddress("doctorkhidarov@gmail.com");
//     if(!$mail->send()) {
//     //   echo $mail->ErrorInfo;
//       exit;
//     }
// echo 'сообщение отправлено';



?>
