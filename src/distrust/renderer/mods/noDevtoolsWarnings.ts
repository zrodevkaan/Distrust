import { Logger } from '../../api/logger';

const logger = new Logger('NoDevtoolsWarnings');

export const {
    pluginName, pluginVersion, pluginDescription, pluginAuthors
} = {
    pluginName: 'NoDevtoolsWarnings',
    pluginVersion: '1.0.0',
    pluginDescription: 'Removes DevTools warnings and prevents you from getting logged out when closing Discord with DevTools enabled.',
    pluginAuthors: ['Evie'],
}

export const start = (): void => {
    logger.log('Starting NoDevToolsWarnings');
}

export const patches = [
    {
        find: 'UserDefenses:',
        replacements: [
            {
                match: /UserDefenses:function\(\)\{(.+?)\}/,
                replace: 'UserDefenses:function(){return ()=>{}}',
            },
        ],
    }
]
