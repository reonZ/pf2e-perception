import { VISIBILITIES } from './constants.js'

export function optionsToObject(options, affects = 'origin') {
    const obj = {}
    options.forEach(o => {
        const split = o.split(':')
        if (split.at(1) !== 'pf2perception') return

        const first = split.at(0) === 'self' ? affects : split.at(0)
        const last = split.at(-1)
        const path = [first, ...split.slice(2, -1)].join('.')

        let value = getProperty(obj, path)
        if (value) value.push(last)
        else value = [last]

        setProperty(obj, path, value)
    })
    return obj
}

export function updateVisibilityFromOptions(visibility, options) {
    if (!visibility || !options) return visibility

    if (options.reduce) {
        const reduced = ['all', visibility].some(x => options.reduce.includes(x))
        if (reduced) {
            const index = VISIBILITIES.indexOf(visibility)
            visibility = VISIBILITIES[Math.max(0, index - 1)]
        }
    }

    return visibility
}
