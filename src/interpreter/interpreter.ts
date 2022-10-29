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

export function createInitialInterpreterState(
    instructionStrings: string[]
): InterpreterState {
    const instructions: Instruction[] =
        instructionStrings.map(parseInstruction);

    const registers: Registers = {};
    let programCounter: ProgramCounter = 0;
    return { registers, programCounter, instructions };
}
export function interpret(instructionStrings: string[]): Registers {
    const state = createInitialInterpreterState(instructionStrings);
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
