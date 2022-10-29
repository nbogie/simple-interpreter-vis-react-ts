import { isValidRegisterName, parseInstruction } from "./parser";
import { Instruction } from "./types";

test("all instructions can be parsed", function () {
    expect(parseInstruction("dec b")).toEqual({
        command: "dec",
        registerName: "b",
    } as Instruction);

    expect(() => parseInstruction("dec 4")).toThrowError();
    expect(() => parseInstruction("dec :")).toThrowError();

    expect(parseInstruction("inc a")).toEqual({
        command: "inc",
        registerName: "a",
    } as Instruction);

    expect(parseInstruction("inc tattoo")).toEqual({
        command: "inc",
        registerName: "tattoo",
    } as Instruction);

    expect(() => parseInstruction("inc tattoo7")).toThrowError();

    expect(parseInstruction("jnz a -2")).toEqual({
        command: "jnz",
        testRegOrValue: "a",
        offset: -2,
    } as Instruction);

    expect(parseInstruction("jnz c 33")).toEqual({
        command: "jnz",
        testRegOrValue: "c",
        offset: 33,
    } as Instruction);

    expect(parseInstruction("jnz 17 33")).toEqual({
        command: "jnz",
        testRegOrValue: 17,
        offset: 33,
    } as Instruction);

    //bad 3rd arg
    expect(() => parseInstruction("jnz c potato")).toThrowError();

    expect(parseInstruction("mov a -10")).toEqual({
        command: "mov",
        toRegister: "a",
        sourceRegOrValue: -10,
    } as Instruction);

    expect(parseInstruction("mov a 22")).toEqual({
        command: "mov",
        toRegister: "a",
        sourceRegOrValue: 22,
    } as Instruction);

    //but not the other way around...
    expect(() => parseInstruction("mov 22 a")).toThrowError();

    expect(parseInstruction("mov a b")).toEqual({
        command: "mov",
        toRegister: "a",
        sourceRegOrValue: "b",
    } as Instruction);

    //unknown commands
    expect(() => parseInstruction("zing a")).toThrowError();
});

test("Pointless extra test. Just for illustration", () => {
    const inputLines = [
        "mov a 5",
        "inc a",
        "dec a",
        "dec a",
        "jnz a -1",
        "inc a",
    ];
    const expectedInstructions: Instruction[] = [
        {
            command: "mov",
            toRegister: "a",
            sourceRegOrValue: 5,
        },
        {
            command: "inc",
            registerName: "a",
        },
        {
            command: "dec",
            registerName: "a",
        },
        {
            command: "dec",
            registerName: "a",
        },
        {
            command: "jnz",
            testRegOrValue: "a",
            offset: -1,
        },
        {
            command: "inc",
            registerName: "a",
        },
    ];
    expect(inputLines.map(parseInstruction)).toEqual(expectedInstructions);
});

test("isValidRegisterName", () => {
    expect(isValidRegisterName("a")).toBe(true);
    expect(isValidRegisterName("X")).toBe(true);
    expect(isValidRegisterName("hApPy")).toBe(true);

    expect(isValidRegisterName("un-happy")).toBe(false);
    expect(isValidRegisterName("3")).toBe(false);
    expect(isValidRegisterName("a1")).toBe(false);
});
