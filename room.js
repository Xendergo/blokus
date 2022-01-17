import { isValidPosition } from "./public/positionValidator.js"

export class Room {
    constructor() {
        this.players = new Map()
        this.sockets = []
        this.boardChanges = []
        this.board = new Array(20)
            .fill(0)
            .map(() => new Array(20).fill(0).map(() => -1))
        this.colors = [0, 1, 2, 3]
        this.availablePieces = new Array(4)
            .fill(0)
            .map(() => new Array(21).fill(0).map(() => true))
    }

    /**
     * Place a polymino on the board, neccesary for checking move validity
     * @param {*} x X position
     * @param {*} y Y position
     * @param {*} polymino The polymino to place
     * @param {*} color The polymino's color
     */
    placePolymino(x, y, polymino, color) {
        let size = Math.sqrt(polymino.length)

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (polymino[j * size + i] === 1) {
                    this.board[x + i][y + j] = color
                }
            }
        }
    }

    /**
     * Check if a move is valid
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number[]} polymino Which polymino to use
     * @param {number} playerColor The polymino's color
     * @param {boolean} firstMove If this is the player's first move
     * @returns {boolean}
     */
    isValidPosition(x, y, polymino, playerColor, firstMove) {
        return isValidPosition(
            this.board,
            x,
            y,
            polymino,
            playerColor,
            firstMove
        )
    }
}
