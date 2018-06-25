class DBController{

    constructor(socketio){
        this.socket = socketio;
    }

    GetUsersScore(){
        this.socket.emit('getScores');
        this.socket.on('setScores', function(data){
            RowsNumber = data.length,
            Scores = data.scores;
           
        });
    }
    
    LogoutFromServer(userid){
        this.socket.emit('Logout', {user_id: userid});
    }

    StillLogin(userid){
        this.socket.emit('StillLogin', {user_id: userid});
    }
    
    
    SendSnakeBody(userid, snakeBody, pts){
        var today = new Date();
        var pack = [];

        for(var i = 0; i < snakeBody.length; i++){
            pack.push({
                fragment: i,
                posX: snakeBody[i].x,
                posY: snakeBody[i].y
            });
        }

        var header = {
            user_id:userid,
            points: pts,
            timestamp: today.getTime(),
            length : snakeBody.length,
            body: pack
        };
        this.socket.emit('sendPlayerBody', header);
    }

    UpdateSnakeBody(userid, snakeBody, pts){
        var today = new Date();
        var pack = [];

        for(var i = 0; i < snakeBody.length; i++){
            pack.push({
                fragment: i,
                posX: snakeBody[i].x,
                posY: snakeBody[i].y
            });
        }

        var header = {
            user_id:userid,
            points: pts,
            timestamp: today.getTime(),
            length : snakeBody.length,
            body: pack
        };
        this.socket.emit('updatePlayerBody', header);

        this.socket.on('sendCollision', function(data){
            InGame = false;
        });
    }

    GetSnakeBodies(usid){
        this.socket.emit('getSnakes', { user_id: usid});

        this.socket.on('returnSnakes', function(data){
            OtherPlayerSnakes = data.snakes;
        });
    }

    GetAppleLocation(){
        this.socket.emit('getApple', {});

        this.socket.on('returnApple', function(data){
            mouse_pos_x = data.posX,
            mouse_pos_y = data.posY;
        });
    }

    NotifyAboutGameOver(usid, score){
        this.socket.emit('playerGameOver', {
            user_id: usid,
            points: score
        });
    }
}
