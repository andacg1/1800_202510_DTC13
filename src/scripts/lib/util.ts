export function pickRandom<T>(list: T[]) {
    return list[Math.round(Math.random() * (list.length - 1))]
}
