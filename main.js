var mysql = require('mysql');
var http = require('http'); //implementacja modułu http 
var url = require('url'); //implementacja modułu url
var fs = require('fs'); //filesystem
var nodemailer = require('nodemailer');
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{}); // socket io
var path = require("path");
var cookieParser = require('cookie-parser');

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

// nasłuchiwanie na porcie 8080
serv.listen(8080);
console.log('Server started.');



/* ------------------------------------------- */
/* Obsługa strony logowania */


app.use('/', express.static(__dirname + "/"));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

//Zarządzanie cookies
//Usuniecie ciasteczka
app.get('/logout', function(req, resp){
    resp.clearCookie('user', req.userID);
    resp.sendFile(path.join(__dirname+'/loginscreen.html')); 
}); 


//Wysłanie strony logowania podczas połączenia z serwerem
app.get('/', function(req, res){
   
    //Sprawdzenie czy ciasteczko jeszcze istnieje
    var cookieResult = req.cookies.user;
    var sql = "SELECT COUNT(user_id)AS userCount FROM user WHERE user_id='" + cookieResult + "';";
    con.query(sql, function (err, result, fields) {
          if(result[0].userCount === 1) res.sendFile(__dirname + '/snakemain.html');
          else res.sendFile(__dirname + '/loginscreen.html');
    });
});


