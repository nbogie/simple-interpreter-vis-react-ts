interface RawProgramViewProps {
    rawProgramText: string;
    setRawProgramText: (newText: string) => void;
    isRawProgramTextDirty: boolean;
    setIsRawProgramTextDirty: (newDirty: boolean) => void;
    submitNewProgram: (newText: string) => boolean;
}
export function RawProgramView({
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
                    const result = submitNewProgram(rawProgramText);
                    if (result) {
                        setIsRawProgramTextDirty(false);
                    }
                }}
                disabled={!isRawProgramTextDirty}
            >
                {isRawProgramTextDirty ? "parse" : "parsed"}
            </button>
        </div>
    );
}
