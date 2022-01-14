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
    }

    sendColor(msg) {
        this.socket.send(
            JSON.stringify({
                msg: "setColor",
                x: this.flipped ? 19 - msg.x : msg.x,
                y: msg.y,
                color: msg.color,
            })
        )
    }
}
