export function modifier(value) {
    return value >= 0 ? `+${value}` : value
}

export function omit(object, names) {
    const set = new Set(names)
    return Object.entries(object).reduce((acc, [name, value]) => {
        if (!set.has(name)) acc[name] = value
        return acc
    }, {})
}

export function getPrototype(obj, depth = 1) {
    const prototype = Object.getPrototypeOf(obj)
    if (depth > 1) return getPrototype(prototype, depth - 1)
    return prototype.constructor
}

export function sortByName(a, b) {
    return a.name.localeCompare(b.name)
}
