import Style from './style';

export interface DrawingContext {

    path(commands: PathCommand[]): this,
    line(x1: number, y1: number, x2: number, y2: number): this,
    rect(x: number, y: number, width: number, height: number): this,
    circle(cx: number, cy: number, r: number): this,
    // image(image: string | ImageData, x: number, y: number, width: number, height: number): this,

    strokeStyle(style: Style.StrokeStyle): this,
    stroke(style?: Style.StrokeStyle): this,

    fillStyle(style: Style.FillStyle): this,
    fill(style?: Style.FillStyle): this,

    textStyle(style: Style.TextStyle): this,
    text(x: number, y: number, text: string, style?: Style.TextStyle): this
}

export interface PathCommand {
    type: ('M' | 'L' | 'Q' | 'C' | 'Z'),
    x?: number,
    y?: number,
    x1?: number,
    y1?: number,
    x2?: number,
    y2?: number
}
