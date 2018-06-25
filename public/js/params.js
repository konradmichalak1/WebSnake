// constants
const COLOR_GREEN = '#3dce4e';
const COLOR_DARKGREEN = '#2b6332';
const COLOR_LIGHTGREEN = '#a9f2b2';
const COLOR_BLACK = '#000000';

// keys codes
const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const UP_KEY = 38;
const DOWN_KEY = 40;

// snake properties
const SNAKE_SIZE = 10;

// board properties
const WIDTH = 500;
const HEIGHT = 500;

// direction flags: {'left', 'right', 'up', 'down'}
var direction = 'right';

// control game flow
const DELAY = 80;
var InGame = true;
var RandomSeed = 1252352;
var RefreshInterval;
var SummaryInterval;
var mouse_pos_x;
var mouse_pos_y;


// get canvas
var mainBoard = document.getElementById('mainboard');
var context = mainBoard.getContext('2d');

mainBoard.width = WIDTH;
mainBoard.height = HEIGHT;

// player info
var Score = 0;
var UserID = 0;

// other players
var OtherPlayerSnakes = [];

var Scores = [];
var RowsNumber;