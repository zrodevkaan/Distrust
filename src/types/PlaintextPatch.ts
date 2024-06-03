export interface PlaintextPatch
{
    find: string | RegExp;
    replacements: Array<
        {
            match: string | RegExp,
            replace: string,
        }
        | ((source: string) => string)
    >
}