export interface ChartSpec {
    type: string;
    data: Array<Object>;
}

export interface CartesianChartSpec {
    type: string;
    x: string | Array<string>;
    y: string | Array<string>;
}

export interface BarChartSpec extends CartesianChartSpec {
    type: 'bar';
    flip: boolean;
    x0?: string | Array<string>;
    y0?: string | Array<string>;
}

export interface LineChartSpec extends CartesianChartSpec {
    type: 'line';
    flip: boolean;
}
