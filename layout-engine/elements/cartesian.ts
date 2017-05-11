import { Element } from './element';
import { Context } from '../graphics/context';
import { Scale, ScaleModel } from '../scales/scale';
// import createRegistry from '../registry';
import {
    alignSpaceBy,
    emptySpace,
    mergeSpace,
    moveBorders,
    moveSpace,
    Space,
} from './space';

export interface CartesianOptions {
    // viewport?: [number, number];
    minContentWidth?: number;
    minContentHeight?: number;
}

export type CartesianScales = ScaleModel & {
    x: Scale<any, number>;
    y: Scale<any, number>;
};

const defaultCartesianOptions: CartesianOptions = {
    minContentWidth: 200,
    minContentHeight: 150
};

export class CartesianContainer implements Element {

    data: Object[];
    scales: CartesianScales;
    options: CartesianOptions;
    children: Element[];
    // layoutRules: string[];

    constructor(
        data: Object[],
        scales: CartesianScales,
        options: CartesianOptions,
        children: Element[]) {

        this.data = data;
        this.scales = scales;
        this.options = Object.assign({},
            defaultCartesianOptions,
            options);
        this.children = children;
        // this.layoutRules = ['layered'];
    }

    getRequiredSpace(available?: Space): Space {

        const { children } = this;

        if (children.length === 0) {
            return emptySpace();
        }

        const minSpace = {
            stakes: {
                top: 0,
                right: this.options.minContentWidth,
                bottom: this.options.minContentHeight,
                left: 0
            },
            bounds: {
                top: 0,
                right: this.options.minContentWidth,
                bottom: this.options.minContentHeight,
                left: 0
            }
        };

        const merged = children.reduce((captured, c) => {
            const space = c.getRequiredSpace(available, captured);
            return mergeSpace(captured, space);
        }, minSpace);

        return merged;
    }

    draw(context: Context, available?: Space): Space {
        const { children } = this;
        // children.forEach((c) => c.draw(context));

        const draw = (available?: Space) => {
            const merged = children.reduce((captured, c) => {
                const space = c.draw(context, available, captured);
                return mergeSpace(captured, space);
            }, emptySpace());
            return moveSpace(merged, -merged.bounds.left, -merged.bounds.top);
        };

        // Get required space without limits
        const unlimited = this.getRequiredSpace();

        // If we have no limits simply draw
        if (!available) {
            let space = moveSpace(unlimited, -unlimited.bounds.left, -unlimited.bounds.top);
            this.scales.x.range([space.stakes.left, space.stakes.right]);
            this.scales.y.range([space.stakes.top, space.stakes.bottom]);
            return draw(unlimited);
        }

        // Grow or shrink
        const flex = (s: Space) => {

            var left = Math.max(0, s.stakes.left - s.bounds.left);
            var right = Math.min(0, s.bounds.right - s.stakes.right);
            var top = Math.max(0, s.stakes.top - s.bounds.top);
            var bottom = Math.min(0, s.bounds.bottom - s.stakes.bottom);
            var width = s.stakes.right - s.stakes.left;
            var height = s.stakes.bottom - s.stakes.top;

            var availableWidth = available.bounds.right - available.bounds.left;
            var availableHeight = available.bounds.bottom - available.bounds.top;
            var xRatio = (left + width + right) / availableWidth;
            var yRatio = (top + height + bottom) / availableHeight;
            if (xRatio > 1) {
                let a = (left + right + width * (1 - xRatio)) / xRatio / (1 + right / left);
                let b = a * right / left;
                left = a;
                right = b;
            } else {
                width = availableWidth - left - right;
            }
            if (yRatio > 1) {
                let a = (top + bottom + height * (1 - yRatio)) / yRatio / (1 + bottom / top);
                let b = a * bottom / top;
                top = a;
                bottom = b;
            } else {
                height = availableHeight - top - bottom;
            }

            const limited: Space = {
                stakes: {
                    top: top,
                    right: left + width,
                    bottom: top + height,
                    left: left
                },
                bounds: {
                    top: 0,
                    right: left + width + right,
                    bottom: top + height + bottom,
                    left: 0
                }
            };

            return limited;
        };

        // Todo: calculate multiple times?
        const limited = flex(unlimited);

        if (available) {
            this.scales.x.range([limited.stakes.left, limited.stakes.right]);
            this.scales.y.range([limited.stakes.top, limited.stakes.bottom]);
        }

        return draw(limited);
    }

}

// type LayoutRule = (space: Space, neighbors: Space, available: Space) => Space;
// export const cartesianLayoutRules = createRegistry<LayoutRule>('Cartesian Layout Rules');
// cartesianLayoutRules.set('layered', (s) => s);
// cartesianLayoutRules.set('dock-left', (s, n) => {
//     const dx = Math.max(0, Math.min(n.bounds.left, n.stakes.left) - s.bounds.right);
//     return moveBorders(s, dx, 0);
// });
// cartesianLayoutRules.set('dock-right', (s, n) => {
//     const dx = Math.min(0, s.bounds.left - Math.max(n.bounds.right, n.stakes.right));
//     return moveBorders(s, dx, 0);
// });
// cartesianLayoutRules.set('dock-top', (s, n) => {
//     const dy = Math.max(0, Math.min(n.bounds.top, n.stakes.top) - s.bounds.bottom);
//     return moveBorders(s, 0, dy);
// });
// cartesianLayoutRules.set('dock-bottom', (s, n) => {
//     const dy = Math.min(0, s.bounds.top - Math.max(n.bounds.bottom, n.stakes.bottom));
//     return moveBorders(s, 0, dy);
// });

export default function createCartesianContainer(
    data: Object[],
    scales: CartesianScales,
    options: CartesianOptions,
    children: Element[]) {

    return new CartesianContainer(data, scales, options, children);
}
