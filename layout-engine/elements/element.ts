import { Context } from '../graphics/context';
import { ScaleModel } from '../scales/scale'

export interface Element {

    data: Object[];
    scales: ScaleModel;
    options: Object;
    children?: Element[];

    getRequiredSpace(awailableSpace?: Space): Space;
    draw(context: Context, awailableSpace?: Space): void;

}

export interface Space {
    stakes: [[number, number], [number, number]];
    bounds: [[number, number], [number, number]];
}