//Zdefiniowanie post/send - Wysyła Mail
app.post('/send', (req, res) =>{
    //wiadomosc wysyłana
    const output =`
    <p> Witaj w snake web! </p>
    <ul>
       <li>Name: ${req.body.username}</li>
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
      var sql = "SELECT COUNT(user_id) AS userCount FROM user WHERE nickname='" + req.body.login_username + "' AND password='" + req.body.login_password +"' AND is_online = 0";
      con.query(sql, function (err, result, fields) {
          if (err) throw err;
          else{
            if(result[0].userCount === 1){
                
            //Ustawianie ciasteczka
            var userID = "SELECT user_id AS userID FROM user WHERE nickname='" + req.body.login_username + "' AND password='" + req.body.login_password + "';";
            con.query(userID, function (err, result, fields) {
                res.cookie('user', result[0].userID, {maxAge: (5 * 60 * 1000) }); //maxAge: [ms]
                
                 var is_online = "UPDATE user SET is_online=1 WHERE user_id = " + result[0].userID;
                    con.query(is_online, function (err, result, fields) {
                    if (err) throw err;
            });
            });
         
            //Wysłanie strony z grą
            res.sendFile(path.join(__dirname+'/snakemain.html')); 
            console.log("Zalogowano pomyslnie jako " + req.body.login_username + "!");
        
            }
            else {
                res.sendFile(__dirname + '/loginscreen.html');
                //Wyświetlenie komunikatu o niepoprawnym loginie i haśle
            } 
          }
      });
});




/*----------------------------------------------------*/
// Parametry gry
var RatX = 15;
var RatY = 15;

const WIDTH = 500;
const HEIGHT = 500;
const SNAKE_SIZE = 10;

/*----------------------------------------------------*/
/*Komunikacja Klient-Serwer: Obsługa gry*/
// odbiera żądania od klientów
io.sockets.on('connection', function(socket){
    console.log('socket connection');
   

    // pozycja fragmentu weza gracza
    socket.on('sendPlayerBody', function(data){
      var usid = data.user_id;
      var points = data.points;
      var timestamp = data.timestamp;

      // usun stare koordynaty gracza
      var delete_sql = "delete from player where user_id=" + usid;
      con.query(delete_sql, function (err, result, fields) {
        if (err) throw err;
        });

      var i;
      // dodaj informacje o nowych koordynatach
      var sql = "insert into player (user_id, fragment, posX, posY, points, timestamp) values";
      for(i = 0; i < data.length; i++){
        sql += "(" + usid + "," + data.body[i].fragment + "," + data.body[i].posX + "," + data.body[i].posY;
        sql += "," + points + "," + timestamp + "),";
      }
      sql = sql.slice(0, -1);

      // wyślij do bazy danych
      con.query(sql, function (err, result, fields) {
      if (err) throw err;
      });
    });

    // zaktualizuj koordynaty gracza
    socket.on('updatePlayerBody', function(data){
      var usid = data.user_id;
      var points = data.points;
      var timestamp = data.timestamp;
      var sql;

      CheckApple(data.body[0].posX, data.body[0].posY);
      CheckCollision(data.body[0].posX, data.body[0].posY, usid, function(err, flag){
        if (flag)
          socket.emit('sendCollision', {});
        else{
          for(var i = 0; i < data.length; i++){
            sql = "update player set ";
            sql += "posX=" + data.body[i].posX;
            sql += ",posY=" + data.body[i].posY;
            sql += ",points=" + points;
            sql += ",timestamp=" + timestamp;
            sql += " where user_id=" + usid + " and fragment=" + data.body[i].fragment;

            // wyślij do bazy danych
            con.query(sql, function (err, result, fields) {
            if (err) throw err;
            });
          }
      }});
    });

    // zapytanie o pozycje innych wezy przez gracza
    socket.on('getSnakes', function(data){
      var sql = "select * from player where user_id != " + data.user_id;
      con.query(sql, function (err, result, fields) {
        if (err) throw err;
        else{
          socket.emit('returnSnakes', {
            snakes: result,
            length: result.length
          });
        }
      });
    });

    // zapytanie o pozycje jedzenia
    socket.on('getApple', function(data){
      socket.emit('returnApple', {
        posX: RatX,
        posY: RatY
      });
    });

    // usun lokalizacje gracza po przegranej
    socket.on('playerGameOver', function(data){
      // usun koordynaty gracza
      var delete_sql = "delete from player where user_id=" + data.user_id;
      con.query(delete_sql, function (err, result, fields) {
        if (err) throw err;
        });
    });
    
    socket.on('getScores', function(data){
      var sql = "SELECT u.nickname AS nicks, p.points AS points FROM player AS p INNER JOIN user AS u ON p.user_id = u.user_id GROUP BY u.nickname ORDER BY p.points DESC";
      con.query(sql, function (err, result, fields) {
            if (err) throw err;
            else{
                socket.emit('setScores', {
                       scores: result,
                       length: result.length
               });
            }
      });
    });
    
    //Wylogowanie gracza
    socket.on('Logout', function(data){
        console.log("Wylogowano uzytkownika " + data.user_id);
        var sql = "UPDATE user SET is_online=0 WHERE user_id = " + data.user_id;
        con.query(sql, function (err, result, fields){
             if (err) throw err;
        });
       var delete_sql = "delete from player where user_id=" + data.user_id;
       con.query(delete_sql, function (err, result, fields) {
        if (err) throw err;
        });
    });
    
    //Jeśli ciasteczko istnieje, użytkownik jest ciągle zalogowany
    socket.on('StillLogin', function(data){
        console.log("Zalogowano uzytkownika " + data.user_id);
        var sql = "UPDATE user SET is_online=1 WHERE user_id = " + data.user_id;
        con.query(sql, function (err, result, fields){
             if (err) throw err;
        });
    });
    
});
/*----------------------------------------------------*/


// sprawdz czy wąż ma kolizję z jabłkiem
function CheckApple(x, y){
  if (RatX === x && RatY === y){ 
    RatX = Math.floor(Math.random() * (WIDTH/SNAKE_SIZE));
    RatY = Math.floor(Math.random() * (WIDTH/SNAKE_SIZE));
    return true;
  }
  else
    return false;
}

// sprawdź czy wąż ma kolizję z innym wężem
function CheckCollision(x, y, usid, callback){
  var sql = "select * from player where user_id != " + usid;

  con.query(sql, function (err, result, fields) {
    if (err) throw err;

    var collis = false;
    for(var i = 0; i < result.length; i++){
      if(result[i].posX == x && result[i].posY == y)
        {
          collis = true;
          break;
        }
    }
    callback(null, collis);
  });
}