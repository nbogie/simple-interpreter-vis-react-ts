import { InterpreterState } from "../interpreter/interpreter";
import { Instruction } from "../interpreter/types";
import { UnreachableCodeError } from "../interpreter/utils";

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
                        <div>
                            {index === state.programCounter ? (
                                <span className={"programCounter"}>&gt;</span>
                            ) : (
                                ""
                            )}
                        </div>
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
                <div className="instructionRowInner">
                    <span>{instruction.command}</span>
                    <span>{instruction.toRegister}</span>
                    <span>{instruction.sourceRegOrValue}</span>
                </div>
            );

        case "inc":
        case "dec":
            return (
                <div className="instructionRowInner">
                    <span>{instruction.command}</span>
                    <span>{instruction.registerName}</span>
                    <span></span>
                </div>
            );

        case "jnz":
            return (
                <div className="instructionRowInner">
                    <span>{instruction.command}</span>
                    <span>{instruction.testRegOrValue}</span>
                    <span>{instruction.offset}</span>
                </div>
            );
        default:
            throw new UnreachableCodeError(
                instruction,
                "instruction: " + JSON.stringify(instruction)
            );
    }
}
