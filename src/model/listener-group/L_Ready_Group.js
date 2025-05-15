import Formatter from "@/utils/Formatter";

export default class L_Ready_Group {
  program_id;
  program_name;
  potential_size;

  constructor(l_ready_group) {
    this.program_id = l_ready_group?.program_id ?? null;
    this.program_name = l_ready_group?.program_name ?? null;
    this.potential_size = l_ready_group?.potential_size ?? null;
  }
}
