/* eslint-disable no-magic-numbers */
/* eslint-disable immutable/no-this */
/* eslint-disable immutable/no-mutation */
function calcSize<V>(v: V): number {
    if (Array.isArray(v)) return v.length;
    if (v instanceof Map) return v.size;
    if (v === null || v === undefined) return 0;
    // if (v.value && v.value.length) return v.value.length;
    if (typeof v === 'object') return Object.keys(v).length;

    return 1;
}

// T === Object has name
export class ClassWm<T extends Record<string, unknown>, V> {
    public cacheHits = 0;

    public wmSize = 0;

    public readonly Interval: NodeJS.Timeout;

    public readonly wmMaxSize: number;

    public readonly fnName: string;

    public readonly ms: number;

    private wm: WeakMap<T, V> = new WeakMap<T, V>();

    public constructor(ms: number, comment: string, wmMaxSize: number) {
        this.wmMaxSize = wmMaxSize;
        this.fnName = comment;
        this.ms = ms;
        this.Interval = setInterval(() => {
            this.wm = new WeakMap<T, V>();
            this.wmSize = 0;
            console.log(`wm Clear ${this.fnName} with ${this.ms} ms`);
        }, ms);
    }

    public setWm(t: T, v: V): V {
        if (this.wmSize > this.wmMaxSize) {
            this.wm = new WeakMap<T, V>();
            this.wmSize = 0;
            console.log(`wm Clear ${this.fnName} with wmSize ${this.wmSize} > ${this.wmMaxSize} wmMaxSize`);
        }
        this.wm.set(t, v);
        this.wmSize += calcSize<V>(v);
        return v;
    }

    public getWm(t: T): V | null {
        const cache = this.wm.get(t) ?? null;
        if (cache) {
            this.cacheHits++;
            // if (this.cacheHits > 3) {
            //     console.log('wm.cacheHits > 3', this.fnName);
            // }
            // console.log('t', t);
            // console.log('cache', cache);
        }
        return cache;
    }
}
