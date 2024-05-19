import {coreLogger} from "../../devConsts";

export const manifest =
    {
        name: 'Experiments',
        version: '1.0.0',
        description: 'Enables Developer Options/Experiments',
        authors: ['Evie']
    }

export function start()
{
   coreLogger.info('Experiments are loading') 
}

export const patches = [
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

export function stop()
{
    coreLogger.info('This plugin cant be stopped omegalul')
}