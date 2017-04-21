import { Element } from './element';
import d3 from 'd3';d3.quadtree

export class CartesianCoords implements Element {

}

export interface CartesianElementSpace {
    stakes: [[number, number], [number, number]],
    bounds: [[number, number], [number, number]]
}