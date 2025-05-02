import Formatter from "@/utils/Formatter";

export default class Import_Disciple_Semester {
  semester ;

  constructor(import_disciple_semester) {
    this.semester  = import_disciple_semester?.semester ?? null;
  }
}
