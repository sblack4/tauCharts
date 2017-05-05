export default function createRegistry<T>(name: string) {
    const map: { [key: string]: T } = {};
    return {
        get(key: string) {
            if (!(key in map)) {
                throw new Error(`${key} is not registered in ${name}`);
            }
            return map[key];
        },
        set(key: string, item: T) {
            map[key] = item;
        }
    };
}
