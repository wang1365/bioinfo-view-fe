export function toMap(array, keyFunction) {
    const result = {}
    array.forEach((t) => {
        result[keyFunction(t)] = t
    })
    return result
}
