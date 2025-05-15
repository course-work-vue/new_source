import Formatter from "@/utils/Formatter";

export default class L_Wish_Day {
  l_wish_day_id;
  day_id;
  starttime;
  endtime;
  listener_id;
  deleted_at;

  constructor(l_wish_day) {
    this.l_wish_day_id = l_wish_day?.l_wish_day_id ?? null;
    this.day_id = l_wish_day?.day_id ?? null;
    this.starttime = l_wish_day?.starttime ?? null;
    this.endtime = l_wish_day?.endtime ?? null;
    this.listener_id = l_wish_day?.listener_id ?? null;
    this.deleted_at = l_wish_day?.deleted_at ?? null;
  }
}
