import Graphics from './context';

export default class CanvasContext implements Graphics.DrawingContext {

    private _context: CanvasRenderingContext2D;
    private _currentType: 'path' | 'rect' | 'text';
    private _current: {
        text?: string,
        x: number,
        y: number,
        width?: number,
        height?: number
    };
    private _fillRule: string;
    private _textStyle: Graphics.TextStyle;

    constructor(context: CanvasRenderingContext2D) {
        this._context = context;
        this._currentType = null;
        this._current = null;
        this._fillRule = null;
        this._textStyle = {};
    }

    path() {
        this._context.beginPath();
        this._currentType = 'path';
        return this;
    }
    moveTo(x: number, y: number) {
        this._context.moveTo(x, y);
        return this;
    }
    lineTo(x: number, y: number) {
        this._context.lineTo(x, y);
        return this;
    }
    curveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number) {
        this._context.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
        return this;
    }
    close() {
        this._context.closePath();
        return this;
    }

    line(x1: number, y1: number, x2: number, y2: number) {
        this._currentType = 'path';
        this.path()
            .moveTo(x1, y1)
            .lineTo(x2, y2)
            .close();
        return this;
    }
    rect(x: number, y: number, width: number, height: number) {
        this._currentType = 'rect';
        this._current = { x, y, width, height };
        return this;
    }
    circle(cx: number, cy: number, r: number) {
        this._currentType = 'path';
        this._context.beginPath();
        this._context.arc(cx, cy, r, 0, 2 * Math.PI);
        this._context.closePath();
        return this;
    }

    strokeStyle(style: Graphics.StrokeStyle) {
        if (style.color) {
            this._context.strokeStyle = style.color;
        }
        if (style.width) {
            this._context.lineWidth = style.width;
        }
        return this;
    }
    stroke(style?: Graphics.StrokeStyle) {
        if (style) {
            this.strokeStyle(style);
        }
        if (this._currentType === 'path') {
            this._context.stroke();
        }
        if (this._currentType === 'text') {
            let t = this._current;
            this._context.strokeText(t.text, t.x, t.y);
        }
        if (this._currentType === 'rect') {
            let r = this._current;
            this._context.strokeRect(r.x, r.y, r.width, r.height);
        }

        return this;
    }

    fillStyle(style: Graphics.FillStyle) {
        if (style.color) {
            this._context.fillStyle = style.color;
        }
        if (style.gradient) {
            let g: CanvasGradient;
            if (style.gradient.type === 'linear') {
                g = this._context.createLinearGradient(
                    style.gradient.start[0],
                    style.gradient.start[1],
                    style.gradient.end[0],
                    style.gradient.end[1]);
            }
            if (style.gradient.type === 'radial') {
                g = this._context.createRadialGradient(
                    style.gradient.start[0],
                    style.gradient.start[1],
                    Math.sqrt(
                        Math.pow(style.gradient.end[0] - style.gradient.start[0], 2) +
                        Math.pow(style.gradient.end[1] - style.gradient.start[1], 2)),
                    style.gradient.start[0],
                    style.gradient.start[1],
                    0);
            }
            style.gradient.stops.forEach((s) => g.addColorStop(s.offset, s.color));
            this._context.fillStyle = g;
        }
        if (style.fillRule) {
            this._fillRule = style.fillRule;
        }
        return this;
    }
    fill(style?: Graphics.FillStyle) {
        if (style) {
            this.fillStyle(style);
        }
        if (this._currentType === 'path') {
            this._context.fill(this._fillRule);
        }
        if (this._currentType === 'text') {
            let t = this._current;
            this._context.strokeText(t.text, t.x, t.y);
        }
        if (this._currentType === 'rect') {
            let r = this._current;
            this._context.strokeRect(r.x, r.y, r.width, r.height);
        }
        this._currentType = null;
        this._current = null;
        return this;
    }
    textStyle(style: Graphics.TextStyle) {
        if (style.anchor) {
            this._context.textAlign = style.anchor;
        }
        if (style.baseline) {
            this._context.textBaseline = style.baseline;
        }

        this._textStyle = Object.assign(this._textStyle, style);
        var font = this._textStyle;
        var fontProps = [];
        if (font.size) {
            fontProps.push(`${font.size}px`);
        }
        if (font.weight) {
            fontProps.push(font.weight);
        }
        if (font.style && font.style !== 'normal') {
            fontProps.push(font.style);
        }
        if (font.family) {
            fontProps.push(font.family);
        }
        if (fontProps.length > 0) {
            this._context.font = fontProps.join(' ');
        }

        return this;
    }
    text(x: number, y: number, text: string, style?: Graphics.TextStyle) {
        this._currentType = 'text';
        this._current = { x, y, text };
        return this;
    }

    render() {
        return;
    }

}