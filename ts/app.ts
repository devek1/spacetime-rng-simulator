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

type CosmosProvider<A, B extends any[] = []> = A | ((...args: B) => A);

const hashes = new CosmosCache((name: string) => {
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

interface CosmosValueSimple {
  value: number;
}

class CosmosValue implements CosmosValueSimple {
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

class CosmosValueRandom extends CosmosValue {
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
const CosmosMath = {
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


const CosmosUtils = {
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

class OutertaleGroup{
  name: string;
  enemies: string[];
  constructor(name : string, enemies : string[]) {
    this.name = name;
    this.enemies = enemies;
  }
}

const results = document.getElementById("results");
results.setAttribute('style', 'white-space: pre;');

const groups = {
  froggit: new OutertaleGroup("Froggit", ["Froggit"]),
  whimsun: new OutertaleGroup("Whimsun", ["Whimsun"]),
  froggitWhimsun: new OutertaleGroup("Froggit/Whimsun", ["Froggit", "Whimsun"]),
  moldsmal: new OutertaleGroup("Double Mold", ["Moldsmal", "Moldsmal"]),
  moldsmalMigosp: new OutertaleGroup("Mold/Migosp", ["Moldsmal", "Migosp"]),
  loox: new OutertaleGroup("Double Loox", ["Loox", "Loox"]),
  mushy: new OutertaleGroup("Mushy", ["Mushy"]),
  looxMigospWhimsun: new OutertaleGroup("Outlands Triple", ["Loox", "Migosp", "Whimsun"]),
  jerry: new OutertaleGroup("Jerry", ["Jerry"]),
  stardrake: new OutertaleGroup("Stardrake", ["Stardrake"]),
  spacetop: new OutertaleGroup("Astro Serf", ["Astro Serf"]),
  stardrakeSpacetopJerry: new OutertaleGroup("Starton Triple", ["Stardrake", "Jerry", "Astro Serf"]),
  stardrakeSpacetop: new OutertaleGroup("Stardrake/Astro", ["Stardrake", "Astro Serf"]),
  spacetopJerry: new OutertaleGroup("Astro/Jerry", ["Astro Serf", "Jerry"]),
  mouse: new OutertaleGroup("Whizkarat", ["Whizkarat"]),
  woshua: new OutertaleGroup("Woshua", ["Woshua"]),
  moldbygg: new OutertaleGroup("Moldbygg", ["Moldbygg"]),
  moldfake: new OutertaleGroup("Moldbygg (Disguised)", ["Moldbygg (Disguised)"]),
  moldsmalMoldbygg: new OutertaleGroup("Holy Moldy", ["Moldsmal", "Moldbygg (Disguised)"]),
  woshuaMoldbygg: new OutertaleGroup("Woshua/Mold", ["Woshua", "Moldbygg"]),
  radtile: new OutertaleGroup("Radtile", ["Radtile"]),
  pyrope: new OutertaleGroup("Pyrope", ["Pyrope"]),
  tsundere: new OutertaleGroup("Tsunderplane", ["Tsunderplane"]),
  spacetopTsundere: new OutertaleGroup("Astro/Tsunder", ["Astro Serf", "Tsunderplane"]),
  pyropeTsundere: new OutertaleGroup("Pyrope/Tsunder", ["Pyrope", "Tsunderplane"]),
  perigee: new OutertaleGroup("Perigee", ["Perigee"]),
}

const nonBullyable : string[] = [
  "Loox",
  "Jerry",
]

let steps_factor : number;
let step_factors : number[][] = [
  [],
  [],
  [],
  []
];

let playername : string = 'A';
let outlands_skip : boolean = false;
let outlandsreal : number,
  outlands1 : number,
  outlands2 : number,
  outlands3 : number,
  outlands4 : number,
  starton1 : number,
  starton2 : number,
  foundry : number,
  spears : number,
  aerialis : number;

let kills : number[],
  bullies : number[];

let encounters : string = '';
enum areas {
  Outlands = 0,
  Starton = 1,
  Foundry = 2,
  Aerialis = 3
}
let encounters_total : OutertaleGroup[][] = [
  [], //Outlands
  [], //Starton
  [], //Foundry
  []  //Aerialis
];
let area_encountertables : [OutertaleGroup, number][][] = [
  [
    [ groups.froggit, 3 ],
    [ groups.whimsun, 3 ],
    [ groups.froggitWhimsun, 3 ],
    [ groups.moldsmal, 2 ],
    [ groups.moldsmalMigosp, 3 ],
    [ groups.loox, 2 ],
    [ groups.mushy, 2 ],
    [ groups.looxMigospWhimsun, 1 ]
  ],
  [
    [ groups.jerry, 4 ],
    [ groups.stardrake, 4 ],
    [ groups.spacetop, 4 ],
    [ groups.stardrakeSpacetopJerry, 5 ],
    [ groups.stardrakeSpacetop, 5 ],
    [ groups.spacetopJerry, 5 ],
    [ groups.mouse, 5 ]
  ],
  [
    [ groups.woshua, 4 ],
    [ groups.moldbygg, 2 ], // 4 / 2 (1)
    [ groups.moldfake, 2 ], // 4 / 2 (2)
    [ groups.moldsmalMoldbygg, 4 ],
    [ groups.woshuaMoldbygg, 5 ],
    [ groups.radtile, 5 ]
  ],
  [
    [ groups.pyrope, 4 ],
    [ groups.tsundere, 4 ],
    [ groups.spacetopTsundere, 4 ],
    [ groups.pyropeTsundere, 5 ],
    [ groups.perigee, 5 ]
  ]
]

let overworld_rng = new CosmosValueRandom();
overworld_rng.value = hashes.of(playername);

function runEncounter (area : areas, chances: [OutertaleGroup, number][]) {
  steps_factor = overworld_rng.next();
  step_factors[area].push(steps_factor);
  const list = CosmosUtils.parse<string[]>(encounters, []);
  const group = CosmosMath.weigh(
    chances.filter(([ group ]) => (group === null) || !list.includes(group.name)),
    overworld_rng.next()
  );
  (group === null) || list.push(group.name);
  list.length > 4 && list.shift();
  encounters_total[area].push(group);
  encounters = CosmosUtils.serialize(list);
}

function Encounter(area : areas) {
  runEncounter(area, area_encountertables[area]);
}

function runSimulation() {
  results.textContent = '';
  overworld_rng.value = hashes.of(playername);
  encounters = '';
  encounters_total = [[],[],[],[]];
  step_factors = [[],[],[],[]];
  kills = [0,0,0,0];
  bullies = [0,0,0,0];
  if (!outlands_skip) {
    for (let i = 0; i < outlandsreal; i++)
      Encounter(areas.Outlands);
    for (let i = 0; i < 4; i++)
      overworld_rng.next_void();
    for (let i = 0; i < outlands1; i++)
      Encounter(areas.Outlands);
    overworld_rng.next_void();
    for (let i = 0; i < outlands2; i++)
      Encounter(areas.Outlands);
    for (let i = 0; i < 4; i++)
      overworld_rng.next_void();
    for (let i = 0; i < outlands3; i++)
      Encounter(areas.Outlands);
    overworld_rng.next_void();
    for (let i = 0; i < outlands4; i++)
      Encounter(areas.Outlands);
  }
  for (let i = 0; i < starton1; i++)
    Encounter(areas.Starton);
  for (let i = 0; i < 7; i++)
    overworld_rng.next_void()
  for (let i = 0; i < starton2; i++)
    Encounter(areas.Starton);
  for (let i = 0; i < foundry; i++)
    Encounter(areas.Foundry)
  for (let i = 0; i < spears; i++)
    overworld_rng.next_void()
  for (let i = 0; i < aerialis; i++)
    Encounter(areas.Aerialis);
  for (let i = 0; i < 4; i++) {
    results.textContent += "\r\n\r\n"
    for (let j = 0; j < encounters_total[i].length; j++) {
        kills[i] += encounters_total[i][j].enemies.length;
        bullies[i] += encounters_total[i][j].enemies.filter((enemy : string) => (!nonBullyable.includes(enemy))).length;
        results.textContent += "[" + kills[i] + "/" + bullies[i] + "] " + encounters_total[i][j].name + " (" + step_factors[i][j] + "), \r\n"
    }
    //results.textContent += "Total potential Kills in Area: " + kills[i] + " \r\nTotal potential Bullies in Area: " + bullies[i] + " \r\n";
  }

}
