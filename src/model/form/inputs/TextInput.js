import { BaseInput } from '@/model/form/inputs/BaseInput';



export class TextInput extends BaseInput {

    TYPE = 'TEXT';

    size = 'md';


    icon;

    iconRight = false;

    placeholder;

    type = 'number';
    constructor(props) {
        super(props);
        console.log(props);
        const { size = 'md', icon, iconRight = false, placeholder, type = 'text' } = props;
        console.log(type);
        this.size = size;
        this.type = type;
        this.icon = icon;
        this.iconRight = iconRight;
        this.placeholder = placeholder;
    }
}
