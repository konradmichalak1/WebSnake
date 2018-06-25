// drawModule init
var drawModule = new DrawModule(context);

var pom = getCookie('user');
// new socket io
var socket = io();
var dbcont = new DBController(socket);

// start button listener
var startButton = document.getElementById('startButton');
startButton.addEventListener("click", InitGame);

// keys logic - built-in function .onkeydown
var KeyLock = false;
document.onkeydown = function(e) {
    
    var key = e.keyCode;
  

    if (key == LEFT_KEY && !KeyLock) {
        
        if (direction != 'right')
            direction = 'left';
        
        KeyLock = true;
        event.returnValue = false;
    }

    if (key == RIGHT_KEY && !KeyLock) {
        
        if (direction != 'left')
            direction = 'right';

        KeyLock = true;
        event.returnValue = false;
    }

    if (key == UP_KEY && !KeyLock) {
        
        if (direction != 'down')
            direction = 'up';

        KeyLock = true;
        event.returnValue = false;
    }

    if (key == DOWN_KEY && !KeyLock) {
        
        if (direction != 'up')
            direction = 'down';
        
        KeyLock = true;
        event.returnValue = false;
    }  
      
    
}; 

function wyloguj(){
    
    dbcont.LogoutFromServer(UserID);
}
function zaloguj(){
    
    if(UserID>0) dbcont.StillLogin(UserID);
}

//get cookie value
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      UserID = c.substring(name.length, c.length);
    }
  }
}

// initialize game
function InitGame()
{
    // set init values
    SetDefeault();
    // get players from database
    dbcont.GetSnakeBodies(UserID);
    dbcont.GetAppleLocation();

    // initialize snake
    drawModule.InitSnake();

    // draw first frame of game
    drawModule.Paint();

    // notify server about new player localization
    dbcont.SendSnakeBody(UserID, drawModule.ReturnSnakeBody(), Score);

    // begin game loop
    RefreshInterval = setInterval(Gameloop, DELAY);
}

// main game loop
function Gameloop()
{
    if (InGame)
    {
        // get players from database
        dbcont.GetSnakeBodies(UserID);
        // get apple location from database
        dbcont.GetAppleLocation();

        // render movement
        var eated = drawModule.UpdateSnakeBody();
        if(drawModule.CheckCollisionWithSnake())
            InGame = false;
        if(drawModule.CheckCollisionWithBorders())
            InGame = false;

        // draw snakes & apples
        drawModule.Paint();

        // send current snake body location
        if (eated) dbcont.SendSnakeBody(UserID, drawModule.ReturnSnakeBody(), Score); 
        else dbcont.UpdateSnakeBody(UserID, drawModule.ReturnSnakeBody(), Score);

        KeyLock = false;
        drawtable();
    }
    else
    {
        // notify server about game over
        dbcont.NotifyAboutGameOver(UserID, Score);

        // clear game loop
        clearInterval(RefreshInterval);
        DrawSummary();
    }
}

// go back to start values
function SetDefeault()
{
    startButton.disabled = true;
    InGame = true;
    direction = 'right';
    
    // reset score
    Score = 0;
}

// game over related function
var alpha = 0.0;
var delta = 0.1;

function DrawSummary()
{
    context.font = "small-caps 30px sans-serif";

    var my_gradient = context.createLinearGradient(0,0,170,0);
    my_gradient.addColorStop(0,"#331a00");
    my_gradient.addColorStop(1,"#804200");
    context.fillStyle = my_gradient;
    context.textAlign = "center";
    context.shadowBlur = 5;

    SummaryInterval = setInterval(loop, DELAY + 50);
}

function loop()
{
    alpha += delta;
    context.globalAlpha = alpha;
    if (alpha > 1){
        clearInterval(SummaryInterval);
        startButton.disabled = false;
    }

    context.fillText("Game over", mainBoard.width/2, mainBoard.height/2-30); 
    context.fillText("Try again", mainBoard.width/2, mainBoard.height/2);

    context.fillText(`Your score: ${Score}`, mainBoard.width/2, mainBoard.height/2+55)
}

/*Rysowanie tabeli wyników*/
function drawtable(){

    dbcont.GetUsersScore();
    var rows = RowsNumber;

    var cols = 2;
    
    var table="";
    table+="<tr><th>User Name</th><th>Score</th></tr>";
            
    for(var r = 0; r< rows; r++)
    {
        table+='<tr>';

            table+='<td>'  + Scores[r].nicks + '</td>';
            table+='<td>'  + Scores[r].points + '</td>';
        table += '</tr>';
    }
    
    document.getElementById('scores').innerHTML = table;
}