import { inGame, previewStatusChanged } from "./sketch.js"
import { showPolyminos } from "./polyminoRenderer.js"
import { polyminos } from "./polyminos.js"

document.addEventListener("keypress", e => {
    if (!inGame) return

    if (e.key === "a" || e.key === "ArrowLeft") {
        horizontalFlip()
    } else if (e.key === "w" || e.key === "ArrowUp") {
        verticalFlip()
    } else if (e.key === "s" || e.key === "ArrowDown") {
        counterClockwiseRotation()
    } else if (e.key === "d" || e.key === "ArrowRight") {
        clockwiseRotation()
    }
})

function verticalFlip() {
    for (const polymino of polyminos) {
        const size = Math.sqrt(polymino.length)

        for (let j = 0; j < size; j++) {
            for (let k = 0; k < size / 2; k++) {
                let pos1 = k * size + j
                let pos2 = (size - k - 1) * size + j

                let temp = polymino[pos2]
                polymino[pos2] = polymino[pos1]
                polymino[pos1] = temp
            }
        }
    }

    showPolyminos()
    previewStatusChanged()
}

function horizontalFlip() {
    for (const polymino of polyminos) {
        const size = Math.sqrt(polymino.length)

        for (let j = 0; j < size / 2; j++) {
            for (let k = 0; k < size; k++) {
                let pos1 = k * size + j
                let pos2 = k * size + (size - j - 1)

                let temp = polymino[pos2]
                polymino[pos2] = polymino[pos1]
                polymino[pos1] = temp
            }
        }
    }

    showPolyminos()
    previewStatusChanged()
}

function counterClockwiseRotation() {
    for (let i = 0; i < polyminos.length; i++) {
        const polymino = polyminos[i]

        const size = Math.sqrt(polymino.length)
        const newPolymino = new Array(polymino.length)

        for (let j = 0; j < size; j++) {
            for (let k = 0; k < size; k++) {
                newPolymino[k + (size - j - 1) * size] = polymino[k * size + j]
            }
        }

        polyminos[i] = newPolymino
    }

    showPolyminos()
    previewStatusChanged()
}

function clockwiseRotation() {
    for (let i = 0; i < polyminos.length; i++) {
        const polymino = polyminos[i]

        const size = Math.sqrt(polymino.length)
        const newPolymino = new Array(polymino.length)

        for (let j = 0; j < size; j++) {
            for (let k = 0; k < size; k++) {
                newPolymino[size - k - 1 + j * size] = polymino[k * size + j]
            }
        }

        polyminos[i] = newPolymino
    }

    showPolyminos()
    previewStatusChanged()
}

window.verticalFlip = verticalFlip
window.horizontalFlip = horizontalFlip
window.counterClockwiseRotation = counterClockwiseRotation
window.clockwiseRotation = clockwiseRotation
