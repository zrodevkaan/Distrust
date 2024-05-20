import { Logger } from "./logger";

interface TargetObject
{
    [key: string]: any;
}

type BeforeCallback = (...args: any[]) => void;
type AfterCallback = (...args: any[]) => void;
type InsteadCallback = (originalMethod: Function, ...args: any[]) => any;

export class Patcher
{
    private log: Logger;
    private patches: Map<TargetObject, Map<string, Function>>;

    constructor(context: string)
    {
        this.log = new Logger(context);
        this.patches = new Map();
    }

    private addPatch(targetObject: TargetObject, methodName: string, originalMethod: Function)
    {
        if (!this.patches.has(targetObject))
            this.patches.set(targetObject, new Map());

        this.patches.get(targetObject)!.set(methodName, originalMethod);
    }

    before(targetObject: TargetObject, methodName: string, beforeCallback: BeforeCallback): () => void
    {
        const originalMethod = targetObject[methodName];

        if (!originalMethod || typeof originalMethod !== 'function')
        {
            this.log.error(`Method "${methodName}" not found on the target object.`);
            return function() {};
        }

        this.addPatch(targetObject, methodName, originalMethod);

        targetObject[methodName] = function (...args: any[])
        {
            beforeCallback.apply(this, args);
            return originalMethod.apply(this, args);
        };

        return this.createUnpatchFunction(targetObject, methodName);
    }

    after(targetObject: TargetObject, methodName: string, afterCallback: AfterCallback): () => void
    {
        const originalMethod = targetObject[methodName];

        if (!originalMethod || typeof originalMethod !== 'function')
        {
            this.log.error(`Method "${methodName}" not found on the target object.`);
            return function() {};
        }

        this.addPatch(targetObject, methodName, originalMethod);

        targetObject[methodName] = function ()
        {
            const result = originalMethod.apply(this, arguments);
            afterCallback.call(this, this, result, arguments);
            return result;
        };

        return this.createUnpatchFunction(targetObject, methodName);
    }

    instead(targetObject: TargetObject, methodName: string, insteadCallback: InsteadCallback): () => void
    {
        const originalMethod = targetObject[methodName];

        if (!originalMethod || typeof originalMethod !== 'function')
        {
            this.log.error(`Method "${methodName}" not found on the target object.`);
            return function() {};
        }

        this.addPatch(targetObject, methodName, originalMethod);

        targetObject[methodName] = function (...args: any[])
        {
            return insteadCallback.apply(this, [originalMethod.bind(this), ...args]);
        }

        return this.createUnpatchFunction(targetObject, methodName);
    }

    unpatchAll(): void
    {
        this.patches.forEach((methods, targetObject) =>
            methods.forEach((originalMethod, methodName) =>
                targetObject[methodName] = originalMethod
            )
        );

        this.patches.clear();

        this.log.info("All patches have been removed.");
    }

    private createUnpatchFunction(targetObject: TargetObject, methodName: string): () => void
    {
        return () =>
        {
            if (this.patches.has(targetObject) && this.patches.get(targetObject)!.has(methodName))
            {
                targetObject[methodName] = this.patches.get(targetObject)!.get(methodName)!;

                this.patches.get(targetObject)!.delete(methodName);

                if (this.patches.get(targetObject)!.size === 0)
                    this.patches.delete(targetObject);

                this.log.info(`Unpatched method "${methodName}" on the target object.`);
            }
        };
    }
}
