import { TextStyle } from './context';

// Todo: Maybe this should be resolved by context (ctx.measureText(), text.getBBox()).
// Or maybe should be computed by Opentype.js
export function measureText(style: TextStyle, text: string) {
    return {
        width: text.length * style.size,
        height: style.size
    };
}
