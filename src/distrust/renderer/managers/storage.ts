import {coreLogger} from "../../devConsts";

class DataHandler 
{
    private readonly fileName: string;
    private id: any;
    constructor(id: any) 
    {
        this.id = id;
        this.fileName = `${id}.json`;
    }

    get = async (key: string): Promise<any> => {
        try {
            const fileContent = await window.DistrustNative.ipcRenderer.get(this.fileName);
            const jsonData = JSON.parse(fileContent);
            coreLogger.info(jsonData)
            return jsonData[key];
        } catch (error) {
            console.error(`Error getting key ${key} from file ${this.fileName}:`, error);
            return null;
        }
    };

    set = async (key: string, value: any): Promise<void> => {
        try {
            let fileContent: string;
            try {
                fileContent = await window.DistrustNative.ipcRenderer.get(this.fileName);
                fileContent = JSON.parse(fileContent);
            } catch (error) {
              fileContent = JSON.parse("{}");
            }
            coreLogger.info(fileContent)
            fileContent[key] = value;
            coreLogger.info(JSON.stringify(fileContent))
            await window.DistrustNative.ipcRenderer.set(this.fileName, JSON.stringify(fileContent));
        } catch (error) {
            console.error(`Error setting key ${key} to value ${value} in file ${this.fileName}:`, error);
        }
    };
}

export { DataHandler };