"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosmosUtils = exports.CosmosMath = exports.CosmosValueRandom = exports.CosmosValue = exports.hashes = void 0;
class CosmosCache extends Map {
    constructor(compute) {
        super();
        this.compute = compute;
    }
    of(key) {
        this.has(key) || this.set(key, this.compute(key));
        return this.get(key);
    }
}
exports.hashes = new CosmosCache((name) => {
    let pos = 0;
    let hash1 = 0xdeadbeef ^ 432;
    let hash2 = 0x41c6ce57 ^ 432;
    while (pos !== name.length) {
        const code = name.charCodeAt(pos++);
        hash1 = Math.imul(hash1 ^ code, 2654435761);
        hash2 = Math.imul(hash2 ^ code, 1597334677);
    }
    hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
    hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & hash2) + (hash1 >>> 0);
});
class CosmosValue {
    constructor(value = 0) {
        if (typeof value === 'number') {
            this.value = value;
        }
        else {
            this.value = value.value;
        }
    }
}
exports.CosmosValue = CosmosValue;
class CosmosValueRandom extends CosmosValue {
    compute() {
        let z = this.value;
        z++;
        z ^= z >>> 17;
        z = Math.imul(z, 0xed5ad4bb);
        z ^= z >>> 11;
        z = Math.imul(z, 0xac4c1b51);
        z ^= z >>> 15;
        z = Math.imul(z, 0x31848bab);
        z ^= z >>> 14;
        return (z >>> 0) / 4294967296;
    }
    next() {
        this.value = (this.value + 0x9e3779b9) | 0;
        return this.compute();
    }
    next_void() {
        this.value = (this.value + 0x9e3779b9) | 0;
    }
    int(limit) {
        return Math.floor(this.next() * limit);
    }
}
exports.CosmosValueRandom = CosmosValueRandom;
exports.CosmosMath = {
    weigh(input, modifier) {
        const weights = exports.CosmosUtils.provide(input);
        let total = 0;
        for (const entry of weights) {
            total += entry[1];
        }
        const value = modifier * total;
        for (const entry of weights) {
            if (value > (total -= entry[1])) {
                return entry[0];
            }
        }
    }
};
exports.CosmosUtils = {
    parse(text, fallback) {
        if (text || fallback === void 0) {
            return JSON.parse(text !== null && text !== void 0 ? text : '', (key, value) => {
                if (value === '\x00') {
                    return Infinity;
                }
                else if (value === '\x01') {
                    return -Infinity;
                }
                else if (value === '\x02') {
                    return NaN;
                }
                else {
                    return value;
                }
            });
        }
        else {
            return fallback;
        }
    },
    populate: ((size, provider) => {
        let index = 0;
        const array = [];
        while (index < size) {
            array.push(exports.CosmosUtils.provide(provider, index++));
        }
        return array;
    }),
    provide(provider, ...args) {
        return typeof provider === 'function' ? provider(...args) : provider;
    },
    serialize(value, beautify = false) {
        return JSON.stringify(value, (key, value) => {
            if (value === Infinity) {
                return '\x00';
            }
            else if (value === -Infinity) {
                return '\x01';
            }
            else if (typeof value === 'number' && value !== value) {
                return '\x02';
            }
            else {
                return value;
            }
        }, beautify ? 3 : void 0);
    }
};
