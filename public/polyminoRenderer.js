import { polyminos, availablePolyminos } from "./polyminos.js"
import {
    selectedPolymino,
    colors,
    playerColor,
    transformation,
    changeSelectedPolymino,
} from "./sketch.js"

export function showPolyminos() {
    document.querySelectorAll("#polyminos *")?.forEach(elt => elt.remove())

    for (let i = 0; i < polyminos.length; i++) {
        if (!availablePolyminos[i]) continue

        const polymino = transformation(polyminos[i])

        const div = document.createElement("div")
        div.style.margin = "16px"
        div.classList.add("flex-column")

        const rows = Math.sqrt(polymino.length)

        let currentFlex

        for (let j = 0; j < polymino.length; j++) {
            if (j % rows === 0) {
                if (currentFlex) {
                    div.appendChild(currentFlex)
                }

                currentFlex = document.createElement("div")
                currentFlex.classList.add("flex")
            }

            const elt = document.createElement("span")

            elt.classList.add("tile")
            elt.addEventListener("click", () => {
                changeSelectedPolymino(i)
            })

            colorTile(elt, polymino[j], i)

            currentFlex.appendChild(elt)
        }

        div.appendChild(currentFlex)

        document.querySelector("#polyminos").appendChild(div)
    }

    document.querySelector("#buttons").hidden = false
}

function colorTile(elt, polyminoValue, i) {
    if (polyminoValue) {
        if (i === selectedPolymino) {
            elt.style.backgroundColor = colors[playerColor]
        } else {
            elt.style.backgroundColor = colors[4]
        }
    } else {
        elt.style.backgroundColor = "#000000"
    }
}
