import {
    availablePolyminos,
    polyminos,
    setAvailablePolyminos,
} from "./polyminos.js"
import { showPolyminos } from "./polyminoRenderer.js"
import { isValidPosition, outsideBoard } from "./positionValidator.js"
import {
    verticalFlip,
    horizontalFlip,
    rotation270Deg,
    rotation90Deg,
    noTransformation,
    composeTransformation,
} from "./polyminoTransformations.js"

export const board = []
export const boardElts = []

export const colors = [
    "#ff0000",
    "#009700",
    "#0000ff",
    "#ADAD00",
    "#522348",
    "#7A7A7A",
]
const names = ["red", "green", "blue", "yellow"]

const ws = new WebSocket(`ws://${location.host}/websockets`)

// Ping the server to prevent getting disconnected
setInterval(() => {
    ws.send(
        JSON.stringify({
            msg: "ping",
        })
    )
}, 10000)

export let selectedPolymino = 0

export function changeSelectedPolymino(polymino) {
    selectedPolymino = polymino
    showPolyminos()
    previewStatusChanged()
}

window.changeSelectedPolymino = changeSelectedPolymino

export let firstMove = true

export let inGame = false

const snap = new Audio("snap.mp3")

ws.onmessage = msg => {
    const data = JSON.parse(msg.data)

    console.log(data)
    switch (data.msg) {
        case "error": {
            $("#error").html(data.error)
            break
        }

        case "JoinedRoom": {
            $("#roomChoice").hide()
            $("#colorChoice").show()
            break
        }

        case "colors": {
            if (playerColor !== undefined) return

            $("#colorChoice").empty()

            for (const availableColor of data.colors) {
                $("#colorChoice").append(
                    `<button onclick="colorChoice(${availableColor})">${names[availableColor]}</button>`
                )
            }
            break
        }

        case "setColor": {
            setBoardSpot(data.x, data.y, data.color)
            break
        }

        case "availablePolyminos": {
            if (data.polyminos.includes(false)) {
                setAvailablePolyminos(data.polyminos)
                firstMove = false
                showPolyminos()
            }
            break
        }
    }
}

function joinRoom() {
    ws.send(
        JSON.stringify({
            msg: "joinRoom",
            id: $("#room-id").val(),
        })
    )
}

function createRoom() {
    ws.send(
        JSON.stringify({
            msg: "createRoom",
            id: $("#room-id").val(),
        })
    )
}

window.joinRoom = joinRoom
window.createRoom = createRoom

let hoverX = null
let hoverY = null

/**
 * @type {number}
 */
export let playerColor

function colorChoice(choice) {
    playerColor = choice
    $("#colorChoice").empty()
    ws.send(
        JSON.stringify({
            msg: "color",
            color: choice,
        })
    )

    inGame = true

    for (let i = 0; i < 20; i++) {
        const elts = []
        const boardSpots = []

        for (let j = 0; j < 20; j++) {
            const elt = $(
                `<span class='tile' onclick='onClick(${i}, ${j})' onmouseenter='onHover(${i}, ${j})'></span>`
            )
            elts.push(elt)
            boardSpots.push(-1)

            elt[0].style.gridColumnStart = j + 1
            elt[0].style.gridRowStart = i + 1

            $("#board").append(elt)
        }

        boardElts.push(elts)
        board.push(boardSpots)
    }

    showPolyminos()
}

window.colorChoice = colorChoice

function setBoardSpot(x, y, color) {
    board[x][y] = color
    boardElts[x][y][0].style.backgroundColor = colors[color]
    boardElts[x][y][0].style.animation = "tileChanged 0.4s linear"

    snap.play()
    $("#mostRecentColor").html(`Most recent color: ${names[color]}`)

    console.log(board)

    previewStatusChanged()
}

function rerenderBoard() {
    for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 20; y++) {
            if (board[x][y] === -1) {
                boardElts[x][y][0].style.backgroundColor = "#303030"
                continue
            }

            boardElts[x][y][0].style.backgroundColor = colors[board[x][y]]
        }
    }
}

function onClick(clickX, clickY) {
    if (!isValidPosition(clickX, clickY)) return

    firstMove = false

    const polymino = transformation(polyminos[selectedPolymino])

    availablePolyminos[selectedPolymino] = false

    const size = Math.sqrt(polymino.length)

    const cornerX = clickX - Math.floor(size / 2)
    const cornerY = clickY - Math.floor(size / 2)

    ws.send(
        JSON.stringify({
            msg: "usedPolymino",
            index: selectedPolymino,
        })
    )

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const x = cornerX + i
            const y = cornerY + j

            if (polymino[i * size + j] === 0) continue

            ws.send(
                JSON.stringify({
                    msg: "setColor",
                    x,
                    y,
                    color: playerColor,
                })
            )
        }
    }

    selectedPolymino = availablePolyminos.indexOf(true)
    showPolyminos()
}

function onHover(x, y) {
    hoverX = x
    hoverY = y
    previewStatusChanged()
}

window.onClick = onClick
window.onHover = onHover

export function previewStatusChanged() {
    if (hoverX === null || hoverY === null) return

    rerenderBoard()
    const valid = isValidPosition(hoverX, hoverY)

    if (selectedPolymino === -1) return

    const polymino = transformation(polyminos[selectedPolymino])
    const size = Math.sqrt(polymino.length)

    const cornerX = hoverX - Math.floor(size / 2)
    const cornerY = hoverY - Math.floor(size / 2)

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const x = cornerX + i
            const y = cornerY + j

            if (
                outsideBoard(x, y) ||
                board[x][y] != -1 ||
                polymino[i * size + j] === 0
            )
                continue

            boardElts[x][y][0].style.backgroundColor = valid
                ? colors[4]
                : colors[5]
        }
    }
}

export let transformation = noTransformation

document.addEventListener("keypress", e => {
    if (!inGame) return

    if (e.key === "a" || e.key === "ArrowLeft") {
        horizontalFlipAll()
    } else if (e.key === "w" || e.key === "ArrowUp") {
        verticalFlipAll()
    } else if (e.key === "s" || e.key === "ArrowDown") {
        counterClockwiseRotationAll()
    } else if (e.key === "d" || e.key === "ArrowRight") {
        clockwiseRotationAll()
    }
})

function transformAll(nextTransformation) {
    transformation = composeTransformation(transformation, nextTransformation)

    showPolyminos()
    previewStatusChanged()
}

window.verticalFlipAll = () => transformAll(verticalFlip)
window.horizontalFlipAll = () => transformAll(horizontalFlip)
window.counterClockwiseRotationAll = () => transformAll(rotation90Deg)
window.clockwiseRotationAll = () => transformAll(rotation270Deg)
