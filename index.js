import { Player } from "./player.js"
import { Room } from "./room.js"
import express from "express"
import ws from "ws"
import http from "http"
import Discord from "discord.js"
import { fileURLToPath } from "url"
import { dirname } from "path"
import { polyminos } from "./public/polyminos.js"
import {
    composeTransformation,
    transformations,
    verticalFlip,
    transformationMap,
} from "./public/polyminoTransformations.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

const client = new Discord.Client()

client.on("message", msg => {
    if (
        msg.author.id === "243542119715700737" &&
        msg.channel.type === "dm" &&
        msg.content === "ip"
    ) {
        http.get("http://ipecho.net/plain", res => {
            res.setEncoding("utf-8")
            res.on("data", chunk => {
                msg.reply(chunk)
            })
        })
    }
})

client.login("NjUwMDIxNjYxMzk5MTg3NTE3.XeFR2A.07oNaBTbC3fdsIbu9AQwm1G5XsU")

app.use("/", express.static(__dirname + "/public"))

const port = 3000
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

    function sendRoomInfo() {
        socket.send(
            JSON.stringify({
                msg: "JoinedRoom",
            })
        )

        socket.send(
            JSON.stringify({
                msg: "colors",
                colors: room.colors.filter(
                    c =>
                        !Array.from(room.players.values()).reduce(
                            (a, v) => a || v.color === c,
                            false
                        )
                ),
            })
        )
    }

    socket.on("message", dataJson => {
        const data = JSON.parse(dataJson)
        switch (data.msg) {
            case "joinRoom":
                if (!rooms.has(data.id)) {
                    socket.send(
                        JSON.stringify({
                            msg: "error",
                            error: "There's no room with that id",
                        })
                    )

                    return
                }

                room = rooms.get(data.id)
                player = new Player(null, socket, room.players.size % 2 === 1)
                room.players.set(player.id, player)

                roomId = data.id

                sendRoomInfo()

                break

            case "createRoom":
                if (rooms.has(data.id)) {
                    socket.send(
                        JSON.stringify({
                            msg: "error",
                            error: "There's already a room with that id",
                        })
                    )

                    return
                }

                rooms.set(data.id, new Room())
                room = rooms.get(data.id)
                player = new Player(null, socket, room.players.size % 2 === 1)
                room.players.set(player.id, player)

                roomId = data.id

                sendRoomInfo()

                break

            case "color":
                if (!room) return

                player.color = data.color

                for (const otherPlayer of room.players.values()) {
                    if (otherPlayer.color === null) {
                        otherPlayer.socket.send(
                            JSON.stringify({
                                msg: "colors",
                                colors: room.colors.filter(
                                    c =>
                                        !Array.from(
                                            room.players.values()
                                        ).reduce(
                                            (a, v) => a || v.color === c,
                                            false
                                        )
                                ),
                            })
                        )
                    }
                }

                room.boardChanges.forEach(change => {
                    player.sendPlacedPolymino(change)
                })

                socket.send(
                    JSON.stringify({
                        msg: "availablePolyminos",
                        polyminos: room.availablePieces[data.color],
                    })
                )

                break

            case "placedPolymino":
                if (!room) return

                const msg = {
                    msg: "placedPolymino",
                    index: data.index,
                    x: data.x,
                    y: player.flipped
                        ? 20 - data.y - Math.sqrt(polyminos[data.index].length)
                        : data.y,
                    transformation: player.flipped
                        ? transformationMap.get(
                              composeTransformation(
                                  transformations[data.transformation],
                                  verticalFlip
                              )
                          )
                        : data.transformation,
                    color: player.color,
                }

                const polymino = transformations[msg.transformation](
                    polyminos[msg.index]
                )

                if (
                    !room.isValidPosition(
                        msg.x,
                        msg.y,
                        polymino,
                        msg.color,
                        player.firstMove
                    )
                )
                    return

                player.firstMove = false

                room.availablePieces[msg.color][msg.index] = false

                room.boardChanges.push(msg)

                room.placePolymino(msg.x, msg.y, polymino, msg.color)

                Array.from(room.players.values()).forEach(otherPlayer => {
                    if (otherPlayer.color !== null)
                        otherPlayer.sendPlacedPolymino(msg)
                })
        }
    })
})
