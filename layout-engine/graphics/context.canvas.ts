import { Context, PathCommand } from './context';
import Style from './style';

export default class CanvasContext implements Context {

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
    private _textStyle: Style.TextStyle;

    constructor(context: CanvasRenderingContext2D) {
        this._context = context;
        this._currentType = null;
        this._current = null;
        this._fillRule = 'nonzero';
        this._textStyle = {};
    }

    path(commands: PathCommand[]) {
        this._currentType = 'path';
        this._context.beginPath();
        commands.forEach((c) => {
            switch (c.type) {
                case 'M':
                    this._context.moveTo(c.x, c.y);
                    break;
                case 'L':
                    this._context.lineTo(c.x, c.y);
                    break;
                case 'Q':
                    this._context.quadraticCurveTo(c.x1, c.y1, c.x, c.y);
                    break;
                case 'C':
                    this._context.bezierCurveTo(c.x1, c.y1, c.x2, c.y2, c.x, c.y);
                    break;
                case 'Z':
                    this._context.closePath();
                    break;
            }
        });
        return this;
    }
    line(x1: number, y1: number, x2: number, y2: number) {
        this.path([
            { type: 'M', x: x1, y: y1 },
            { type: 'L', x: x2, y: y2 }
        ]);
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

    strokeStyle(style: Style.StrokeStyle) {
        if (style.color) {
            this._context.strokeStyle = style.color;
        }
        if (style.width) {
            this._context.lineWidth = style.width;
        }
        return this;
    }
    stroke(style?: Style.StrokeStyle) {
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

    fillStyle(style: Style.FillStyle) {
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
    fill(style?: Style.FillStyle) {
        if (style) {
            this.fillStyle(style);
        }
        if (this._currentType === 'path') {
            this._context.fill(this._fillRule);
        }
        if (this._currentType === 'text') {
            let t = this._current;
            this._context.fillText(t.text, t.x, t.y);
        }
        if (this._currentType === 'rect') {
            let r = this._current;
            this._context.fillRect(r.x, r.y, r.width, r.height);
        }
        this._currentType = null;
        this._current = null;
        return this;
    }

    textStyle(style: Style.TextStyle) {
        if (style.anchor) {
            this._context.textAlign = ({
                'start': 'start',
                'middle': 'center',
                'end': 'end'
            }[style.anchor]);
        }
        if (style.baseline) {
            this._context.textBaseline = style.baseline;
        }

        this._textStyle = Object.assign(this._textStyle, style);
        var t = this._textStyle;
        var fontProps = [];
        if (t.style && t.style !== 'normal') {
            fontProps.push(t.style);
        }
        if (t.weight) {
            fontProps.push(t.weight);
        }
        if (t.size) {
            fontProps.push(`${t.size}px`);
        }
        if (t.family) {
            fontProps.push(t.family);
        }
        if (fontProps.length > 0) {
            this._context.font = fontProps.join(' ');
        }

        return this;
    }
    text(x: number, y: number, text: string, style?: Style.TextStyle) {
        if (style) {
            this.textStyle(style);
        }
        this._currentType = 'text';
        this._current = { x, y, text };
        return this;
    }

}
