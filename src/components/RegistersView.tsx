import { Fragment } from "react";
import { InterpreterState } from "../interpreter/interpreter";

interface RegistersViewProps {
    state: InterpreterState;
}
export function RegistersView(props: RegistersViewProps) {
    const { registers } = props.state;
    const entries = Object.entries(registers);
    return (
        <div>
            <strong>Registers view</strong>
            <div className="registersViewRow">
                {entries.map(([registerName, value]) => (
                    <Fragment key={registerName}>
                        <div>{registerName}</div>
                        <div>{value}</div>
                    </Fragment>
                ))}
            </div>
        </div>
    );
}
