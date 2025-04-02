import Formatter from "@/utils/Formatter";
import { useListenergroupStore } from '@/store2/listenergroup/listenergroup';

export default class Listener_Wish {
  id;
  listener_id;
  group_size;
  hours;
  start_date;
  end_date;
  listener_comment;
  deleted_at;


  constructor(listener_wish) {
    this.id = listener_wish?.id ?? null;
    this.listener_id = listener_wish?.listener_id ?? null;
    this.group_size = listener_wish?.group_size ?? null;
    this.hours = listener_wish?.hours ?? null;
    this.start_date = listener_wish?.start_date ?? null;
    this.end_date = listener_wish?.end_date ?? null;
    this.listener_comment = listener_wish?.listener_comment ?? null;
    this.deleted_at = listener_wish?.deleted_at ?? null;
  }
}
