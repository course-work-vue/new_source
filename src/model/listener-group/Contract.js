import Formatter from "@/utils/Formatter";
import { useListenerStore } from '@/store2/listenergroup/listener';
import { usePayerStore } from '@/store2/listenergroup/payer';
import { useProgramStore } from '@/store2/listenergroup/program';

export default class Contract {
  id;
  listener_id;
  payer_id;
  program_id;
  cert_date;
  listened_hours;
  date_enroll;
  date_kick;
  group_to_move;
  contr_number;
  deleted_at;

  constructor(contract) {
    this.id = contract?.id ?? null;
    this.listener_id = contract?.listener_id ?? null;
    this.payer_id = contract?.payer_id ?? null;
    this.program_id = contract?.program_id ?? null;
    this.cert_date = contract?.cert_date ? new Date(contract.cert_date): null;
    this.listened_hours = contract?.listened_hours ?? null;
    this.date_enroll = new Date(contract?.date_enroll) ?? null;
    this.date_kick = new Date(contract?.date_kick) ?? null;
    this.group_to_move = contract?.group_to_move ?? null;
    this.contr_number = contract?.contr_number ?? null;
    this.deleted_at = contract?.deleted_at ?? null;
  }

  get program_name() {
  
      const programStore = useProgramStore();
      const program = programStore.programMap[this.program_id]; 
      console.log(program)
      if (program) {
          return program.program_name || null;
      } else {
          return null;
      }
  }

  get full_name() {
    const listenerStore = useListenerStore();
    const listener = listenerStore.listenerMap[this.listener_id];
        return listener ? listener.full_name : null;
  }

  get payer_full_name() {
    const payerStore = usePayerStore();
    const payer = payerStore.payerMap[this.payer_id];
        return payer ? payer.full_name : null;
  }
}
