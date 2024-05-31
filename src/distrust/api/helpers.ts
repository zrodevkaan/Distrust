/**
 * All credit goes to rauenzi for writing up this implementation.
 * You can find the original source here:
 * <https://github.com/rauenzi/BDPluginLibrary/blob/683d6abc70f149a39e2f0433ffb65e55ca47c4e3/release/0PluginLibrary.plugin.js#L2585C15-L2611>
 *
 * @remarks Used mainly in findInReactTree
 */
export function findInTree(
    tree: React.ReactElement,
    searchFilter: (arg0: any) => any,
    args: { walkable?: string[]; ignore?: string[]; maxRecursion: number } = {maxRecursion: 100},
): React.ReactElement | null | undefined
{
    const { walkable, ignore, maxRecursion } = args;

    if (maxRecursion <= 0) return undefined;

    if (searchFilter(tree)) {
        return tree;
    }

    if (typeof tree !== "object" || tree == null) return undefined;

    let tempReturn;

    if (Array.isArray(tree))
    {
        for (const value of tree)
        {
            tempReturn = findInTree(value, searchFilter, {
                walkable,
                ignore,
                maxRecursion: maxRecursion - 1,
            });

            if (typeof tempReturn !== "undefined") return tempReturn;
        }
    }
    else
    {
        const toWalk = walkable == null ? Object.keys(tree) : walkable;

        for (const key of toWalk)
        {
            if (!Object.prototype.hasOwnProperty.call(tree, key) || ignore?.includes(key)) continue;

            tempReturn = findInTree(tree[key], searchFilter, {
                walkable,
                ignore,
                maxRecursion: maxRecursion - 1,
            });

            if (typeof tempReturn !== "undefined") return tempReturn;
        }
    }

    return tempReturn;
}


export const sleep = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

export function generateInterface<T>(
    data: T | undefined = undefined,
    maxDepth: number = 3,
    currentDepth: number = 0,
    visited = new Set<any>(),
    isTopLevel = true,
): string
{
    if (data === null || (visited.has(data) || currentDepth >= maxDepth))
        return "";

    visited.add(data);

    const keys = Object.keys(data || []);

    let interfaceString = "";

    keys.forEach((key) => {
        if (key.includes("-"))
        {
            const parts = key.split("-");
            parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
            key = parts.join("");
        }

        const value = data[key];

        let valueType: string = typeof value;

        if (valueType === "function") valueType = "() => unknown";

        if (value === undefined || value === null)
            interfaceString += `  ${key}: NonNullable<unknown>;\n`;
        else if (valueType === "object" && !Array.isArray(value))
        {
            interfaceString += `  ${key}: {\n`;
            const nestedInterface = generateInterface(value, maxDepth, currentDepth + 1, visited, false);
            interfaceString += nestedInterface;
            interfaceString += "};\n";
        }
        else if (Array.isArray(value))
        {
            interfaceString += `  ${key}: Array<{\n`;
            const nestedInterface = generateInterface(value, maxDepth, currentDepth + 1, visited, false);
            interfaceString += nestedInterface;
            interfaceString += "}>;\n";
        }
        else
            interfaceString += `  ${key}: ${valueType};\n`;
    });

    const proto = Object.getPrototypeOf(data || {});
    if (proto !== null && currentDepth < maxDepth)
        interfaceString += generateInterface(proto, maxDepth, currentDepth + 1, visited, false);

    if (isTopLevel)
        interfaceString = `interface MyInterface {\n${interfaceString}}`;

    return interfaceString;
}

export function cache<T>(factory: () => T): () => T
{
    const cache = {} as { current?: T };

    return (): T =>
    {
        if ("current" in cache) return cache.current as T;

        const current = factory();

        cache.current = current;

        return current;
    }
}

export function proxyCache<T extends object>(factory: () => T, typeofIsObject: boolean = false): T
{
    const handlers: ProxyHandler<T> = {};

    const cacheFactory = cache(factory);

    for (const key of Object.getOwnPropertyNames(Reflect) as Array<keyof typeof Reflect>)
    {
        const handler = Reflect[key];

        if (key === "get")
        {
            handlers.get = (target, prop, r) =>
            {
                if (prop === "prototype") return (cacheFactory() as any).prototype ?? Function.prototype;
                if (prop === Symbol.for("proxy.cache")) return cacheFactory;
                return Reflect.get(cacheFactory(), prop, r);
            }

            continue;
        }

        if (key === "ownKeys")
        {
            handlers.ownKeys = () =>
            {
                const keys = Reflect.ownKeys(cacheFactory());
                if (!typeofIsObject && !keys.includes("prototype")) keys.push("prototype");
                return keys;
            };

            continue;
        }

        // @ts-expect-error
        handlers[key] = function(target, ...args)
        {
            // @ts-expect-error
            return handler.apply(this, [ cacheFactory(), ...args ]);
        }
    }

    return new Proxy(
        Object.assign(
            typeofIsObject
                ? {}
                : function () {},
            {
                [Symbol.for("proxy.cache")]: cacheFactory
            }
        ) as T, handlers
    );
}

export const getPropValue = (variableName: string): string => getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
