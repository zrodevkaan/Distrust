export default [
    {
        find: 'Error("Menu',
        replacements: [
            {
                match: /return(\(0,.\.jsx\)\(\w+.OnMenuSelectContext)/,
                replace: (_: any, suffix: any) =>
                    `return distrust.contextMenu.finallyIBuildContextMenu(arguments[0])??${suffix}`,
            },
        ],
    },
    {
        find: ".Menu,{",
        replacements: [
            {
                match: /\.Menu,{/g,
                replace: (prefix: any) => `${prefix}data:arguments,`,
            },
        ],
    },
]