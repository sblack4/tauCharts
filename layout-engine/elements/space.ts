export interface Space {
    stakes: Bounds;
    bounds: Bounds;
}

interface Bounds {
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
    const borders = {
        left: Math.max(...spaces.map(({ stakes, bounds }) => Math.max(0, stakes.left - bounds.left))),
        right: Math.max(...spaces.map(({ stakes, bounds }) => Math.max(0, bounds.right - stakes.right))),
        top: Math.max(...spaces.map(({ stakes, bounds }) => Math.max(0, stakes.top - bounds.top))),
        bottom: Math.max(...spaces.map(({ stakes, bounds }) => Math.max(0, bounds.bottom - stakes.bottom))),
    };

    const stakes = {
        width: Math.max(...spaces.map(({ stakes }) => Math.max(0, stakes.right - stakes.left))),
        height: Math.max(...spaces.map(({ stakes }) => Math.max(0, stakes.bottom - stakes.bottom)))
    };

    return {
        stakes: {
            top: borders.top,
            right: borders.left + stakes.width,
            bottom: borders.top + stakes.height,
            left: borders.left
        },
        bounds: {
            top: 0,
            right: borders.left + stakes.width + borders.right,
            bottom: borders.top + stakes.height + borders.bottom,
            left: 0
        }
    };
}

export function moveBorders(space: Space, dx: number, dy: number): Space {
    return {
        stakes: Object.assign(space.stakes),
        bounds: {
            top: space.bounds.top + dy,
            right: space.bounds.right + dy,
            bottom: space.bounds.bottom + dy,
            left: space.bounds.left + dy
        }
    };
}

export function alignSpaceBy(space: Space, target: Space): Space {
    const left = space.stakes.left - space.bounds.left;
    const right = space.stakes.right - space.bounds.right;
    const top = space.stakes.top - space.bounds.top;
    const bottom = space.stakes.bottom - space.bounds.bottom;

    const width = Math.max(
        space.stakes.right - space.stakes.left,
        target.stakes.right - target.stakes.left);

    const height = Math.max(
        space.stakes.bottom - space.stakes.top,
        target.stakes.bottom - target.stakes.top);

    return {
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
}

export function overflowsSpace(space: Space, available: Space) {
    const merged = mergeSpace(space, available);
    const aligned = alignSpaceBy(available, merged);
    return (
        merged.bounds.right > available.bounds.right ||
        merged.bounds.top > available.bounds.top
    );
}
