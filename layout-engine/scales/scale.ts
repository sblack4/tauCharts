export interface Scale<T extends number | string | Date> {
    type: string,
    get(input: T): number,
    invert(output: number): T,
    domain(): T[],
    domain(values: T[]): this,
    range(): [number, number],
    range(range: [number, number]): this,
    aggregations: string[]
}

export const ScaleType = {
    Continuous: 'continuous',
    Ordinal: 'ordinal'
}
