import { COVERS, VISIBILITIES } from './constants.js'

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

export function testOption(value, options, type, option) {
    const test = values => {
        if (!values) return false
        return ['all', value].some(x => values.includes(x))
    }
    const selfResult = test(options.origin?.[type]?.[option])
    const targetResult = test(options.target?.[type]?.[`${option}-self`])
    return selfResult || targetResult
}

export function getOption(options, ...path) {
    const selfOption = getProperty(options.origin, path.join('.')) ?? []
    const targetResult = getProperty(options.target, [...path.slice(0, -1), path.at(-1) + '-self'].join('.')) ?? []
    return [...selfOption, ...targetResult]
}

export function updateFromOptions(value, options, type) {
    const list = type === 'cover' ? COVERS : VISIBILITIES
    options = Array.isArray(options) ? optionsToObject(options) : options

    if (value && testOption(value, options, type, 'cancel')) return undefined

    const setValue = getOption(options, type, 'set')?.[0]
    if (setValue && list.includes(setValue)) return setValue === list[0] ? undefined : setValue

    if (value && testOption(value, options, type, 'reduce')) {
        const index = list.indexOf(value)
        return list[Math.max(0, index - 1)]
    }

    return value
}
