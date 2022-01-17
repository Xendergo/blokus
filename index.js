import { Player } from "./player.js"
import { Room } from "./room.js"
import express from "express"
import ws from "ws"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

app.use("/", express.static(__dirname + "/public"))
app.use("/license", express.static(__dirname + "/LICENSE.txt"))
app.use("/source", express.static(__dirname + "/source.zip"))

const port = 4000
const server = app.listen(port)
console.log("Listening on port " + port)

const wsServer = new ws.Server({
    server: server,
    path: "/websockets",
})

/**
 * @type {Map<string, Room>}
 */
const rooms = new Map()

/**
 * @param {ws} socket
 */
wsServer.on("connection", socket => {
    /**
     * @type {Player}
     */
    let player

    /**
     * @type {Room}
     */
    let room
    let roomId

    socket.on("close", () => {
        if (room) {
            room.players.delete(player.id)

            if (room.players.size === 0) {
                rooms.delete(roomId)
            }
        }
    })

    socket.on("message", dataJson => {
        const data = JSON.parse(dataJson)
        switch (data.msg) {
            case "joinRoom":
                if (!rooms.has(data.id)) {
                    rooms.set(data.id, new Room())
                }

                room = rooms.get(data.id)
                player = new Player(null, socket, room.players.size % 2 === 1)
                room.players.set(player.id, player)

                roomId = data.id

                player.sendRoomInfo(room)

                break

            case "color":
                if (!room) return
                player.colorChosen(data.color, room)
                break

            case "placedPolymino":
                if (!room) return
                player.placedPolymino(
                    room,
                    data.index,
                    data.x,
                    data.y,
                    data.transformation
                )
        }
    })
})
