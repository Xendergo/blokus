/*
https://www.cs.umb.edu/~eb/d4/index.html

Square symmetry group:

No transformation: 0
90deg rotation: 1
180deg rotation: 2
270deg rotation: 3
Horizontal flip: 4
Vertical flip: 5
Diagonal flip 1: 6
Diagonal flip 2: 7
*/

function transformation(f) {
    return polymino => {
        const size = Math.sqrt(polymino.length)
        const newPolymino = new Array(polymino.length)

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let [transformedI, transformedJ] = f(i, j, size)
                newPolymino[transformedJ * size + transformedI] =
                    polymino[j * size + i]
            }
        }

        return newPolymino
    }
}

export const noTransformation = transformation((x, y, size) => [x, y])

export const rotation90Deg = transformation((x, y, size) => [y, size - x - 1])

export const rotation180Deg = transformation((x, y, size) => [
    size - x - 1,
    size - y - 1,
])

export const rotation270Deg = transformation((x, y, size) => [size - y - 1, x])

export const verticalFlip = transformation((x, y, size) => [x, size - y - 1])

export const horizontalFlip = transformation((x, y, size) => [size - x - 1, y])

export const diagonalFlip1 = transformation((x, y, size) => [
    size - y - 1,
    size - x - 1,
])

export const diagonalFlip2 = transformation((x, y, size) => [y, x])

export const transformationMap = new Map()

export const transformations = [
    noTransformation,
    rotation90Deg,
    rotation180Deg,
    rotation270Deg,
    horizontalFlip,
    verticalFlip,
    diagonalFlip1,
    diagonalFlip2,
]

for (let i = 0; i < transformations.length; i++) {
    transformationMap.set(transformations[i], i)
}

const compositionTable = [
    [0, 1, 2, 3, 4, 5, 6, 7],
    [1, 2, 3, 0, 6, 7, 5, 4],
    [2, 3, 0, 1, 5, 4, 7, 6],
    [3, 0, 1, 2, 7, 6, 4, 5],
    [4, 7, 5, 6, 0, 2, 3, 1],
    [5, 6, 4, 7, 2, 0, 1, 1],
    [6, 4, 7, 5, 1, 3, 0, 2],
    [7, 5, 6, 4, 3, 1, 2, 0],
]

export function composeTransformation(first, second) {
    let firstIndex = transformationMap.get(first)
    let secondIndex = transformationMap.get(second)

    return transformations[compositionTable[firstIndex][secondIndex]]
}
