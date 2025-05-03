import { BaseInput } from '@/model/form/inputs/BaseInput'; // Убедитесь, что путь к BaseInput верный

export class TextareaInput extends BaseInput {

  TYPE = 'TEXTAREA'; // Важно: Уникальное имя типа


  placeholder;


  rows = 3; // Значение по умолчанию


  constructor(props) {

    super(props);


    this.rows = props?.rows ?? 3; 
    this.placeholder = props?.placeholder; 

  }
}

export default TextareaInput;