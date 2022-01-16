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
