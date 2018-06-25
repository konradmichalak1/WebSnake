var mysql = require('mysql');
var http = require('http'); //implementacja modułu http 
var url = require('url'); //implementacja modułu url
var fs = require('fs'); //filesystem
var nodemailer = require('nodemailer');
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var cookies = require( "cookies" )

var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(server,{}); // socket io

var path = require("path");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}));

var user = {user_id:"", nickname:"", email:"" };

//Zdefiniowanie serwera bazy danych
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database:"snake_users"
});
//Połączenie z bazą danych
con.connect(function(err) {
      if (err) throw err;
      console.log("Connected with Database!");
});

//Przygotowanie bazy SQL
/*  
var sql = "CREATE TABLE user (user_id INT NOT NULL AUTO_INCREMENT, nickname VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL , PRIMARY KEY (user_id))";
var sql = "CREATE TABLE player (player_id INT NOT NULL AUTO_INCREMENT, user_id INT NOT NULL, fragment INT NOT NULL, posX INT NOT NULL, posY INT NOT NULL, points INT NOT NULL, timestamp DATETIME NOT NULL, PRIMARY KEY (player_id))";
var sql = "INSERT INTO user (nickname, password, email) VALUES ('admin', 'admin', 'w3bsnake@gmail.com' )";
  con.query(sql, function (err, result, fields) {
      if (err) throw err;
     //console.log("Login: " + result[0].nickname + " Password:" +result[0].password);
});
*/

//Nasłuchiwanie serwera
var server = app.listen(8080, ()=> console.log('Server started...'));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
   res.sendFile(path.join(__dirname+'/loginscreen.html'));
});

//Zdefiniowanie post/send - Wysyła Mail
app.post('/send', (req, res) =>{
    //wiadomosc wysyłana
    const output =`
    <p> Witaj w snake web! </p>
    <ul>
       <li>Name: ${req.body.username}</li>
       <li>Password: ${req.body.password}</li>
       <li>Email: ${req.body.email}</li>
    </ul>`;

    //Określenie kto wysyła mail
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      port: 25,
      auth: {
        user: 'w3bsnake@gmail.com',
        pass: 'Websnake1'
      },
      tls: {
          rejectUnauthorized: false
      }
    });

    //Ustawienia maila
    var mailOptions = {
      from: '"Web Snake" <w3bsnake@gmail.com>',
      to: req.body.email,
      subject: 'Pomyślna rejestracja!',
      text: 'Witaj!',
      html: output
    };

    //Wysyłanie maila
    transporter.sendMail(mailOptions, (error, info)=>{
      if (error) {
        return console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    
    //Zapisanie uzytkownika do bazy danych

    //Wykonanie operacji SQL
    var sql = "INSERT INTO user (nickname, password, email) VALUES ('" + req.body.username + "', '" + req.body.password + "', '" + req.body.email + "');";
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
    });
    
    res.sendFile(path.join(__dirname+'/loginscreen.html')); 
    console.log("Dodano nowego użytkownika " + req.body.username);
    req.body.loginspan = "Registration completed successfully!";
});

//POST do logowania
app.post('/play', (req, res) =>{
      //Wykonanie operacji SQL
      var sql = "SELECT COUNT(user_id)AS userCount FROM user WHERE nickname='" + req.body.login_username + "' AND password='" + req.body.login_password + "';";
      
      con.query(sql, function (err, result, fields) {
          if (err) throw err;
          else{
            if(result[0].userCount === 1){
            user.nickname=req.body.login_username;
            
            res.sendFile(path.join(__dirname+'/snakemain.html')); 
            console.log("Zalogowano pomyslnie jako " + user.nickname + "!");
            //Ustawianie ciasteczka
            }
            else {
                //Wyświetlenie komunikatu o niepoprawnym loginie i haśle
                 //res.sendFile(path.join(__dirname+'/loginscreen.html'));
            } 
          }
      });
});

//Zarządzanie cookies

//nazwa_ciastka, wartość, czas_wygaśnięcia_w_dniach
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

io.sockets.on('connection', function(socket){
    console.log('socket connection');
});