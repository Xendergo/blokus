import { polyminos } from "./public/polyminos.js"
import {
    composeTransformation,
    transformations,
    verticalFlip,
    transformationMap,
} from "./public/polyminoTransformations.js"

/**
 * Generate a sequence of IDs
 */
function* generateIdFunc() {
    let currentId = 0n

    while (true) {
        yield currentId
        currentId++
    }
}

const generateId = generateIdFunc()

export class Player {
    constructor(color, socket, flipped) {
        this.color = color
        this.socket = socket
        this.flipped = flipped
        this.id = generateId.next()
        this.firstMove = true
    }

    generatePlacedPolyminoMsg(index, x, y, transformation, color) {
        return {
            msg: "placedPolymino",
            index: index,
            x: x,
            y: this.flipped ? 20 - y - Math.sqrt(polyminos[index].length) : y,
            transformation: this.flipped
                ? transformationMap.get(
                      composeTransformation(
                          transformations[transformation],
                          verticalFlip
                      )
                  )
                : transformation,
            color: color,
        }
    }

    /**
     * Tell the player that someone placed a polymino
     * @param {*} msg
     */
    sendPlacedPolymino(msg) {
        this.socket.send(
            JSON.stringify(
                this.generatePlacedPolyminoMsg(
                    msg.index,
                    msg.x,
                    msg.y,
                    msg.transformation,
                    msg.color
                )
            )
        )
    }

    sendRoomInfo(room) {
        this.socket.send(
            JSON.stringify({
                msg: "JoinedRoom",
            })
        )

        this.socket.send(
            JSON.stringify({
                msg: "colors",
                colors: room.availableColors(),
            })
        )
    }

    colorChosen(color, room) {
        this.color = color

        for (const otherPlayer of room.players.values()) {
            if (otherPlayer.color === null) {
                otherPlayer.socket.send(
                    JSON.stringify({
                        msg: "colors",
                        colors: room.availableColors(),
                    })
                )
            }
        }

        room.boardChanges.forEach(change => {
            this.sendPlacedPolymino(change)
        })

        this.socket.send(
            JSON.stringify({
                msg: "availablePolyminos",
                polyminos: room.availablePieces[color],
            })
        )
    }

    placedPolymino(room, index, x, y, transformation) {
        const msg = this.generatePlacedPolyminoMsg(
            index,
            x,
            y,
            transformation,
            this.color
        )

        const polymino = transformations[msg.transformation](polyminos[index])

        room.placePolymino(msg, polymino, this.firstMove)
    }
}
