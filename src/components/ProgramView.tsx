import { InterpreterState } from "../interpreter/interpreter";
import { Instruction } from "../interpreter/types";

interface ProgramViewProps {
    state: InterpreterState;
}
export function ProgramView({ state }: ProgramViewProps) {
    const { registers, instructions } = state;
    return (
        <section>
            Program View
            <div className="instructionsList">
                {instructions.map((instruction, index) => (
                    <div className="instructionRow" key={index}>
                        <div>{index + 1}</div>
                        <div>{index === state.programCounter ? "＞" : ""}</div>
                        <div>{instructionToViewLine(instruction)}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function instructionToViewLine(instruction: Instruction) {
    switch (instruction.command) {
        case "mov":
            return (
                instruction.command +
                " " +
                instruction.toRegister +
                " " +
                instruction.sourceRegOrValue
            );

        case "inc":
        case "dec":
            return instruction.command + " " + instruction.registerName;
        case "jnz":
            return (
                instruction.command +
                " " +
                instruction.testRegOrValue +
                " " +
                instruction.offset
            );
        default:
            throw new Error("Unknown instruction: " + instruction);
    }
}
