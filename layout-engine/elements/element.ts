import { Context } from '../graphics/context';
import { ScaleModel } from '../scales/scale';
import { Space } from './space';

export interface Element {

    data: Object[];
    scales: ScaleModel;
    options: Object;
    children?: Element[];

    getRequiredSpace(available?: Space, captured?: Space): Space;
    draw(context: Context, available?: Space, captured?: Space): Space;

}
