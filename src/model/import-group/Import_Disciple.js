import Formatter from "@/utils/Formatter";

export default class Import_Disciple {
  id;
  program_id;
  disciple_name;
  deleted_at;
  hours;

  constructor(import_disciple) {
    this.id = import_disciple?.id ?? null;
    this.program_id = import_disciple?.program_id ?? null;
    this.disciple_name = import_disciple?.disciple_name ?? null;
    this.deleted_at = import_disciple?.deleted_at ?? null;
    this.hours = import_disciple?.hours ?? null;
  }
}
