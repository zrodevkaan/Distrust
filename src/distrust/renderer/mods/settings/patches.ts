export default
[
    {
        find: ".versionHash",
        replacements:
        [
            {
                match: /appArch,children:.{0,200}?className:\w+\.line,.{0,100}children:\w+}\):null/,
                replace: `$&,distrust.plugins.getExports('settings').VersionInfo()`,
            },
        ],
    }
];