import { selectedPolymino, firstMove, board, playerColor } from "./sketch.js"
import { polyminos } from "./polyminos.js"

export function isValidPosition(centerX, centerY) {
    // the player doesn't have a polymino selected
    if (selectedPolymino === -1) return false

    const polymino = polyminos[selectedPolymino]
    const size = Math.sqrt(polymino.length)

    const cornerX = centerX - Math.floor(size / 2)
    const cornerY = centerY - Math.floor(size / 2)

    let cornerConnected = false

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const x = cornerX + i
            const y = cornerY + j
            const polyminoIndex = i * size + j

            if (polymino[polyminoIndex]) {
                if (outsideBoard(x, y)) return false

                // On top of another piece
                if (board[x][y] != -1) return false

                // Adjacent to same color piece
                if (!checkAdjacent(x, y)) return false

                console.log(connectsPiece(x, y))

                // Check if this part of the piece connects it to another piece
                cornerConnected = cornerConnected || connectsPiece(x, y)
            }
        }
    }

    return cornerConnected
}

function positionSameColor(x, y) {
    try {
        if (board[x][y] == playerColor) return true
    } catch {}

    return false
}

function checkAdjacent(x, y) {
    if (positionSameColor(x - 1, y)) return false
    if (positionSameColor(x, y - 1)) return false
    if (positionSameColor(x + 1, y)) return false
    if (positionSameColor(x, y + 1)) return false

    return true
}

function connectsPiece(x, y) {
    let cornerConnected = 0
    // Corner is connected to same color piece
    cornerConnected |= positionSameColor(x - 1, y - 1)
    cornerConnected |= positionSameColor(x + 1, y - 1)
    cornerConnected |= positionSameColor(x - 1, y + 1)
    cornerConnected |= positionSameColor(x + 1, y + 1)

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
