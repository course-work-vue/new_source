import Formatter from "@/utils/Formatter";

export default class Listenerlistenergroup {
  id;
  group_program_id;
  hours;
  group_number;
  start_date;
  end_date;
  starttime;
  endtime;
  people_count;
  deleted_at;

  constructor(listenergroup) {
    this.id = listenergroup?.id ?? null;
    this.listenergroup_program_id = listenergroup?.group_program_id ?? null;
    this.hours = listenergroup?.hours ?? null;
    this.group_number = listenergroup?.group_number ?? null;
    this.start_date = listenergroup?.start_date ?? null;
    this.end_date = listenergroup?.end_date ?? null;
    this.starttime = listenergroup?.starttime ?? null;
    this.endtime = listenergroup?.endtime ?? null;
    this.people_count = listenergroup?.people_count ?? null;
    this.deleted_at = listenergroup?.deleted_at ?? null;
  }
}
