class CosmosCache<A, B> extends Map<A, B> {
  compute: (key: A) => B;
  constructor (compute: (key: A) => B) {
    super();
    this.compute = compute;
  }
  of (key: A) {
    this.has(key) || this.set(key, this.compute(key));
    return this.get(key)!;
  }
}

export type CosmosProvider<A, B extends any[] = []> = A | ((...args: B) => A);

export const hashes = new CosmosCache((name: string) => {
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

export interface CosmosValueSimple {
  value: number;
}

export class CosmosValue implements CosmosValueSimple {
  //task: (() => void) | undefined = void 0;
  value: number;
  constructor (value: CosmosValueSimple | number = 0) {
    if (typeof value === 'number') {
      this.value = value;
    } else {
      this.value = value.value;
    }
  }
  /*async modulate (renderer: CosmosRenderer, duration: number, ...points: number[]) {
    let active = true;
    this.task?.();
    this.task = () => (active = false);
    const base = this.value;
    const origin = renderer.ticks;
    const trueDuration = Math.round(duration / CosmosMath.FRAME_2);
    await renderer.when(() => {
      if (active) {
        const elapsed = renderer.ticks - origin;
        if (elapsed < trueDuration) {
          this.value = CosmosMath.bezier(elapsed / trueDuration, base, ...points);
          return false;
        } else {
          this.task = void 0;
          this.value = points.length !== 0 ? points[points.length - 1] : base;
        }
      }
      return true;
    });
  }*/
  /*set (a: CosmosValueSimple | number): CosmosValue {
    if (typeof a === 'number') {
      this.value = a;
      return this;
    } else {
      return this.set(a.value);
    }
  }*/
}

export class CosmosValueRandom extends CosmosValue {
  compute () {
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
  next () {
    this.value = (this.value + 0x9e3779b9) | 0;
    return this.compute();
  }
  next_void () {
    this.value = (this.value + 0x9e3779b9) | 0;
  }
  int (limit: number) {
    return Math.floor(this.next() * limit);
  }
}
export const CosmosMath = {
  weigh<A> (input: CosmosProvider<[A, number][]>, modifier: number) {
    const weights = CosmosUtils.provide(input);
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


export const CosmosUtils = {
  parse<A = any> (text: string, fallback?: A): A {
    if (text || fallback === void 0) {
      return JSON.parse(text ?? '', (key, value) => {
        if (value === '\x00') {
          return Infinity;
        } else if (value === '\x01') {
          return -Infinity;
        } else if (value === '\x02') {
          return NaN;
        } else {
          return value;
        }
      });
    } else {
      return fallback;
    }
  },
  populate: ((size: number, provider: any) => {
    let index = 0;
    const array: any[] = [];
    while (index < size) {
      array.push(CosmosUtils.provide(provider, index++));
    }
    return array;
  }) as {
    <A extends (index: number) => unknown>(size: number, provider: A): ReturnType<A>[];
    <A>(size: number, provider: A): A[];
  },
  provide<A extends CosmosProvider<unknown, unknown[]>> (
    provider: A,
    ...args: A extends CosmosProvider<infer _, infer C> ? C : never
  ): A extends CosmosProvider<infer B, any[]> ? B : never {
    return typeof provider === 'function' ? provider(...args) : provider;
  },
  serialize (value: any, beautify = false) {
    return JSON.stringify(
      value,
      (key, value) => {
        if (value === Infinity) {
          return '\x00';
        } else if (value === -Infinity) {
          return '\x01';
        } else if (typeof value === 'number' && value !== value) {
          return '\x02';
        } else {
          return value;
        }
      },
      beautify ? 3 : void 0
    );
  }
};
