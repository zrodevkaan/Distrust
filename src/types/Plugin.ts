export interface Plugin {
    manifest: {
        name: string;
        authors: string[];
        description: string;
        version: string;
    };
    exports: {
        start?: () => void | Promise<void>;
        stop?: () => void | Promise<void>;
        [key: string]: unknown;
    };
    started?: boolean;
    coremod?: boolean;
};