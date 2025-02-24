import Formatter from "@/utils/Formatter";

export default class Day {
  day_id;
  dayofweek;

  constructor(day) {
    this.day_id = day?.day_id ?? null;
    this.dayofweek = day?.dayofweek ?? null;
  }
}
