/**
 * Validate that a player can place a piece at a position
 * @param {number[][]} board The board the piece is being placed on
 * @param {number} cornerX X position of the pieces corner
 * @param {number} cornerY Y position of the pieces corner
 * @param {number[]} polymino Which polymino to check
 * @param {number} playerColor The player's color
 * @param {boolean} firstMove Whether this would be the player's first move
 */
export function isValidPosition(
    board,
    cornerX,
    cornerY,
    polymino,
    playerColor,
    firstMove
) {
    const size = Math.sqrt(polymino.length)

    let cornerConnected = false

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const x = cornerX + j
            const y = cornerY + i
            const polyminoIndex = i * size + j

            if (polymino[polyminoIndex]) {
                if (
                    outsideBoard(x, y) ||
                    positionOccupied(x, y, board) ||
                    adjacentToSamePiece(x, y, board, playerColor)
                )
                    return false

                cornerConnected =
                    cornerConnected ||
                    connectsPiece(x, y, board, playerColor, firstMove)
            }
        }
    }

    return cornerConnected
}

/**
 * Is this position occupied?
 * @param {number} x
 * @param {number} y
 * @param {number[][]} board
 * @returns {boolean}
 */
function positionOccupied(x, y, board) {
    return board[x][y] !== -1
}

/**
 * Does this position have the same color as the player?
 * @param {number} x
 * @param {number} y
 * @param {number[][]} board
 * @param {number} playerColor
 * @returns {boolean}
 */
function positionSameColor(x, y, board, playerColor) {
    try {
        if (board[x][y] == playerColor) return true
    } catch {}

    return false
}

/**
 * Is this piece next to a piece of the player's color?
 * @param {number} x
 * @param {number} y
 * @param {number[][]} board
 * @param {number} playerColor
 * @returns {boolean}
 */
function adjacentToSamePiece(x, y, board, playerColor) {
    if (positionSameColor(x - 1, y, board, playerColor)) return true
    if (positionSameColor(x, y - 1, board, playerColor)) return true
    if (positionSameColor(x + 1, y, board, playerColor)) return true
    if (positionSameColor(x, y + 1, board, playerColor)) return true

    return false
}

/**
 * Is this piece on a corner to the player's piece or maybe the corner?
 * @param {number} x
 * @param {number} y
 * @param {number[][]} board
 * @param {number} playerColor
 * @param {boolean} firstMove
 * @returns {boolean}
 */
function connectsPiece(x, y, board, playerColor, firstMove) {
    let cornerConnected = 0
    // Corner is connected to same color piece
    cornerConnected |= positionSameColor(x - 1, y - 1, board, playerColor)
    cornerConnected |= positionSameColor(x + 1, y - 1, board, playerColor)
    cornerConnected |= positionSameColor(x - 1, y + 1, board, playerColor)
    cornerConnected |= positionSameColor(x + 1, y + 1, board, playerColor)

    // If it's the first move, you can put a piece touching the corner of the grid
    if (firstMove) {
        cornerConnected |= x === 0 && y === 0
        cornerConnected |= x === 19 && y === 0
        cornerConnected |= x === 0 && y === 19
        cornerConnected |= x === 19 && y === 19
    }

    return cornerConnected == 1
}

/**
 * Is this position outside the board?
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function outsideBoard(x, y) {
    return x < 0 || y < 0 || x > 19 || y > 19
}
