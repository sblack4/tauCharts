export interface DrawingContext {

    path(): this,
    moveTo(x: number, y: number): this,
    lineTo(x: number, y: number): this,
    curveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): this,
    close(): this,

    line(x1: number, y1: number, x2: number, y2: number): this,
    rect(x: number, y: number, width: number, height: number): this,
    circle(cx: number, cy: number, r: number): this,

    strokeStyle(style: StrokeStyle): this,
    stroke(style?: StrokeStyle): this,

    fillStyle(style: FillStyle): this,
    fill(style?: FillStyle): this,

    textStyle(style: TextStyle): this,
    text(x: number, y: number, text: string, style?: TextStyle): this,

    render(): void
}

export interface StrokeStyle {
    width?: number,
    color?: string,
    dash?: number[]
}

export interface FillStyle {
    color?: string,
    fillRule?: ('nonzero' | 'evenodd'),
    gradient?: {
        type: ('linear' | 'radial'),
        start: [number, number],
        end: [number, number],
        stops: {
            offset: number,
            color: string
        }[]
    }
}

type FontWeight = (100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 'normal' | 'bold' | 'light');
type FontStyle = ('normal' | 'italic' | 'oblique');
type TextAnchor = ('start' | 'middle' | 'end');
type TextBaseline = ('hanging' | 'middle' | 'alphabetic');

export interface TextStyle {
    size?: number,
    weight?: FontWeight,
    style?: FontStyle,
    family?: string,
    anchor?: TextAnchor,
    baseline?: TextBaseline
}
