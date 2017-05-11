import { Context, PathCommand } from './context';
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

export default class SvgContext implements Context {

    private _svg: SVGSVGElement;
    private _group: SVGElement; // Todo: Group elements by style and transform.
    private _element: SVGElement;
    private _translate: [number, number];

    constructor(svg: SVGSVGElement) {
        this._svg = svg;
        this._group = svg;
        this._element = null;

        this._strokeStyle = {};
        this._fillStyle = {};
        this._textStyle = {};
    }

    translate(x, y) {
        this._translate = [x, y];
    }
    resetTransform() {
        this._translate = null;
    }
    private _setTransform(node: SVGElement) {
        if (this._translate) {
            setSvgAttrs(node, {
                'transform': `translate(${this._translate[0]},${this._translate[1]})`
            });
        }
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
        this._element = createSvgElement(this._group, 'path', {
            'fill': 'transparent',
            'd': path
        });
        this._setTransform(this._element);
        return this;
    }
    line(x1: number, y1: number, x2: number, y2: number) {
        this._element = createSvgElement(this._group, 'line', { x1, y1, x2, y2 });
        this._setTransform(this._element);
        return this;
    }
    rect(x: number, y: number, width: number, height: number) {
        this._element = createSvgElement(this._group, 'rect', { x, y, width, height, 'fill': 'transparent' });
        this._setTransform(this._element);
        return this;
    }
    circle(cx: number, cy: number, r: number) {
        this._element = createSvgElement(this._group, 'circle', { cx, cy, r, 'fill': 'transparent' });
        this._setTransform(this._element);
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
        const n = this._element;
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
        setSvgAttrs(this._element, {
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
        this._element = createSvgElement(this._group, 'text', {
            x, y,
            'fill': 'transparent',
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
        this._setTransform(this._element);
        this._element.textContent = text; // Todo: Multiline text.
        return this;
    }

}
