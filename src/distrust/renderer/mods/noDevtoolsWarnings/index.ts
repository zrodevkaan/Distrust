import { Logger } from '../../../api/logger';

const logger = new Logger('NoDevtoolsWarnings');

export const manifest =
    {
        name: 'NoDevToolsWarnings',
        version: '1.0.0',
        description: 'Removes DevTools warnings and prevents you from getting logged out when closing Discord with DevTools enabled.',
        authors: ['Evie']
    }

export const start = (): void => {
    logger.info('Starting NoDevToolsWarnings');
}
