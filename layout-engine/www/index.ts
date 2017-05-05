import { Context } from '../graphics/context';
import CanvasContext from '../graphics/context.canvas';
import SvgContext from '../graphics/context.svg';

import createLinearScale from '../scales/linear';
import createOrdinalScale from '../scales/ordinal';

import createBarGroup from '../elements/bar';
import { createAxisBottom, createAxisLeft } from '../elements/axis';
import createCartesianContainer from '../elements/cartesian';
import createFacetContainer from '../elements/facet';

//
// Sample drawing

function drawImage(context: Context) {
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

var bars = createBarGroup(data, scales);
bars.draw(canvasContext);

//
// Sample axis

var axis = createAxisBottom(data, scales, {
    label: 'Label'
});
axis.draw(canvasContext);

//
// Sample cartesian container

var scales = {
    x: createLinearScale(data, 'count'),
    y: createLinearScale(data, 'effort', { includeZero: true })
};

var cartesian = createCartesianContainer(data, scales, {}, [
    createBarGroup(data, scales),
    createAxisBottom(data, scales)
]);
var dx = 200;
var dy = 250;
var space = cartesian.getRequiredSpace();
scales.x.range([space.stakes.left + dx, space.stakes.right + dx]);
scales.y.range([space.stakes.top + dy, space.stakes.bottom + dy]);
cartesian.draw(canvasContext);
cartesian.draw(svgContext);

//
// Sample facet

var fullData = [
    { effort: 50, count: 'a', team: 'Alpha' },
    { effort: 10, count: 'b', team: 'Alpha' },
    { effort: 40, count: 'c', team: 'Alpha' },
    { effort: 30, count: 'a', team: 'Beta' },
    { effort: 20, count: 'b', team: 'Beta' },
    { effort: 40, count: 'c', team: 'Beta' }
];

var groupByTeam = (() => {
    var teams: { [t: string]: any[] } = {};
    fullData.forEach((d) => {
        teams[d.team] = teams[d.team] || [];
        teams[d.team].push(d);
    });
    return Object.keys(teams).map((t) => teams[t]);
})();

var teamScale = createOrdinalScale(fullData, 'team', { sorter: 'string' });
var effortScale = createLinearScale(fullData, 'effort', { includeZero: true });
var countScale = createOrdinalScale(fullData, 'count');
var facetYScale = createLinearScale([{ value: 0 }, { value: 1 }], 'value');
var cartesianScales = {
    x: countScale,
    y: effortScale
};
var facetScales = {
    x: teamScale,
    y: facetYScale
};

var facet = createCartesianContainer(fullData, facetScales, {}, [
    createAxisBottom(fullData, facetScales),
    createFacetContainer(
        groupByTeam,
        {
            x: teamScale
        },
        {},
        [
            createCartesianContainer(
                groupByTeam[0],
                cartesianScales,
                {},
                [
                    createBarGroup(groupByTeam[0], cartesianScales),
                    createAxisBottom(fullData, cartesianScales),
                    createAxisLeft(fullData, cartesianScales)
                ]),
            createCartesianContainer(
                groupByTeam[1],
                cartesianScales,
                {},
                [
                    createBarGroup(groupByTeam[1], cartesianScales),
                    createAxisBottom(fullData, cartesianScales)
                ])
        ]
    )
]);

var requiredSpace = facet.getRequiredSpace();
console.log('facet required', requiredSpace);

facetYScale.range([0, 100]);
effortScale.range([10, 60]);
countScale.range([0, 75]);
teamScale.range([200, 400]);

facet.draw(canvasContext);
facet.draw(svgContext);
