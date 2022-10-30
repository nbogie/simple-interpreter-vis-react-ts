import { Fragment } from "react";
import {
    getInvolvedRegistersForUI,
    getNextInstruction,
    InterpreterState,
} from "../interpreter/interpreter";
import { Instruction, RegisterName } from "../interpreter/types";

interface RegistersViewProps {
    state: InterpreterState;
}
export function RegistersView(props: RegistersViewProps) {
    const { registers } = props.state;
    const entries = Object.entries(registers);

    const instruction: Instruction | null = getNextInstruction(props.state);
    const involvedRegisterNames: RegisterName[] = instruction
        ? getInvolvedRegistersForUI(instruction)
        : [];

    return (
        <div>
            <strong>Registers view</strong>
            <div className="registersViewRow">
                {entries.map(([registerName, value]) => (
                    <Fragment key={registerName}>
                        <div
                            className={
                                involvedRegisterNames.includes(registerName)
                                    ? "involvedRegister"
                                    : ""
                            }
                        >
                            {registerName}
                        </div>
                        <div>{value}</div>
                    </Fragment>
                ))}
            </div>
        </div>
    );
}
