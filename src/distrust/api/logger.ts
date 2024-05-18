type LogLevel = "log" | "warn" | "error";

export class Logger {
    private static logColor = "#5865F2";
    private static logsHistory: string[] = [];

    constructor(private readonly context: string) {}

    private log(level: LogLevel, message: any[]): void {
        const formattedMessage = `[distrust:plugin:${this.context}] ${message.join(' ')}`;
        Logger.logsHistory.push(formattedMessage);
        console[level](`%c[${this.context}]`, `color: ${Logger.logColor}`, ...message);
    }

    info(...message: any[]): void {
        this.log("log", message);
    }

    warn(...message: any[]): void {
        this.log("warn", message);
    }

    error(...message: any[]): void {
        this.log("error", message);
    }

    static getHistory(): string[] {
        return Logger.logsHistory;
    }
}

export class CoreLogger {
    private static logColor = "#5865F2";
    private static logsHistory: string[] = [];

    constructor(private readonly context: string) {}

    private log(level: LogLevel, message: any[]): void {
        const formattedMessage = `[distrust:core:${this.context}] ${message.join(' ')}`;
        CoreLogger.logsHistory.push(formattedMessage);
        console[level](`%c[Core:${this.context}]`, `color: ${CoreLogger.logColor}`, ...message);
    }

    info(...message: any[]): void {
        this.log("log", message);
    }

    warn(...message: any[]): void {
        this.log("warn", message);
    }

    error(...message: any[]): void {
        this.log("error", message);
    }

    static getHistory(): string[] {
        return CoreLogger.logsHistory;
    }
}
