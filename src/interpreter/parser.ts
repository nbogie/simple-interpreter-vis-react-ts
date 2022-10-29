import { Instruction, RegisterName } from "./types";

/** Parse one instruction from a string such as 'mov a -10'
 * into a structured Instruction representation such as
 * { command: "mov", toRegister: "a", sourceRegOrValue: -10 }
 * or throw an error if the instruction is invalid.
 *
 * @param instructionString The string to parse
 * @returns an Instruction object representing the parsed instruction
 */
export function parseInstruction(
    instructionString: string
): Readonly<Instruction> {
    //Instruction string format = cmd registerName [registerName | number]
    const [command, arg2, arg3] = instructionString.split(" ");

    switch (command) {
        case "dec":
        case "inc":
            return {
                command,
                registerName: parseRegisterNameOrFail(arg2),
            };
        case "jnz":
            return {
                command,
                testRegOrValue: parseRegisterNameOrIntOrFail(arg2),
                offset: parseIntOrFail(arg3),
            };
        case "mov": {
            return {
                command,
                toRegister: parseRegisterNameOrFail(arg2),
                sourceRegOrValue: parseRegisterNameOrIntOrFail(arg3),
            };
        }
        default:
            throw new Error(
                "Unknown command when parsing instruction: " + instructionString
            );
    }
}

export function isValidRegisterName(
    candidate: string
): candidate is RegisterName {
    return candidate.match(/^[a-z]+$/i) !== null;
}

function parseRegisterNameOrFail(candidate: string): RegisterName {
    if (isValidRegisterName(candidate)) {
        return candidate;
    }
    throw new Error("invalid register name: " + candidate);
}

function parseRegisterNameOrIntOrFail(str: string): number | RegisterName {
    return isNaN(parseInt(str))
        ? parseRegisterNameOrFail(str)
        : parseIntOrFail(str);
}

function parseIntOrFail(str: string): number {
    const n = parseInt(str);
    if (isNaN(n)) {
        throw new Error("Expected number, got: " + str);
    }
    return n;
}
