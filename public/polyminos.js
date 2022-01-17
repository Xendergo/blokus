/**
 * Which polyminos the player is allowed to place
 */
export let availablePolyminos = [
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
]

/**
 * Update which polyminos the player is allowed to place with a new list
 * @param {boolean[]} newAvailablePolyminos
 */
export function setAvailablePolyminos(newAvailablePolyminos) {
    availablePolyminos = newAvailablePolyminos
}

/**
 * All the polyminos you're allowed to place
 */
export const polyminos = [
    [1],
    [1, 1, 0, 0],
    [1, 1, 0, 1],
    [0, 0, 0, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 1, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 1, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 0, 1, 0, 0],
    [1, 1, 0, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 0, 0, 1, 0],
    [0, 1, 0, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
]
