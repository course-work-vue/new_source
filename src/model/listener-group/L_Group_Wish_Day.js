import Formatter from "@/utils/Formatter";

export default class L_Group_Wish_Day {
  l_group_wish_day_id;
  day_id;
  starttime;
  endtime;
  l_group_id;
  deleted_at;

  constructor(l_group_wish_day) {
    this.l_group_wish_day_id = l_group_wish_day?.l_group_wish_day_id ?? null;
    this.day_id = l_group_wish_day?.day_id ?? null;
    this.starttime = l_group_wish_day?.starttime ?? null;
    this.endtime = l_group_wish_day?.endtime ?? null;
    this.l_group_id = l_group_wish_day?.l_group_id ?? null;
    this.deleted_at = l_group_wish_day?.deleted_at ?? null;
  }
}
