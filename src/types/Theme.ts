export interface Theme {
    manifest: {
        name: string;
        authors: string[];
        description: string;
        version: string;
    };
    source: string,
    started: boolean;
}