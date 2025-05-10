import Formatter from "@/utils/Formatter";
import { useListenergroupStore } from '@/store2/listenergroup/listenergroup';
import { useProgramStore } from '@/store2/listenergroup/program';

export default class Listener {
  id;
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
  deleted_at;

  program_ids;
  group_ids;

  constructor(listener) {
    this.id = listener?.id ?? null;
    this.name = listener?.name ?? null;
    this.surname = listener?.surname ?? null;
    this.lastname = listener?.lastname ?? null;
    this.snils = listener?.snils ?? null;
    this.passport = listener?.passport ?? null;
    this.issued_by = listener?.issued_by ?? null;
    this.issue_date = listener?.issue_date ?? null;
    this.department_code = listener?.department_code ?? null;
    this.registration_address = listener?.registration_address ?? null;
    this.phone_number = listener?.phone_number ?? null;
    this.email = listener?.email ?? null;
    this.deleted_at = listener?.deleted_at ?? null;

    this.program_ids = Array.isArray(listener?.program_ids) ? listener.program_ids : [];
    this.group_ids = Array.isArray(listener?.group_ids) ? listener.group_ids : [];
  }

  get listenergroup_number() {
    const listenergroupStore = useListenergroupStore();
    const listenergroup = listenergroupStore.listenergroupMap[this.group_id];

    const groupNumber = listenergroup?.group_number || listenergroup?.[[Target]]?.group_number;

    return groupNumber ? groupNumber : null;
}

get listener_program() {
  const programStore = useProgramStore();
  const programObj = programStore.programMap[this.program_id];

  const program = programObj?.program_name || programObj?.[[Target]]?.program_name;

  console.log('Программа:', program);

  return program ? program : null;
}

get full_name() {
  
  const nameParts = [];

  if (this.surname) nameParts.push(this.surname);  
  if (this.name) nameParts.push(this.name);     
  if (this.lastname) nameParts.push(this.lastname); 

  return nameParts.join(' ');
  
}

get group_names() {
  const store = useListenergroupStore();
  const namesArray = this.group_ids
    .map(id => {
      const num = store.listenergroupMap[id]?.group_number;
      return num;
    })
    .filter(name => {
      const keep = Boolean(name);
      return keep;
    });

  const result = namesArray.join(', ');

  return result;
}
}
