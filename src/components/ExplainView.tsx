import {
    getNextInstruction,
    InterpreterState,
} from "../interpreter/interpreter";
import { Instruction } from "../interpreter/types";
import { UnreachableCodeError } from "../interpreter/utils";

interface ExplainViewProps {
    state: InterpreterState;
}
export function ExplainView({ state }: ExplainViewProps): JSX.Element {
    const instruction: Instruction | null = getNextInstruction(state);
    if (instruction === null) {
        return <div>No next instruction - program ended</div>;
    }
    return (
        <div>
            Next instruction will: {explanationForInstruction(instruction)}
        </div>
    );
}
function explanationForInstruction(instruction: Instruction): JSX.Element {
    switch (instruction.command) {
        case "mov":
            return (
                <p>{`Move ${instruction.sourceRegOrValue} into register ${instruction.toRegister}`}</p>
            );

        case "inc":
        case "dec":
            return (
                <p>
                    {(instruction.command === "inc"
                        ? "Increment"
                        : "Decrement") +
                        " the value in register " +
                        instruction.registerName +
                        " by 1"}
                </p>
            );

        case "jnz":
            return (
                <p>
                    Jump {instruction.offset} if {instruction.testRegOrValue} is
                    not 0.
                </p>
            );

        default:
            throw new UnreachableCodeError(
                instruction,
                "Unknown instruction: " + JSON.stringify(instruction)
            );
    }
}
