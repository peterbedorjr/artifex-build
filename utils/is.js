function type(obj) {
    return obj === undefined ? 'undefined' :
        Object.prototype.toString.call(obj)
            .replace(/^\[object (.+)]$/, '$1')
            .toLowerCase();
}

const is = {
    object: (obj) => type(obj) === 'object',
    string: (str) => type(str) === 'string',
    array: (arr) => Array.isArray(arr),
    function: (fn) => type(fn) === 'function',
    boolean: (bool, coerce = false) => type(bool) === 'boolean' || (coerce && ['true', 'false'].includes(bool.toString())),
    truthy: (val) => !! val,
};

// Aliases
is.bool = is.boolean;
is.obj = is.object;
is.str = is.string;
is.arr = is.array;
is.fn = is.function;

module.exports = is;
