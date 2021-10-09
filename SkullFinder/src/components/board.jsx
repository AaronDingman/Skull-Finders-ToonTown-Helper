import { createSignal} from "solid-js";

const bombMarker = `10`
const visitedMarker = `~`
const untouchedMarker = `0`
var canClickButtons = true;


const initializeBoard = (board, arrayHeight, arrayWidth) => {
    // Initialize board with no bombs
    for (let i = 0; i < arrayHeight; i++) {
        // -1 because the last row never has bombs
        for (let j = 0; j < arrayWidth; j++) {
            board[i][j] = untouchedMarker;
        }
    }
    return board;
}

const initializeSafeHomeRow = (board, arrayHeight, arrayWidth) => {
    for (let i = 0; i < arrayHeight; i++) {
        board[arrayWidth - 1][i] = untouchedMarker;
    }
    return board;
}
const initializeBombsArray = (bombsArray, arrayHeight, arrayWidth) => {
    for (let i = 0; i < arrayHeight - 1; i++) {
        // -1 because the last row never has bombs
        for (let j = 0; j < arrayWidth; j++) {
            bombsArray[i][j] = Math.random();
        }
    }
    return bombsArray;
}

const isMine = (row, col, board) => {
    if (board[row][col] == bombMarker) { return true; }
    return false;
}
const isValid = (row, column) => {
    if (
        (row >= 0 && row < arrayWidth)
        && (column >= 0 && column < arrayHeight)
    ) return true;
    return false;
}

const getCountOfAdjacentBombs = (row, col, board) => {
    var count = 0;
    if (board[row][col] != bombMarker) {
        // up
        if (isValid(row - 1, col, board) == true) { if (isMine(row - 1, col, board) == true) count++; };

        // down
        if (isValid(row + 1, col, board) == true) { if (isMine(row + 1, col, board) == true) count++; };

        // right
        if (isValid(row, col + 1, board) == true) { if (isMine(row, col + 1, board) == true) count++; };

        //left
        if (isValid(row, col - 1, board) == true) { if (isMine(row, col - 1, board) == true) count++; };

        //up right
        if (isValid(row - 1, col + 1, board) == true) { if (isMine(row - 1, col + 1, board) == true) count++; };

        // up left
        if (isValid(row - 1, col - 1, board) == true) { if (isMine(row - 1, col - 1, board) == true) count++; };

        // down right
        if (isValid(row + 1, col + 1, board) == true) { if (isMine(row + 1, col + 1, board) == true) count++; };

        // down left
        if (isValid(row + 1, col - 1, board) == true) { if (isMine(row + 1, col - 1, board) == true) count++; };

        return count;
    }
    // If it's a bomb, we want to leave it as such. Non bombs without adjacent bombs will get a count of 0 which is exepected
    return bombMarker;
}

const updateBoardWithBombs = (board, bombsArray, arrayHeight, arrayWidth, maxBombs) => {
    let currentHighest = 0;
    let currentHighestJ = 0;
    let currentHighestK = 0;

    for (let i = 0; i < maxBombs; i++) {
        for (let j = 0; j < arrayHeight; j++) {
            // -1 because the last row never has bombs
            for (let k = 0; k < arrayWidth; k++) {
                if (bombsArray[j][k] > currentHighest) {
                    currentHighest = bombsArray[j][k];
                    currentHighestJ = j;
                    currentHighestK = k;
                }
            }
        }
        // Setting the value at the position where the bomb should 
        board[currentHighestJ][currentHighestK] = bombMarker

        // Setting the current highest value to 0 so we skip over it next time. 
        bombsArray[currentHighestJ][currentHighestK] = 0

        // Resetting values of the current highest to 0
        currentHighest = 0;
        currentHighestJ = 0;
        currentHighestK = 0;
    }
    return board;
}

const updateBoardWithBombDistanceCounters = (board) => {
    board.map((items, row) => {
        // item even if unused, needs to be here for some reason, ui breaks if it's removed. 
        items.map((_, col) => {
            board[row][col] = getCountOfAdjacentBombs(row, col, board);
        })
    })
    return board;
}

const arrayHeight = 7;
const arrayWidth = 7;
const maxBombs = 7;
const [board, setBoard] = createSignal();

// Build the board -- Basically the intro point to building the ui
const initBoard = (maxBombs, arrayHeight, arrayWidth) => {
    let board = initializeBoard(Array.from(Array(arrayHeight), () => new Array(arrayWidth)), arrayHeight, arrayWidth);
    let bombsArray = initializeBombsArray(Array.from(Array(arrayHeight), () => new Array(arrayWidth - 1)), arrayHeight, arrayWidth);
    board = updateBoardWithBombs(board, bombsArray, arrayHeight, arrayWidth, maxBombs);
    board = updateBoardWithBombDistanceCounters(board);
    canClickButtons = true;
    setBoard(board);
}
initBoard(maxBombs, arrayWidth, arrayHeight);


