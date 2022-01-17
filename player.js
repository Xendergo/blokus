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

    /**
     * Tell the player that someone placed a polymino
     * @param {*} msg
     */
    sendPlacedPolymino(msg) {
        const newMsg = {
            msg: "placedPolymino",
            index: msg.index,
            x: msg.x,
            y: this.flipped
                ? 20 - msg.y - Math.sqrt(polyminos[msg.index].length)
                : msg.y,
            transformation: this.flipped
                ? transformationMap.get(
                      composeTransformation(
                          transformations[msg.transformation],
                          verticalFlip
                      )
                  )
                : msg.transformation,
            color: msg.color,
        }

        this.socket.send(JSON.stringify(newMsg))
    }
}
