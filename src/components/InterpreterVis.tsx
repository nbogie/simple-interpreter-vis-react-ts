import { useState } from "react";
import {
    createInitialInterpreterState,
    executeInstruction,
    getNextInstruction,
    InterpreterState,
    isAtEndOfProgram,
} from "../interpreter/interpreter";
import { Instruction } from "../interpreter/types";

interface InterpreterStateWithHistory extends InterpreterState {
    pastInstructions: Instruction[];
}
export function InterpreterVis() {
    const exampleProgramRaw = `mov a 5
inc a
dec a
dec a
jnz a -1
inc a`;

    const [rawProgramText, setRawProgramText] = useState(exampleProgramRaw);
    const [isRawProgramTextDirty, setIsRawProgramTextDirty] = useState(false);
    const [state, setState] = useState<InterpreterStateWithHistory>(() =>
        createStateForProgramText(rawProgramText)
    );

    function createStateForProgramText(
        programText: string
    ): InterpreterStateWithHistory {
        return {
            ...createInitialInterpreterState(programText.split("\n")),
            pastInstructions: [],
        };
    }

    function handleReset() {
        setState((prevState) => ({
            ...prevState,
            programCounter: 0,
            registers: {},
            pastInstructions: [],
        }));
    }
    function handleStep() {
        setState((prevState) => {
            if (prevState.programCounter < prevState.instructions.length) {
                const instruction =
                    prevState.instructions[prevState.programCounter];

                const newRegisters = { ...prevState.registers };

                const pcOffsetOrNull = executeInstruction(
                    instruction,
                    newRegisters
                );

                const newState: InterpreterStateWithHistory = {
                    programCounter:
                        prevState.programCounter + (pcOffsetOrNull ?? 1),
                    registers: newRegisters,
                    instructions: prevState.instructions,
                    pastInstructions: [
                        ...prevState.pastInstructions,
                        instruction,
                    ],
                };

                return { ...newState };
            } else {
                return prevState;
            }
        });
    }

    function handleRunToEnd() {
        setState((prevState) => ({ ...prevState }));
    }

    return (
        <section>
            <h1>Interpreter Vis</h1>
            <div className="mainGrid">
                <RawProgramView
                    {...{
                        rawProgramText,
                        setRawProgramText,
                        isRawProgramTextDirty,
                        setIsRawProgramTextDirty,
                        submitNewProgram: () => {
                            setState(createStateForProgramText(rawProgramText));
                        },
                    }}
                />
                <RegistersView state={state} />
                <ProgramView state={state} />
            </div>

            <button disabled={isAtEndOfProgram(state)} onClick={handleStep}>
                {isAtEndOfProgram(state) ? "Ended" : "Step ▶️"}
            </button>

            <button onClick={handleReset}>Reset ⏮</button>
            <button onClick={handleRunToEnd}>Run to end ⏭</button>

            <ExplainView state={state} />
            <HistoryView state={state} />
        </section>
    );
}

function RegistersView(props: RegistersViewProps) {
    const { registers } = props.state;
    const entries = Object.entries(registers);
    return (
        <div>
            <strong>Registers view</strong>
            <div className="registersViewRow">
                {entries.map(([registerName, value]) => (
                    <>
                        <div>{registerName}</div>
                        <div>{value}</div>
                    </>
                ))}
            </div>
        </div>
    );
}

interface ProgramViewProps {
    state: InterpreterState;
}
function ProgramView({ state }: ProgramViewProps) {
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
interface HistoryViewProps {
    state: InterpreterStateWithHistory;
}
function HistoryView({ state }: HistoryViewProps) {
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

function instructionToViewLine(instruction: Instruction) {
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
interface RegistersViewProps {
    state: InterpreterState;
}

interface ExplainViewProps {
    state: InterpreterState;
}

function ExplainView({ state }: ExplainViewProps): JSX.Element {
    const instruction: Instruction | null = getNextInstruction(state);
    if (instruction === null) {
        return <div>No next instruction</div>;
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
                    ( instruction.command + " " + instruction.testRegOrValue + "
                    " + instruction.offset )
                </p>
            );
        default:
            throw new Error("Unknown instruction: " + instruction);
    }
}
interface RawProgramViewProps {
    rawProgramText: string;
    setRawProgramText: (newText: string) => void;
    isRawProgramTextDirty: boolean;
    setIsRawProgramTextDirty: (newDirty: boolean) => void;
    submitNewProgram: (newText: string) => void;
}
function RawProgramView({
    rawProgramText,
    setRawProgramText,
    isRawProgramTextDirty,
    setIsRawProgramTextDirty,
    submitNewProgram,
}: RawProgramViewProps) {
    return (
        <div>
            <strong>Raw Program Text:</strong>
            <br />
            <textarea
                rows={10}
                cols={10}
                value={rawProgramText}
                onChange={(e) => {
                    setRawProgramText(e.target.value);
                    setIsRawProgramTextDirty(true);
                }}
                className={isRawProgramTextDirty ? "dirty" : "parsed"}
            />
            <br />
            <button
                onClick={() => {
                    submitNewProgram(rawProgramText);
                    setIsRawProgramTextDirty(false);
                }}
                disabled={!isRawProgramTextDirty}
            >
                {isRawProgramTextDirty ? "parse" : "parsed"}
            </button>
        </div>
    );
}
