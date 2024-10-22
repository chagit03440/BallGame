var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';

var GAMER_IMG = '<img src="../img/gamer.png" />';
var BALL_IMG = '<img src="../img/ball.png" />';

var gBoard;
var gGamerPos;
var gBallsOnBoard = 0;
var gBallsCollected = 0;
var gBallInterval;

function initGame() {
    gGamerPos = { i: 2, j: 9 };
    gBallsOnBoard = 2; // Initially 2 balls
    gBallsCollected = 0;
    gBoard = buildBoard();
    renderBoard(gBoard);

    // Add balls at intervals (every 3 seconds)
    gBallInterval = setInterval(addRandomBall, 3000);
}

// Restart the game
function restartGame() {
    clearInterval(gBallInterval);
    document.getElementById('ball-count').innerText = 0;
    document.getElementById('victory-message').style.display = 'none';
    initGame();
}

// Build the initial board with walls and open sections
function buildBoard() {
    var board = new Array(9); // Create a 9-row board
    for (var i = 0; i < board.length; i++) {
        board[i] = new Array(11); // Each row has 11 columns
    }

    // Set up walls and floors
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = { type: FLOOR, gameElement: null };

            // Create the outer walls but leave a 3-cell open section in the middle of each side
            if (i === 0 || i === board.length - 1) {
                // Top and bottom walls, but with a 3-cell open section in the middle
                if (!(j >= 4 && j <= 6)) {
                    cell.type = WALL;
                }
            } else if (j === 0 || j === board[0].length - 1) {
                // Left and right walls, but with a 3-cell open section in the middle
                if (!(i >= 3 && i <= 5)) {
                    cell.type = WALL;
                }
            }

            board[i][j] = cell;
        }
    }

    // Place the gamer and initial balls in the playable area
    gGamerPos = { i: 4, j: 5 }; // Player starts inside the open section of the walls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
    board[3][8].gameElement = BALL; // Example ball position
    board[6][2].gameElement = BALL;

    return board;
}


// Add a ball to a random position on the board
function addRandomBall() {
    var emptyCells = getEmptyCells();
    if (!emptyCells.length) return; // No more empty cells

    var randomIdx = Math.floor(Math.random() * emptyCells.length);
    var emptyCell = emptyCells[randomIdx];
    gBoard[emptyCell.i][emptyCell.j].gameElement = BALL;

    gBallsOnBoard++;
    renderCell(emptyCell, BALL_IMG);
}

// Get all empty cells (where there's no game element)
function getEmptyCells() {
    var emptyCells = [];
    for (var i = 1; i < gBoard.length - 1; i++) {
        for (var j = 1; j < gBoard[i].length - 1; j++) {
            if (gBoard[i][j].gameElement === null) {
                emptyCells.push({ i: i, j: j });
            }
        }
    }
    return emptyCells;
}

// Render the board to an HTML table
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j });

            cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall';

            strHTML += `<td class="cell ${cellClass}" onclick="moveTo(${i}, ${j})">\n`;

            switch (currCell.gameElement) {
                case GAMER:
                    strHTML += GAMER_IMG;
                    break;
                case BALL:
                    strHTML += BALL_IMG;
                    break;
            }

            strHTML += '</td>\n';
        }
        strHTML += '</tr>\n';
    }
    document.querySelector('.board').innerHTML = strHTML;
}

function moveTo(i, j) {
    var boardRows = gBoard.length;
    var boardCols = gBoard[0].length;

    // Handle wrapping when moving left-right or top-bottom in open sections
    if (i === 0 && (j >= 4 && j <= 6)) i = boardRows - 1; // Wrap from top open section to bottom open section
    else if (i === boardRows - 1 && (j >= 4 && j <= 6)) i = 0; // Wrap from bottom to top

    if (j === 0 && (i >= 3 && i <= 5)) j = boardCols - 1; // Wrap from left open section to right open section
    else if (j === boardCols - 1 && (i >= 3 && i <= 5)) j = 0; // Wrap from right to left

    var targetCell = gBoard[i][j];
    if (targetCell.type === WALL) return; // Don’t allow moving through actual walls

    // Calculate the distance to make sure we are moving to a neighbor cell
    var iAbsDiff = Math.abs(i - gGamerPos.i);
    var jAbsDiff = Math.abs(j - gGamerPos.j);

    // If the clicked cell is a neighbor or a wrapped edge
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || iAbsDiff > 1 || jAbsDiff > 1) {

        if (targetCell.gameElement === BALL) {
            gBallsCollected++;
            gBallsOnBoard--;
            document.getElementById('ball-count').innerText = gBallsCollected;

            // Check for victory
            if (gBallsOnBoard === 0) {
                clearInterval(gBallInterval);
                document.getElementById('victory-message').style.display = 'block';
            }
        }

        // Moving from current position (model)
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
        renderCell(gGamerPos, ''); // Remove gamer image from current position (DOM)

        // Update the new position (model)
        gGamerPos.i = i;
        gGamerPos.j = j;
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

        // Update the new position (DOM)
        renderCell(gGamerPos, GAMER_IMG);
    }
}


// Render a cell's value (used for updating the DOM)
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location);
    document.querySelector(cellSelector).innerHTML = value;
}

// Handle keyboard arrow keys to move the player
function handleKey(event) {
    var i = gGamerPos.i;
    var j = gGamerPos.j;

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1);
            break;
        case 'ArrowRight':
            moveTo(i, j + 1);
            break;
        case 'ArrowUp':
            moveTo(i - 1, j);
            break;
        case 'ArrowDown':
            moveTo(i + 1, j);
            break;
    }
}

// Get the class name for a cell
function getClassName(location) {
    return `cell-${location.i}-${location.j}`;
}
