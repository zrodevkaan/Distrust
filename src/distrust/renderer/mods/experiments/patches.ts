export default
[
    {
        find: /"displayName","(Developer)?ExperimentStore"/,
        replacements: [
            {
                match: /window\.GLOBAL_ENV\.RELEASE_CHANNEL/g,
                replace: `"staging"`,
            },
            {
                match: /(isDeveloper:{configurable:!1,get:\(\)=>)\w+/g,
                replace: `$1true`,
            },
            {
                match: /=\(0,\w+\.isStaffEnv\)\(\w+\.default\.getCurrentUser\(\)\)/,
                replace: "=true",
            },
        ],
    },
];