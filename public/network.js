import {
    onJoinRoom,
    onReceiveColors,
    onPolyminoPlaced,
    onReceiveAvailablePolyminos,
    transformation,
} from "./sketch.js"
import { transformationMap } from "./polyminoTransformations.js"

const ws = new WebSocket(`ws://${location.host}/websockets`)

// Ping the server to prevent getting disconnected
setInterval(() => {
    ws.send(
        JSON.stringify({
            msg: "ping",
        })
    )
}, 10000)

ws.onmessage = msg => {
    const data = JSON.parse(msg.data)

    switch (data.msg) {
        case "JoinedRoom": {
            onJoinRoom()
            break
        }

        case "colors": {
            onReceiveColors(data.colors)
            break
        }

        case "placedPolymino": {
            onPolyminoPlaced(
                data.transformation,
                data.index,
                data.x,
                data.y,
                data.color
            )
            break
        }

        case "availablePolyminos": {
            onReceiveAvailablePolyminos(data.polyminos)
            break
        }
    }
}

function joinRoom() {
    ws.send(
        JSON.stringify({
            msg: "joinRoom",
            id: document.querySelector("#room-id").value,
        })
    )
}

window.joinRoom = joinRoom

export function sendColorChoice(choice) {
    ws.send(
        JSON.stringify({
            msg: "color",
            color: choice,
        })
    )
}

export function sendPlacedPolymino(selectedPolymino, cornerX, cornerY) {
    ws.send(
        JSON.stringify({
            msg: "placedPolymino",
            index: selectedPolymino,
            x: cornerX,
            y: cornerY,
            transformation: transformationMap.get(transformation),
        })
    )
}
