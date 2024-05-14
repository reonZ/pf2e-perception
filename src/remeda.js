function purry(fn, args, lazy) {
    const diff = fn.length - args.length;
    const arrayArgs = Array.from(args);
    if (diff === 0) {
        return fn(...arrayArgs);
    }
    if (diff === 1) {
        const ret = (data) => fn(data, ...arrayArgs);
        if (lazy || fn.lazy) {
            ret.lazy = lazy || fn.lazy;
            ret.lazyArgs = args;
        }
        return ret;
    }
    throw new Error("Wrong number of arguments");
}

function _reduceLazy(array, lazy, indexed) {
    const newArray = [];
    // We intentionally use a for loop here instead of reduce for performance reasons. See https://leanylabs.com/blog/js-forEach-map-reduce-vs-for-for_of/ for more info
    for (let index = 0; index < array.length; index++) {
        const item = array[index];
        const result = indexed ? lazy(item, index, array) : lazy(item);
        if (result.hasMany === true) {
            newArray.push(...result.next);
        } else if (result.hasNext) {
            newArray.push(result.next);
        }
    }
    return newArray;
}

function uniqLazy() {
    const set = new Set();
    return (value) => {
        if (set.has(value)) {
            return {
                done: false,
                hasNext: false,
            };
        }
        set.add(value);
        return {
            done: false,
            hasNext: true,
            next: value,
        };
    };
}

function _uniq(array) {
    return _reduceLazy(array, uniqLazy());
}

export const R = {
    compact: (arr) => arr.filter(Boolean),
    uniq: function () {
        return purry(_uniq, arguments, uniqLazy);
    },
};
