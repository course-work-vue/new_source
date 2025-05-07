import { BaseInput } from '@/model/form/inputs/BaseInput'; 

export class MultiSelectInput extends BaseInput {
  TYPE = 'MULTISELECT'; 

  options = [];       
  placeholder = 'Не выбрано';   
  filter = true;      
  display = 'chip';   
  optionLabel = 'label'; 
  optionValue = 'value'; 

  constructor(props) {
    super(props); 

    this.options = props?.options ?? [];
    if (props.placeholder !== undefined) {
      this.placeholder = props.placeholder; 
    }
    this.filter = props?.filter ?? true;
    //this.display = props?.display ?? 'chip';
    this.optionLabel = props?.optionLabel ?? 'label';
    this.optionValue = props?.optionValue ?? 'value';
  }
}

export default MultiSelectInput;