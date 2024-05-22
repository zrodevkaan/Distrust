class DataHandler 
{
    private readonly fileName: string;
    private id: any;
    constructor(id: any) 
    {
        this.id = id;
        this.fileName = `${id}.json`;
    }

    readFile = window.DistrustNative.ipcRenderer.readFile
    writeFile = window.DistrustNative.ipcRenderer.writeFile
}

export { DataHandler };