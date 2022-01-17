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
    transformationMap,
    transformations,
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

export let firstMove = true

export let inGame = false

const snap = new Audio("snap.mp3")

ws.onmessage = msg => {
    const data = JSON.parse(msg.data)

    console.log(data)

    switch (data.msg) {
        case "JoinedRoom": {
            document.querySelector("#roomChoice").hidden = true
            document.querySelector("#colorChoice").hidden = false
            break
        }

        case "colors": {
            if (playerColor !== undefined) return

            document
                .querySelectorAll("#colorChoice *")
                ?.forEach(elt => elt.remove())

            for (const availableColor of data.colors) {
                const button = document.createElement("button")

                button.innerHTML = names[availableColor]
                button.addEventListener("click", () =>
                    colorChoice(availableColor)
                )

                document.querySelector("#colorChoice").appendChild(button)
            }
            break
        }

        case "placedPolymino": {
            let polymino = transformations[data.transformation](
                polyminos[data.index]
            )
            let size = Math.sqrt(polymino.length)

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    if (polymino[j * size + i] === 1) {
                        setBoardSpot(data.x + i, data.y + j, data.color)
                    }
                }
            }

            snap.play()
            document.querySelector(
                "#mostRecentColor"
            ).innerHTML = `Most recent color: ${names[data.color]}`

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
            id: document.querySelector("#room-id").value,
        })
    )
}

window.joinRoom = joinRoom

let hoverX = null
let hoverY = null

/**
 * @type {number}
 */
export let playerColor

function colorChoice(choice) {
    playerColor = choice

    document.querySelectorAll("#colorChoice *")?.forEach(elt => elt.remove())

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
            const elt = document.createElement("span")

            elt.classList.add("tile")
            elt.addEventListener("click", () => {
                onClick(i, j)
            })
            elt.addEventListener("mouseenter", () => {
                onHover(i, j)
            })

            elts.push(elt)
            boardSpots.push(-1)

            elt.style.gridColumnStart = i + 1
            elt.style.gridRowStart = j + 1

            document.querySelector("#board").appendChild(elt)
        }

        boardElts.push(elts)
        board.push(boardSpots)
    }

    showPolyminos()
}

function setBoardSpot(x, y, color) {
    board[x][y] = color
    boardElts[x][y].style.backgroundColor = colors[color]
    boardElts[x][y].style.animation = "tileChanged 0.4s linear"

    previewStatusChanged()
}

function rerenderBoard() {
    for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 20; y++) {
            if (board[x][y] === -1) {
                boardElts[x][y].style.backgroundColor = "#303030"
                continue
            }

            boardElts[x][y].style.backgroundColor = colors[board[x][y]]
        }
    }
}

function onClick(clickX, clickY) {
    const polymino = transformation(polyminos[selectedPolymino])
    const size = Math.sqrt(polymino.length)

    const cornerX = clickX - Math.floor(size / 2)
    const cornerY = clickY - Math.floor(size / 2)

    if (
        !isValidPosition(
            board,
            cornerX,
            cornerY,
            polymino,
            playerColor,
            firstMove
        )
    )
        return

    firstMove = false

    availablePolyminos[selectedPolymino] = false

    ws.send(
        JSON.stringify({
            msg: "placedPolymino",
            index: selectedPolymino,
            x: cornerX,
            y: cornerY,
            transformation: transformationMap.get(transformation),
        })
    )

    selectedPolymino = availablePolyminos.indexOf(true)
    showPolyminos()
}

function onHover(x, y) {
    hoverX = x
    hoverY = y
    previewStatusChanged()
}

export function previewStatusChanged() {
    if (hoverX === null || hoverY === null) return

    rerenderBoard()

    if (selectedPolymino === -1) return

    const polymino = transformation(polyminos[selectedPolymino])
    const size = Math.sqrt(polymino.length)

    const cornerX = hoverX - Math.floor(size / 2)
    const cornerY = hoverY - Math.floor(size / 2)

    const valid = isValidPosition(
        board,
        cornerX,
        cornerY,
        transformation(polyminos[selectedPolymino]),
        playerColor,
        firstMove
    )

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const x = cornerX + j
            const y = cornerY + i

            if (
                outsideBoard(x, y) ||
                board[x][y] != -1 ||
                polymino[i * size + j] === 0
            )
                continue

            boardElts[x][y].style.backgroundColor = valid
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
