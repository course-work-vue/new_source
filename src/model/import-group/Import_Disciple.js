import Formatter from "@/utils/Formatter";

export default class Import_Disciple {
  id;
  program_id;
  disciple_name;
  deleted_at;
  hours;
  contact_hours;           // integer
  lecture_hours;           // integer
  lab_hours;               // integer
  practice_hours;          // integer
  ksr_hours;               // integer
  ikr_hours;               // integer
  independent_study_hours; // integer
  control_hours;           // integer
  semester;                  
  department;                

  constructor(import_disciple) {
    this.id = import_disciple?.id ?? null;
    this.program_id = import_disciple?.program_id ?? null;
    this.disciple_name = import_disciple?.disciple_name ?? null;
    this.deleted_at = import_disciple?.deleted_at ?? null;
    this.hours = import_disciple?.hours ?? null;
    this.contact_hours = import_disciple?.contact_hours ?? null;
    this.lecture_hours = import_disciple?.lecture_hours ?? null;
    this.lab_hours = import_disciple?.lab_hours ?? null;
    this.practice_hours = import_disciple?.practice_hours ?? null;
    this.ksr_hours = import_disciple?.ksr_hours ?? null;
    this.ikr_hours = import_disciple?.ikr_hours ?? null;
    this.independent_study_hours = import_disciple?.independent_study_hours ?? null;
    this.control_hours = import_disciple?.control_hours ?? null;
    this.semester = import_disciple?.semester ?? null;
    this.department = import_disciple?.department ?? null;
  }
}
