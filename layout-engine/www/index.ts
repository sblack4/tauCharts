import { DrawingContext } from '../graphics/context';
import CanvasContext from '../graphics/canvas';
import SvgContext from '../graphics/svg';

function drawImage(context: DrawingContext) {
    context.fillStyle({ color: '#d42' });
    context.strokeStyle({ color: '#24d', width: 4 });

    context
        .line(100, 100, 200, 100)
        .stroke();

    context
        .path([
            { type: 'M', x: 200, y: 200 },
            { type: 'C', x1: 200, y1: 300, x2: 100, y2: 300, x: 100, y: 200 },
            { type: 'Z' }
        ])
        .fill();

    context
        .rect(100, 300, 100, 100)
        .fill({ color: '#2d4' });

    context
        .text(200, 350, 'Taucharts', {
            size: 36,
            weight: 'bold',
            family: 'Helvetica Neue, Segoe UI, Open Sans, Ubuntu, sans-serif',
            anchor: 'middle',
            baseline: 'middle'
        })
        .fill({ color: '#222' });
}

var canvas = document.querySelector('canvas');
var svg = document.querySelector('svg');

drawImage(new CanvasContext(canvas.getContext('2d')));
drawImage(new SvgContext(svg));
