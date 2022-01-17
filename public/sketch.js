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
    transformations,
} from "./polyminoTransformations.js"
import { sendColorChoice, sendPlacedPolymino } from "./network.js"

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

export let selectedPolymino = 0

/**
 * Change which polymino the user currently has selected
 * @param {number} polymino The index of the polymino
 */
export function changeSelectedPolymino(polymino) {
    selectedPolymino = polymino
    showPolyminos()
    previewStatusChanged()
}

export let firstMove = true

export let inGame = false

const snap = new Audio("snap.mp3")

/**
 * Called when the server says the player has joined the room
 */
export function onJoinRoom() {
    document.querySelector("#roomChoice").hidden = true
    document.querySelector("#colorChoice").hidden = false
}

/**
 * Change which colors the player can choose
 * @param {number[]} availableColors Which colors are available
 */
export function onReceiveColors(availableColors) {
    if (playerColor !== undefined) return

    document.querySelectorAll("#colorChoice *")?.forEach(elt => elt.remove())

    for (const availableColor of availableColors) {
        const button = document.createElement("button")

        button.innerHTML = names[availableColor]
        button.addEventListener("click", () => colorChoice(availableColor))

        document.querySelector("#colorChoice").appendChild(button)
    }
}

/**
 * Place a polymino on the board
 * @param {number} polyminoTransformation Which transformation to use
 * @param {number} index The polymino's index
 * @param {number} x The polymino's x position
 * @param {number} y The polymino's y position
 * @param {number} color The polymino's color
 */
export function onPolyminoPlaced(polyminoTransformation, index, x, y, color) {
    let polymino = transformations[polyminoTransformation](polyminos[index])
    let size = Math.sqrt(polymino.length)

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (polymino[j * size + i] === 1) {
                setBoardSpot(x + i, y + j, color)
            }
        }
    }

    snap.play()

    document.querySelector(
        "#mostRecentColor"
    ).innerHTML = `Most recent color: ${names[color]}`
}

/**
 * Which polyminos the player has available, necessary for when users reload and rejoin
 * @param {boolean[]} newAvailablePolyminos
 */
export function onReceiveAvailablePolyminos(newAvailablePolyminos) {
    if (newAvailablePolyminos.includes(false)) {
        setAvailablePolyminos(newAvailablePolyminos)
        firstMove = false
        showPolyminos()
    }
}

let hoverX = null
let hoverY = null

/**
 * @type {number}
 */
export let playerColor

/**
 * Tell the server the player chose a color, and show the game board
 * @param {number} choice The color choice
 */
function colorChoice(choice) {
    playerColor = choice

    document.querySelectorAll("#colorChoice *")?.forEach(elt => elt.remove())

    sendColorChoice(choice)

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

/**
 * Set the color of a square on the game board
 * @param {number} x X position
 * @param {number} y Y position
 * @param {number} color Color
 */
function setBoardSpot(x, y, color) {
    board[x][y] = color
    boardElts[x][y].style.backgroundColor = colors[color]
    boardElts[x][y].style.animation = "tileChanged 0.4s linear"

    previewStatusChanged()
}

/**
 * Set the colors of the squares on the game board, neccesary to reset the board to redraw any overlays
 */
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

/**
 * When the player clicks a square on the board
 * @param {number} clickX X position
 * @param {number} clickY Y position
 */
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

    sendPlacedPolymino(selectedPolymino, cornerX, cornerY)

    selectedPolymino = availablePolyminos.indexOf(true)
    showPolyminos()
}

/**
 * When a player hovers over a square on the board
 * @param {number} x X position
 * @param {number} y Y position
 */
function onHover(x, y) {
    hoverX = x
    hoverY = y
    previewStatusChanged()
}

/**
 * When the preview of where a polymino would be placed should change
 */
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

/**
 * The transformation applied to polyminos the player is placing
 * @type {(polymino: number[]) => number[]}
 */
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

/**
 * Apply a transformation to polyminos a player is placing
 * @param {(polymino: number[]) => number[]} nextTransformation The transformation to apply
 */
function transformAll(nextTransformation) {
    transformation = composeTransformation(transformation, nextTransformation)

    showPolyminos()
    previewStatusChanged()
}

window.verticalFlipAll = () => transformAll(verticalFlip)
window.horizontalFlipAll = () => transformAll(horizontalFlip)
window.counterClockwiseRotationAll = () => transformAll(rotation90Deg)
window.clockwiseRotationAll = () => transformAll(rotation270Deg)

/**
 * Called when I check in on feedback and stuff
 * @param {string[]} feedback
 */
export function onAdminData(feedback) {
    const div = document.createElement("div")
    div.classList.add("feedbackList")

    for (const item of feedback.reverse()) {
        const elt = document.createElement("p")
        const text = document.createTextNode(item)
        elt.appendChild(text)
        elt.style.borderBottom = "1px dashed grey"
        elt.style.margin = "0"
        elt.style.padding = "8px"
        div.appendChild(elt)
    }

    document.querySelector("#roomChoice").appendChild(div)
}