const revealTile = (row, col, isNumberedTile) => {
    // Hacking Magic to copy without updating in place
    var tempBoard = JSON.parse(JSON.stringify(board()));
    if (!isNumberedTile) {
        tempBoard[row][col] = visitedMarker;
    } else {
        tempBoard[row][col] = visitedMarker + tempBoard[row][col];
    }
    setBoard(tempBoard);
}

const revealBombs = () => {
    var tempBoard = JSON.parse(JSON.stringify(board()));
    tempBoard.map((items, row) => {
        // item even if unused, needs to be here for some reason, ui breaks if it's removed. 
        items.map((_, col) => {
            if (tempBoard[row][col] == bombMarker) {
                tempBoard[row][col] = visitedMarker + '💣';
            }
        })
    })
    setBoard(tempBoard);
}

const revealNumberedTiles = () => {
    board().map((items, row) => {
        items.map((_, col) => {
            if (board()[row][col] > 0 && board()[row][col] < 10) {
                // Up
                if (row - 1 >= 0 && String(board()[row - 1][col]).includes(visitedMarker)) { revealTile(row, col, true); }
                // Down 
                if (row + 1 < arrayHeight && String(board()[row + 1][col]).includes(visitedMarker)) { revealTile(row, col, true); }
                // Left
                if (col - 1 >= 0 && String(board()[row][col - 1]).includes(visitedMarker)) { revealTile(row, col, true); }
                // Right
                if (col + 1 < arrayWidth && String(board()[row][col + 1]).includes(visitedMarker)) { revealTile(row, col, true); }
                // Up right
                if ((row - 1 >= 0 && col + 1 < arrayHeight) && String(board()[row - 1][col + 1]).includes(visitedMarker)) { revealTile(row, col, true); }
                // Up Left
                if ((col - 1 >= 0 && row - 1 > 0) && String(board()[row - 1][col - 1]).includes(visitedMarker)) { revealTile(row, col, true); }
                // Down right
                if ((row + 1 < arrayHeight && col + 1 < arrayWidth) && String(board()[row + 1][col + 1]).includes(visitedMarker)) { revealTile(row, col, true); }
                // Right left 
                if ((col + 1 < arrayWidth && row - 1 > 0) && String(board()[row - 1][col + 1]).includes(visitedMarker)) { revealTile(row, col, true); }
            }
        })
    })
}

// Handle updating all touching 0s
const checkAndRevealTouchingTiles = (row, col, shouldRevealNumberedTiles) => {
    if (canClickButtons == true) {
        if (board()[row][col] == untouchedMarker) {
            revealTile(row, col);
            // Up
            if (row - 1 >= 0 && board()[row - 1][col] == untouchedMarker) {
                checkAndRevealTouchingTiles(row - 1, col, false);
                revealTile(row - 1, col, false);
            }
            // Down 
            if (row + 1 < arrayHeight && board()[row + 1][col] == untouchedMarker) {
                checkAndRevealTouchingTiles(row + 1, col, false);
                revealTile(row + 1, col, false);
            }
            // Left
            if (col - 1 >= 0 && board()[row][col - 1] == untouchedMarker) {
                checkAndRevealTouchingTiles(row, col - 1, false);
                revealTile(row, col - 1, false);
            }
            // Right
            if (col + 1 < arrayWidth && board()[row][col + 1] == untouchedMarker) {
                checkAndRevealTouchingTiles(row, col + 1, false);
                revealTile(row, col + 1, false);
            }
        } else {
            if (board()[row][col] != bombMarker && !String(board()[row][col]).includes(visitedMarker)) {
                revealTile(row, col, true)
            } else if (board()[row][col] == bombMarker) {
                canClickButtons = false;
                revealBombs();
            }
            shouldRevealNumberedTiles = false;
        }
        if (shouldRevealNumberedTiles) {
            revealNumberedTiles();
        }
    }
}

const BoardHtml = () => {
    return (
        <tbody>
            {board().map((items, row) => {
                return (
                    <tr>
                        {items.map((item, col) => {
                            return (
                                <td>
                                    <button class={String(board()[row][col]).includes(visitedMarker) ? `shownBoardItem` : `hiddenBoardItem`} id={`${row}${col}`}
                                        onClick={(e) => checkAndRevealTouchingTiles(row, col, true)}
                                    >
                                        {
                                            String(item).includes(visitedMarker) && (/\d/.test(String(item)) || String(item).includes('💣')) ? String(item).replace(/~/g, ``) : ""
                                        }
                                        {/* {item} */}
                                    </button>
                                </td>);
                        })}
                    </tr>
                );
            })}
            <tr>
                {/* Some jank to center the reset button in the table easily ;) */}
                <td></td>
                <td></td>
                <td></td>
                <td>
                    <button class={`ResetButton`}
                        onClick={(e) => initBoard(maxBombs, arrayWidth, arrayHeight)}
                    >
                        🔄
                    </button>
                </td>
            </tr>
        </tbody>
    );
}

export default BoardHtml;