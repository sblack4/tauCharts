import { Element } from './element';
import { Context } from '../graphics/context';
import { Scale, ScaleModel } from '../scales/scale';
import createRegistry from '../registry';
import {
    Space,
    mergeSpace,
    emptySpace,
    moveBorders
} from './space';

export interface CartesianOptions {
    viewport?: [number, number];
}

export type CartesianScales = ScaleModel & {
    x: Scale<any, number>;
    y: Scale<any, number>;
};

export class CartesianContainer implements Element {

    data: Object[];
    scales: CartesianScales;
    options: CartesianOptions;
    children: Element[];

    constructor(
        data: Object[],
        scales: CartesianScales,
        options: CartesianOptions,
        children: Element[]) {

        this.data = data;
        this.scales = scales;
        this.options = options;
        this.children = children;
    }

    getRequiredSpace(awailableSpace?: Space): Space {

        const { children } = this;

        if (children.length === 0) {
            return emptySpace();
        }

        // Todo: This should be calculated multiple times with specified required/awailable ratio.
        // Todo: Apply layout rules.
        const spaces = children.map((c) => c.getRequiredSpace(awailableSpace));
        return mergeSpace(...spaces);
    }

    draw(context: Context) {
        const { children } = this;
        children.forEach((c) => c.draw(context));
    }

}

type LayoutRule = (space: Space, neighbors: Space) => Space;
export const cartesianLayoutRules = createRegistry<LayoutRule>('Cartesian Layout Rules');
cartesianLayoutRules.set('layered', (s) => s);
cartesianLayoutRules.set('dock-left', (s, n) => {
    const dx = Math.max(0, Math.min(n.bounds.left, n.stakes.left) - s.bounds.right);
    return moveBorders(s, dx, 0);
});
cartesianLayoutRules.set('dock-right', (s, n) => {
    const dx = Math.min(0, s.bounds.left - Math.max(n.bounds.right, n.stakes.right));
    return moveBorders(s, dx, 0);
});
cartesianLayoutRules.set('dock-top', (s, n) => {
    const dy = Math.max(0, Math.min(n.bounds.top, n.stakes.top) - s.bounds.bottom);
    return moveBorders(s, 0, dy);
});
cartesianLayoutRules.set('dock-bottom', (s, n) => {
    const dy = Math.min(0, s.bounds.top - Math.max(n.bounds.bottom, n.stakes.bottom));
    return moveBorders(s, 0, dy);
});

export default function createCartesianContainer(
    data: Object[],
    scales: CartesianScales,
    options: CartesianOptions,
    children: Element[]) {

    return new CartesianContainer(data, scales, options, children);
}
