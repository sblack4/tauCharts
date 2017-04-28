import { DrawingContext } from '../graphics/context';
import CanvasContext from '../graphics/context.canvas';
import SvgContext from '../graphics/context.svg';
import d3 from 'd3';

import createLinearScale from '../scales/linear';
import createBarGroup from '../elements/bar';

import { createAxisBottom } from '../elements/axis';

//
// Sample drawing

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

var canvasContext = new CanvasContext(canvas.getContext('2d'));
var svgContext = new SvgContext(svg);
drawImage(canvasContext);
drawImage(svgContext);

//
// Sample bar group

var data = [
    { effort: 100, count: 5 },
    { effort: 50, count: 3 },
    { effort: 70, count: 4 }
];

var scales = {
    x: createLinearScale(data, 'count')
        .range([20, 80]),
    y: createLinearScale(data, 'effort', { includeZero: true })
        .range([20, 80])
};

var bars = createBarGroup();
bars.draw(canvasContext, { data, scales });

//
// Sample axis

var axis = createAxisBottom({
    label: 'Label'
});
axis.draw(canvasContext, { data, scales });
