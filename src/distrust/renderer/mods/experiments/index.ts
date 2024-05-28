import { coreLogger } from "../../../devConsts";

export const manifest =
    {
        name: 'Experiments',
        version: '1.0.0',
        description: 'Enables Developer Options/Experiments',
        authors: ['Evie'],
        coreMod: true
    }

export function start()
{
   coreLogger.info('Experiments are loading') 
}

export function stop()
{
    coreLogger.info('This plugin cant be stopped omegalul')
}