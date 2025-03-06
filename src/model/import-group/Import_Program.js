import Formatter from "@/utils/Formatter";

export default class Import_Program {
  id;
  code;
  profile;
  years;
  p_version;
  deleted_at;
  selected;

  constructor(import_program) {
    this.id = import_program?.id ?? null;
    this.code = import_program?.code ?? null;
    this.profile = import_program?.profile ?? null;
    this.years = import_program?.years ?? null;
    this.p_version = import_program?.p_version ?? null;
    this.deleted_at = import_program?.deleted_at ?? null;
    this.selected = import_program?.selected ?? null;
  }
}
