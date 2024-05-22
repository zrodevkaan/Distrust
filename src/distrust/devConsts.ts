import {CoreLogger} from "./api/logger";
import {DataHandler} from "./renderer/managers/storage";

export const coreLogger = new CoreLogger('distrust')
export const generalSettings = new DataHandler('distrust')