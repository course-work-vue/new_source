import Formatter from "@/utils/Formatter";

export default class Import_Program_Code {
  codes;

  constructor(import_program_code) {
    this.codes = import_program_code?.code ?? null;
  }
}
