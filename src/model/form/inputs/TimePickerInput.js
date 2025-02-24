import { BaseInput } from "./BaseInput";

export class TimePickerInput extends BaseInput {
  constructor(options = {}) {
    super(options);
    this.type = "time";
    this.format = "HH:mm:ss"; // Указываем поддержку секунд
  }
}
