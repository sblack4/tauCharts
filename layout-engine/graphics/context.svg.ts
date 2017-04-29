import { DrawingContext, PathCommand } from './context';
import Style from './style';

const svgNS = 'http://www.w3.org/2000/svg';

const createSvgElement = (container: SVGElement, tag: string, attrs: { [attr: string]: string | number }) => {
    var node = document.createElementNS(svgNS, tag);
    setSvgAttrs(node, attrs);
    container.appendChild(node);
    return node;
};
const setSvgAttrs = (node: SVGElement, attrs: { [attr: string]: string | number }) => {
    for (var attr in attrs) {
        let value = attrs[attr];
        if (value !== undefined && value !== null) {
            node.setAttribute(attr, String(attrs[attr]));
        }
    }
};

export default class SvgContext implements DrawingContext {

    private _svg: SVGSVGElement;
    private _currentNode: SVGElement;

    constructor(svg: SVGSVGElement) {
        this._svg = svg;
        this._currentNode = null;

        this._strokeStyle = {};
        this._fillStyle = {};
        this._textStyle = {};
    }

    path(commands: PathCommand[]) {
        var path = commands.map((c) => {
            switch (c.type) {
                case 'M':
                    return `M${c.x},${c.y}`;
                case 'L':
                    return `L${c.x},${c.y}`;
                case 'Q':
                    return `Q${c.x1},${c.y1} ${c.x},${c.y}`;
                case 'C':
                    return `C${c.x1},${c.y1} ${c.x2},${c.y2} ${c.x},${c.y}`;
                case 'Z':
                    return `Z`;
            }
        }).join(' ');
        this._currentNode = createSvgElement(this._svg, 'path', {
            'd': path
        });
        return this;
    }
    line(x1: number, y1: number, x2: number, y2: number) {
        this._currentNode = createSvgElement(this._svg, 'line', { x1, y1, x2, y2 });
        return this;
    }
    rect(x: number, y: number, width: number, height: number) {
        this._currentNode = createSvgElement(this._svg, 'rect', { x, y, width, height });
        return this;
    }
    circle(cx: number, cy: number, r: number) {
        this._currentNode = createSvgElement(this._svg, 'circle', { cx, cy, r });
        return this;
    }

    private _strokeStyle: Style.StrokeStyle;
    strokeStyle(style: Style.StrokeStyle) {
        this._strokeStyle = Object.assign(this._strokeStyle, style);
        return this;
    }
    stroke(style?: Style.StrokeStyle) {
        if (style) {
            this.strokeStyle(style);
        }
        const s = this._strokeStyle;
        const n = this._currentNode;
        setSvgAttrs(n, {
            'stroke': s.color,
            'stroke-width': s.width
        });
        if (s.dash && s.dash.length) {
            setSvgAttrs(n, {
                'stroke-dasharray': s.dash.join(' ')
            });
        }
        return this;
    }

    private _fillStyle: Style.FillStyle;
    fillStyle(style: Style.FillStyle) {
        this._fillStyle = Object.assign(this._fillStyle, style);
        return this;
    }
    fill(style?: Style.FillStyle) {
        if (style) {
            this.fillStyle(style);
        }
        const f = this._fillStyle;
        setSvgAttrs(this._currentNode, {
            'fill': f.color,
            'fill-rule': f.fillRule
        });
        if (f.gradient) {
            // Todo: Gradient fill.
        }
        return this;
    }

    private _textStyle: Style.TextStyle;
    textStyle(style: Style.TextStyle) {
        this._textStyle = Object.assign(this._textStyle, style);
        return this;
    }
    text(x: number, y: number, text: string, style?: Style.TextStyle) {
        if (style) {
            this.textStyle(style);
        }
        const t = this._textStyle;
        this._currentNode = createSvgElement(this._svg, 'text', {
            x, y,
            'text-anchor': t.anchor,
            'dominant-baseline': ({
                'hanging': 'hanging',
                'middle': 'central',
                'alphabetic': 'alphabetic'
            }[t.baseline]), // Todo: Detect IE and FireFox, fix Y-position.
            'font-family': t.family,
            'font-size': t.size,
            'font-style': t.style,
            'font-weight': t.weight
        });
        this._currentNode.textContent = text; // Todo: Multiline text.
        return this;
    }

}
