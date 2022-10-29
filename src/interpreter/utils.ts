/** Throw one of these in the default of a switch statement where you already have exhaustive coverage.
 * Pass whatever you're switching on as the first argument.
 * TypeScript when you tell you when that coverage is no longer exhaustive, because that thing will no longer be `never`.
 * Credit to Mike North for the idea.
 */
export class UnreachableCodeError extends Error {
    constructor(myNever: never, message: string) {
        super(message);
    }
}
