import { coreLogger } from "../../devConsts";

class DataHandler
{
    private readonly fileName: string;
    private id: any;

    constructor(id: any)
    {
        this.id = id;
        this.fileName = `${id}.json`;
    }

    get = async (key: string): Promise<any> =>
    {
        try
        {
            const fileContent = await window.DistrustNative.settings.get(this.fileName);
            const jsonData = JSON.parse(fileContent);

            return jsonData[key];
        }
        catch (error)
        {
            coreLogger.error(`Error getting key ${key} from file ${this.fileName}:`, error);

            try
            {
                await window.DistrustNative.settings.set(this.fileName, JSON.stringify({}, null, 2));

                const fileContent = await window.DistrustNative.settings.get(this.fileName);
                const jsonData = JSON.parse(fileContent);

                return jsonData[key];
            }
            catch (creationError)
            {
                coreLogger.error(`Error creating file ${this.fileName}:`, creationError);
                return null;
            }
        }
    };


    set = async (key: string, value: any): Promise<void> =>
    {
        try
        {
            let fileContent: Record<string, unknown>;

            try
            {
                fileContent = JSON.parse(await window.DistrustNative.settings.get(this.fileName));
            }
            catch (error)
            {
              fileContent = {};
            }

            fileContent[key] = value;

            await window.DistrustNative.settings.set(this.fileName, JSON.stringify(fileContent));
        }
        catch (error)
        {
            coreLogger.error(`Error setting key ${key} to value ${value} in file ${this.fileName}:`, error);
        }
    };
}

export { DataHandler };