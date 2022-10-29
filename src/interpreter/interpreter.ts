import { UnreachableCodeError } from "./utils";
import { parseInstruction } from "./parser";
import { Instruction, ProgramCounter, RegisterName, Registers } from "./types";

export type { Registers };

export { interpret as simple_assembler }; //codewars expected name

export interface InterpreterState {
    registers: Registers;
    programCounter: ProgramCounter;
    instructions: Instruction[];
}

export function isAtEndOfProgram(state: InterpreterState): boolean {
    return state.programCounter >= state.instructions.length;
}

export function getNextInstruction(
    state: InterpreterState
): Instruction | null {
    return state.instructions[state.programCounter] ?? null;
}

export type InstructionParseError = {
    rawString: string;
    lineNumber: number;
    error: string;
};
export function parseInstructionsCollectingErrors(
    instructionStrings: string[]
): [Instruction[], InstructionParseError[]] {
    const instructions: Instruction[] = [];
    const errors: InstructionParseError[] = [];
    for (let i = 0; i < instructionStrings.length; i++) {
        const instrString: string = instructionStrings[i];
        try {
            const instruction: Instruction = parseInstruction(instrString);
            instructions.push(instruction);
        } catch (error) {
            errors.push({
                error: "" + error,
                lineNumber: i,
                rawString: instrString,
            } as InstructionParseError);
        }
    }
    return [instructions, errors];
}

export function createInitialEmptyInterpreterState(): InterpreterState {
    return { registers: {}, programCounter: 0, instructions: [] };
}

export function createInitialInterpreterState(
    instructionStrings: string[]
):
    | { type: "success"; state: InterpreterState }
    | { type: "errors"; errors: InstructionParseError[] } {
    const registers: Registers = {};
    let programCounter: ProgramCounter = 0;

    const [instructions, errors] =
        parseInstructionsCollectingErrors(instructionStrings);

    if (errors.length > 0) {
        return { type: "errors", errors };
    } else {
        return {
            type: "success",
            state: { registers, programCounter, instructions },
        };
    }
}
export function interpret(instructionStrings: string[]): Registers {
    const stateOrErrors = createInitialInterpreterState(instructionStrings);
    if (stateOrErrors.type === "errors") {
        throw new Error(
            "Error parsing instructions: " +
                JSON.stringify(stateOrErrors.errors, null, 2)
        );
    }
    const state = stateOrErrors.state;

    //Validate and structure the instructions
    while (state.programCounter < state.instructions.length) {
        const instruction = state.instructions[state.programCounter];
        const pcOffsetOrNull = executeInstruction(instruction, state.registers);
        state.programCounter += pcOffsetOrNull ?? 1;
    }

    return state.registers;
}

/**
 * Execute a single given Instruction, generally mutating the given registers object.
 * @returns either an offset to be made to the program counter, or null if program should advance as normal
 * */
export function executeInstruction(
    instruction: Instruction,
    registers: Registers
): number | null {
    switch (instruction.command) {
        case "dec":
            registers[instruction.registerName] -= 1;
            return null;

        case "inc":
            registers[instruction.registerName] += 1;
            return null;

        case "jnz":
            if (
                literalOrRegValue(instruction.testRegOrValue, registers) !== 0
            ) {
                return instruction.offset;
            } else {
                return null;
            }

        case "mov": {
            const v =
                typeof instruction.sourceRegOrValue === "number"
                    ? instruction.sourceRegOrValue
                    : registers[instruction.sourceRegOrValue];
            registers[instruction.toRegister] = v;
            return null;
        }

        default:
            //If we don't have exhaustive coverage of instruction.command possibles above,
            //then TS will complain here.
            throw new UnreachableCodeError(
                instruction,
                "Unhandled instruction command: " + JSON.stringify(instruction)
            );
    }
}

function literalOrRegValue(
    sourceRegOrValue: number | RegisterName,
    registers: Registers
): number {
    return typeof sourceRegOrValue === "number"
        ? sourceRegOrValue
        : registers[sourceRegOrValue];
}
