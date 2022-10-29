export type RegisterName = string;

export type Registers = { [key: RegisterName]: number };

export type ProgramCounter = number;
export type ProgramCounterOffset = number;
export type Integer = number;

export type Instruction =
    | { command: "dec"; registerName: RegisterName }
    | { command: "inc"; registerName: RegisterName }
    | {
          command: "jnz";
          testRegOrValue: Integer | RegisterName;
          offset: ProgramCounterOffset;
      }
    | {
          command: "mov";
          toRegister: RegisterName;
          sourceRegOrValue: number | RegisterName;
          //We can do better. have two types of mov command, movReg, movNum?
      };
