export interface StrokeStyle {
    width?: number,
    color?: string,
    dash?: number[]
}

export interface FillStyle {
    color?: string,
    fillRule?: ('nonzero' | 'evenodd'),
    gradient?: Gradient
}

export interface Gradient {
    type: ('linear' | 'radial'),
    start: [number, number],
    end: [number, number],
    stops: {
        offset: number,
        color: string
    }[]
}

export type FontWeight = (100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 'normal' | 'bold' | 'light');
export type FontStyle = ('normal' | 'italic' | 'oblique');
export type TextAnchor = ('start' | 'middle' | 'end');
export type TextBaseline = ('hanging' | 'middle' | 'alphabetic');

export interface TextStyle {
    size?: number,
    weight?: FontWeight,
    style?: FontStyle,
    family?: string,
    anchor?: TextAnchor,
    baseline?: TextBaseline
}
