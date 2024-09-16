import Formatter from "@/utils/Formatter";
import { useListenergroupStore } from '@/store2/listenergroup/listenergroup';

export default class Listener {
  id;
  people_count;
  name;
  surname;
  lastname;
  snils;
  passport;
  issued_by;
  issue_date;
  department_code;
  registration_address;
  phone_number;
  email;
  group_id;
  deleted_at;


  constructor(listener) {
    this.id = listener?.id ?? null;
    this.people_count = listener?.people_count ?? null;
    this.name = listener?.name ?? null;
    this.surname = listener?.surname ?? null;
    this.lastname = listener?.lastname ?? null;
    this.snils = listener?.snils ?? null;
    this.passport = listener?.passport ?? null;
    this.issued_by = listener?.issued_by ?? null;
    this.issued_date = listener?.issue_date ?? null;
    this.department_code = listener?.department_code ?? null;
    this.registration_address = listener?.registration_address ?? null;
    this.phone_number = listener?.phone_number ?? null;
    this.email = listener?.email ?? null;
    this.group_id = listener?.group_id ?? null;
    this.deleted_at = listener?.deleted_at ?? null;
  }

  get group_number() {
    const listenergroupStore = useListenergroupStore();
    const listenergroup = listenergroupStore.listenergroupMap[this.group_id];
    return listenergroup ? listenergroup.group_number : null; // Return the group number if it exists, otherwise return null or a default value
}
}
