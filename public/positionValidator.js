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

function positionOccupied(x, y, board) {
    return board[x][y] !== -1
}

function positionSameColor(x, y, board, playerColor) {
    try {
        if (board[x][y] == playerColor) return true
    } catch {}

    return false
}

function adjacentToSamePiece(x, y, board, playerColor) {
    if (positionSameColor(x - 1, y, board, playerColor)) return true
    if (positionSameColor(x, y - 1, board, playerColor)) return true
    if (positionSameColor(x + 1, y, board, playerColor)) return true
    if (positionSameColor(x, y + 1, board, playerColor)) return true

    return false
}

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

export function outsideBoard(x, y) {
    return x < 0 || y < 0 || x > 19 || y > 19
}
