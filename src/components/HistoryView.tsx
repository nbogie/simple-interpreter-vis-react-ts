import { InterpreterStateWithHistory } from "./InterpreterVis";
import { instructionToViewLine } from "./ProgramView";

interface HistoryViewProps {
    state: InterpreterStateWithHistory;
}
export function HistoryView({ state }: HistoryViewProps) {
    const { pastInstructions } = state;
    return (
        <section>
            <strong>History View</strong>
            <div className="pastInstructionsList">
                {pastInstructions.map((instruction, index) => (
                    <div className={"pastInstructionRow"} key={index}>
                        <div>{index + 1}:</div>
                        <div>{instructionToViewLine(instruction)}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}
