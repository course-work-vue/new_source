import Formatter from "@/utils/Formatter";

export default class Uploaded_File {
  direction_code;
  direction_name;
  deleted_at;
  qualification;
  academic_year;

  constructor(uploaded_file) {
    this.direction_code = uploaded_file?.direction_code ?? null;
    this.direction_name = uploaded_file?.direction_name ?? null;
    this.deleted_at = uploaded_file?.deleted_at ?? null;
  }
}
