import { useState } from "react";
import {
    createInitialEmptyInterpreterState,
    createInitialInterpreterState,
    executeInstruction,
    InstructionParseError,
    InterpreterState,
    isAtEndOfProgram,
} from "../interpreter/interpreter";
import { Instruction } from "../interpreter/types";
import { exampleProgramsRaw } from "./exampleProgramsRaw";
import { ExplainView } from "./ExplainView";
import { HistoryView } from "./HistoryView";
import { ProgramView } from "./ProgramView";
import { RawProgramView } from "./RawProgramView";
import { RegistersView } from "./RegistersView";

export interface InterpreterStateWithHistory extends InterpreterState {
    pastInstructions: Instruction[];
}
export function InterpreterVis() {
    const exampleProgramRaw: string = exampleProgramsRaw[0];

    const [rawProgramText, setRawProgramText] = useState(exampleProgramRaw);
    const [isRawProgramTextDirty, setIsRawProgramTextDirty] = useState(false);
    const [state, setState] = useState<InterpreterStateWithHistory>(() => {
        const newState = createStateForProgramText(rawProgramText);
        if (newState.type === "errors") {
            return {
                ...createInitialEmptyInterpreterState(),
                pastInstructions: [],
            };
        } else {
            return newState.state;
        }
    });

    function createStateForProgramText(
        programText: string
    ):
        | { type: "success"; state: InterpreterStateWithHistory }
        | { type: "errors"; errors: InstructionParseError[] } {
        const stateOrErrors = createInitialInterpreterState(
            programText.split("\n")
        );

        if (stateOrErrors.type === "errors") {
            return stateOrErrors;
        }
        return {
            type: "success",
            state: {
                ...stateOrErrors.state,
                pastInstructions: [],
            },
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
                            const parseResult =
                                createStateForProgramText(rawProgramText);
                            if (parseResult.type === "errors") {
                                return false;
                            }
                            setState(parseResult.state);
                            return true;
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
