import Formatter from "@/utils/Formatter";

export default class Import_Disciple_Department {
  department;

  constructor(import_disciple_department) {
    this.department = import_disciple_department?.department ?? null;
  }
}
