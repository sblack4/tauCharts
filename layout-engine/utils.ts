export function deepAssign<
    A extends Object,
    B extends Object,
    C extends Object,
    D extends Object,
    E extends Object>
    (a: A, b?: B, c?: C, d?: D, e?: E): A & B & C & D & E {
    const objects: Object[] = Array.from(arguments).filter((obj) => obj);
    var result: Object = Object.assign.apply(null, objects);
    for (var prop in result) {
        if (typeof result[prop] === 'object' && result[prop] !== null) {
            let objProps = objects
                .filter((obj) => typeof obj[prop] === 'object')
                .map((obj) => obj[prop]);
            result[prop] = deepAssign.apply(null, objProps);
        }
    }
    return result as A & B & C & D & E;
}

export function unique<T>(array: T[], hasher = (x: T) => String(x)): T[] {
    var hash = {};
    var result: T[] = [];
    var len = array.length;
    for (var i = 0; i < len; ++i) {
        var item = array[i];
        var key = hasher(item);
        if (!hash.hasOwnProperty(key)) {
            hash[key] = true;
            result.push(item);
        }
    }
    return result;
}
