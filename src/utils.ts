export function assert(condition: unknown, msg?: string): asserts condition {
    if (condition === false) throw new Error(msg);
}

export class UnreachableCodeError extends Error {
    constructor(myNever: never, message: string) {
        super(message);
    }
}
