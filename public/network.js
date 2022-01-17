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

/**
 * Tell the server you want to join a room
 */
function joinRoom() {
    ws.send(
        JSON.stringify({
            msg: "joinRoom",
            id: document.querySelector("#room-id").value,
        })
    )
}

window.joinRoom = joinRoom

/**
 * Tell the server the player chose a color
 * @param {number} choice
 */
export function sendColorChoice(choice) {
    ws.send(
        JSON.stringify({
            msg: "color",
            color: choice,
        })
    )
}

/**
 * Tell the server the player placed a polymino
 * @param {number} selectedPolymino The index of the polymino the player placed
 * @param {number} cornerX X position
 * @param {number} cornerY Y position
 */
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

function giveFeedback() {
    let feedback = document.querySelector("#feedback").value

    ws.send(JSON.stringify({ msg: "feedback", feedback }))
}

window.giveFeedback = giveFeedback
