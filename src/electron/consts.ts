import process from 'process'
import path from 'path'

export const BASE_DIR = process.platform === 'win32'
    ? process.env.APPDATA!
    : process.env.XDG_CONFIG_HOME! || path.join(process.env.HOME!, '.config')