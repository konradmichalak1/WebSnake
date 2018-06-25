class DrawModule{

    
    constructor(context){
        this.ctx = context;
        this.snakeBody = [];

        console.log(`WIDTH: ${WIDTH/20}, HEIGHT: ${HEIGHT/20}`)
    }

    ReturnSnakeBody(){
        return this.snakeBody;
    }

    DrawSnakeBody(x, y){
        this.ctx.fillStyle = COLOR_GREEN;
        this.ctx.fillRect(x*SNAKE_SIZE, y*SNAKE_SIZE, SNAKE_SIZE, SNAKE_SIZE);

        this.ctx.strokeStyle = COLOR_DARKGREEN;
        this.ctx.strokeRect(x*SNAKE_SIZE, y*SNAKE_SIZE, SNAKE_SIZE, SNAKE_SIZE);
    }

    DrawMouse(x, y){
        this.ctx.fillStyle = COLOR_BLACK;
        this.ctx.fillRect(x*SNAKE_SIZE, y*SNAKE_SIZE, SNAKE_SIZE, SNAKE_SIZE);

        this.ctx.strokeStyle = COLOR_DARKGREEN;
        this.ctx.strokeRect(x*SNAKE_SIZE, y*SNAKE_SIZE, SNAKE_SIZE, SNAKE_SIZE);
    }

    InitSnake(){
        var snake_init_size = 4;
        this.snakeBody = [];

        for(var i = snake_init_size - 1; i >= 0; i--){
            this.snakeBody.push({x:i, y:0});
        }

    }

    CheckCollisionWithMouse(){
        var pos_x = this.snakeBody[0].x;
        var pos_y = this.snakeBody[0].y;
        if (mouse_pos_x == pos_x && mouse_pos_y == pos_y){
            Score++;
            return true;
        }
        else{
            return false;
        }
    }

    CheckCollisionWithSnake()
    {
        var head_pos_x = this.snakeBody[0].x;
        var head_pos_y = this.snakeBody[0].y
        for(var i = 1; i < this.snakeBody.length; i++){
            if(head_pos_x == this.snakeBody[i].x && head_pos_y == this.snakeBody[i].y)
                return true;
        }
        
        return false;
    }

    CheckCollisionWithBorders()
    {
        var head_pos_x = this.snakeBody[0].x;
        var head_pos_y = this.snakeBody[0].y

        if (head_pos_x < 0 || head_pos_x >= WIDTH/SNAKE_SIZE)
            return true;
        else if (head_pos_y < 0 || head_pos_y >= HEIGHT/SNAKE_SIZE)
            return true;

        return false;
    }

    UpdateSnakeBody()
    {
        var snake_pos_x = this.snakeBody[0].x;
        var snake_pos_y = this.snakeBody[0].y;

        if (direction == 'left'){
            snake_pos_x--;
        }
        else if (direction == 'right'){
            snake_pos_x++;
        }
        else if (direction == 'up'){
            snake_pos_y--;
        }
        else if (direction == 'down'){
            snake_pos_y++;
        }

        if (this.CheckCollisionWithMouse()){
            this.snakeBody.unshift({x:snake_pos_x, y:snake_pos_y});
            mouse_pos_x = -1;
            mouse_pos_y = -1;
            
            return true;
        }
        else{
            this.snakeBody.unshift({x:snake_pos_x, y:snake_pos_y});
            var tail = this.snakeBody.pop();

            return false;
        }
    }

    Paint(){
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT)

        // draw game background
        this.ctx.fillStyle = COLOR_LIGHTGREEN;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
        this.ctx.strokeStyle = COLOR_BLACK;
        this.ctx.strokeRect(0, 0, WIDTH, HEIGHT);

        // draw snake
        for(var i = 0; i < this.snakeBody.length; i++){
            this.DrawSnakeBody(this.snakeBody[i].x, this.snakeBody[i].y)
        }

        // draw other snakes
        for(var i = 0; i < OtherPlayerSnakes.length; i++){
            this.DrawSnakeBody(OtherPlayerSnakes[i].posX, OtherPlayerSnakes[i].posY);
        }

        // draw mouse
        this.DrawMouse(mouse_pos_x, mouse_pos_y);
    }

    PrintSnake(){
        for(var i = 0; i < this.snakeBody.length; i++){
            console.log(`${i} - x: ${this.snakeBody[i].x} y: ${this.snakeBody[i].y}`)
        }
    }
}