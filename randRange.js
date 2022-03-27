export function randRange(low, high) {
    return Math.floor(low + Math.random() * (high - low + 1));
}