import Formatter from "@/utils/Formatter";

export default class L_Group_Status {
  id;
  group_formed;

  constructor(l_group_status) {
    this.v = l_group_status?.id ?? null;
    this.group_formed = l_group_status?.group_formed ?? null;
  }
}
