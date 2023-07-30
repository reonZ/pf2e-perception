import { COVERS, VISIBILITIES } from './constants.js'

export function optionsToObject(options, affects = 'origin') {
    if (!Array.isArray(options) && !(options instanceof Set)) return options

    const obj = {}

    for (const option of options) {
        const split = option.split(':')
        if (split.at(1) !== 'pf2perception') continue

        const first = split.at(0) === 'self' ? affects : split.at(0)
        const last = split.at(-1)
        const path = [first, ...split.slice(2, -1)].join('.')

        let value = getProperty(obj, path)
        if (value) value.add(last)
        else value = new Set([last])

        setProperty(obj, path, value)
    }

    const includes = options instanceof Set ? options.has.bind(options) : options.includes.bind(options)
    obj.isRanged = includes('item:ranged')

    return obj
}

export function testOption(value, affects, options, type, option) {
    const test = values => {
        if (!values) return false
        return ['all', value].some(x => values.has(x))
    }
    const [originOptions, targetOptions] =
        affects === 'target' ? [options.origin, options.target] : [options.target, options.origin]
    const selfOption = test(originOptions?.[type]?.[option])
    const targetOption = test(targetOptions?.[type]?.[`${option}-self`])
    return selfOption || targetOption
}

export function getOption(affects, options, ...path) {
    const [originOptions, targetOptions] =
        affects === 'target' ? [options.origin, options.target] : [options.target, options.origin]
    const selfOption = getProperty(originOptions, path.join('.')) ?? []
    const targetOption = getProperty(targetOptions, [...path.slice(0, -1), path.at(-1) + '-self'].join('.')) ?? []
    return new Set([...selfOption, ...targetOption])
}

export function updateFromOptions(value, options, type, affects) {
    const list = type === 'cover' ? COVERS : VISIBILITIES
    options = optionsToObject(options)

    if (value && testOption(value, affects, options, type, 'cancel')) return undefined

    const setValue = getOption(affects, options, type, 'set')?.first()
    if (setValue && list.has(setValue)) value = setValue
    else if (value && testOption(value, affects, options, type, 'reduce')) {
        const index = list.indexOf(value)
        value = list[Math.max(0, index - 1)]
    }

    return value === list[0] ? undefined : value
}
