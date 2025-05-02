import Formatter from "@/utils/Formatter";

export default class Import_Program {
  id;
  code;
  profile;
  years;
  deleted_at;
  selected;
  actualization_year;
  start_year;

  constructor(import_program) {
    this.id = import_program?.id ?? null;
    this.code = import_program?.code ?? null;
    this.profile = import_program?.profile ?? null;
    this.years = import_program?.years ?? null;
    this.deleted_at = import_program?.deleted_at ?? null;
    this.selected = import_program?.selected ?? null;
    this.actualization_year = import_program?.actualization_year ?? null;
    this.start_year = import_program?.start_year ?? null;
  }
}
