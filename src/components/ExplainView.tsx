import {
    getNextInstruction,
    InterpreterState,
    literalOrRegValue,
} from "../interpreter/interpreter";
import { Instruction, RegisterName, Registers } from "../interpreter/types";
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
            Next instruction will:{" "}
            {explanationForInstruction(instruction, state.registers)}
        </div>
    );
}
function explanationForInstruction(
    instruction: Instruction,
    registers: Registers
): JSX.Element {
    switch (instruction.command) {
        case "mov":
            return (
                <p>
                    Move{" "}
                    <RegNameOrValue
                        candidate={instruction.sourceRegOrValue}
                        registers={registers}
                    />{" "}
                    into register{" "}
                    <RegNameAndValue
                        regName={instruction.toRegister}
                        registers={registers}
                    />{" "}
                </p>
            );

        case "inc":
        case "dec":
            return (
                <p>
                    {(instruction.command === "inc"
                        ? "Increment"
                        : "Decrement") + ` the value in register `}
                    <RegNameAndValue
                        regName={instruction.registerName}
                        registers={registers}
                    />{" "}
                    by 1 to become{" "}
                    {registers[instruction.registerName] +
                        (instruction.command === "inc" ? +1 : -1)}
                </p>
            );

        case "jnz":
            const testValue = literalOrRegValue(
                instruction.testRegOrValue,
                registers
            );

            return (
                <p>
                    {testValue === 0 ? (
                        <>
                            No jump by {instruction.offset} because{" "}
                            <RegNameOrValue
                                candidate={instruction.testRegOrValue}
                                registers={registers}
                            />{" "}
                            IS 0
                        </>
                    ) : (
                        <>
                            Jump by {instruction.offset} because{" "}
                            <RegNameOrValue
                                candidate={instruction.testRegOrValue}
                                registers={registers}
                            />{" "}
                            is not 0.
                        </>
                    )}
                </p>
            );

        default:
            throw new UnreachableCodeError(
                instruction,
                "Unknown instruction: " + JSON.stringify(instruction)
            );
    }
}
function RegNameOrValue(props: {
    candidate: number | RegisterName;
    registers: Registers;
}): JSX.Element {
    if (typeof props.candidate === "number") {
        return <span className="value">{props.candidate}</span>;
    } else {
        const currVal = props.registers[props.candidate];

        return (
            <>
                <RegName regName={props.candidate} /> (
                {currVal === undefined ? "empty" : currVal})
            </>
        );
    }
}

function RegName(props: { regName: RegisterName }): JSX.Element {
    return <span className="regName">{props.regName}</span>;
}

function RegNameAndValue({
    regName,
    registers,
}: {
    regName: RegisterName;
    registers: Registers;
}): JSX.Element {
    const currVal = registers[regName];
    return (
        <>
            <span className="regName">{regName}</span>(
            {currVal === undefined ? "empty" : currVal})
        </>
    );
}
