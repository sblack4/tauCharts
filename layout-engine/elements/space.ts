import { Scale } from '../scales/scale';

export interface Space {
    stakes: Bounds;
    bounds: Bounds;
}

export interface Bounds {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export function emptySpace(): Space {
    return {
        stakes: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        },
        bounds: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
    };
}

export function mergeSpace(...spaces: Space[]): Space {
    const left = Math.max(...spaces.map(({ stakes, bounds }) => stakes.left - bounds.left));
    const right = Math.max(...spaces.map(({ stakes, bounds }) => bounds.right - stakes.right));
    const top = Math.max(...spaces.map(({ stakes, bounds }) => stakes.top - bounds.top));
    const bottom = Math.max(...spaces.map(({ stakes, bounds }) => bounds.bottom - stakes.bottom));

    const width = Math.max(...spaces.map(({ stakes }) => Math.abs(stakes.right - stakes.left)));
    const height = Math.max(...spaces.map(({ stakes }) => Math.abs(stakes.bottom - stakes.top)));

    const x0 = spaces[0].stakes.left;
    const y0 = spaces[0].stakes.top;

    return {
        stakes: {
            top: y0,
            right: x0 + width,
            bottom: y0 + height,
            left: x0
        },
        bounds: {
            top: y0 - top,
            right: x0 + width + right,
            bottom: y0 + height + bottom,
            left: x0 - left
        }
    };
}

export function moveBorders(space: Space, dx: number, dy: number): Space {
    return {
        stakes: Object.assign(space.stakes),
        bounds: {
            top: space.bounds.top + dy,
            right: space.bounds.right + dx,
            bottom: space.bounds.bottom + dy,
            left: space.bounds.left + dx
        }
    };
}

export function moveSpace(space: Space, dx: number, dy: number): Space {
    return {
        stakes: {
            top: space.stakes.top + dy,
            right: space.stakes.right + dx,
            bottom: space.stakes.bottom + dy,
            left: space.stakes.left + dx
        },
        bounds: {
            top: space.bounds.top + dy,
            right: space.bounds.right + dx,
            bottom: space.bounds.bottom + dy,
            left: space.bounds.left + dx
        }
    };
}

export function alignSpaceBy(space: Space, target: Space): Space {
    const left = Math.min(0, space.bounds.left - space.stakes.left);
    const right = Math.max(0, space.bounds.right - space.stakes.right);
    const top = Math.min(0, space.bounds.top - space.stakes.top);
    const bottom = Math.max(0, space.bounds.bottom - space.stakes.bottom);

    const width = Math.max(
        space.stakes.right - space.stakes.left,
        target.stakes.right - target.stakes.left);

    const height = Math.max(
        space.stakes.bottom - space.stakes.top,
        target.stakes.bottom - target.stakes.top);

    const x0 = target.stakes.left;
    const y0 = target.stakes.top;

    return {
        stakes: {
            top: y0,
            right: x0 + width,
            bottom: y0 + height,
            left: x0
        },
        bounds: {
            top: y0 + top,
            right: x0 + width + right,
            bottom: y0 + height + bottom,
            left: x0 + left
        }
    };
}

export function overflowsSpace(space: Space, available: Space) {
    const merged = mergeSpace(space, available);
    const aligned = alignSpaceBy(available, merged);
    return (
        merged.bounds.right > available.bounds.right ||
        merged.bounds.top > available.bounds.top
    );
}

export function stakesFromScales(scales: {
    x: Scale<any, number>;
    y: Scale<any, number>;
}): Bounds {
    const x = scales.x.range();
    const y = scales.y.range();
    return {
        top: y[0],
        right: x[1],
        bottom: y[1],
        left: x[0]
    };
}

export class SpaceMeasurer {

    private _bounds: Bounds;
    private _isEmpty: boolean;

    constructor() {
        this._isEmpty = true;
        this._bounds = null;
    }

    rect(this: SpaceMeasurer, x: number, y: number, w: number, h: number) {
        if (this._isEmpty) {
            this._bounds = SpaceMeasurer.startBounds;
            this._isEmpty = false;
        }
        this._bounds.left = Math.min(this._bounds.left, x);
        this._bounds.top = Math.min(this._bounds.top, y);
        this._bounds.right = Math.max(this._bounds.right, x + w);
        this._bounds.bottom = Math.max(this._bounds.bottom, y + h);
        return this;
    }

    bounds() {
        return this._isEmpty ? SpaceMeasurer.emptyBounds : this._bounds;
    }

    isEmpty() {
        return this._isEmpty;
    }

    static startBounds = {
        top: Number.MAX_VALUE,
        right: Number.MIN_VALUE,
        bottom: Number.MIN_VALUE,
        left: Number.MAX_VALUE
    };

    static emptyBounds = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }
}

export function spaceMeasurer(): SpaceMeasurer {
    return new SpaceMeasurer();
}
