import { BaseInput } from '@/model/form/inputs/BaseInput';

/**
 * @typedef {object} TextInputConstructor
 * @property {import('@/model/form/inputs/BaseInput').AutoFormInputSize} [size='md']
 * @property {string} [icon]
 * @property {boolean} [iconRight=false]
 * @property {string} [placeholder]
 */

/**
 * Модель элемента формы Text
 * @extends {BaseInput}
 */
export class TextInput extends BaseInput {
    /** @type {import('@/model/form/inputs/BaseInput').AutoFormInputType} */
    TYPE = 'TEXT';
    /**  Размер элемента формы {import('@/model/form/inputs/BaseInput').AutoFormInputSize} */
    size = 'md';

    /** Можно посмотреть тут {@link https://www.primefaces.org/diamond/icons.xhtml} */
    icon;
    /** Положение иконки справа */
    iconRight = false;
    /** Placeholder элемента формы */
    placeholder;

    /** @param {TextInputConstructor &  import('@/model/form/inputs/BaseInput').BaseInputConstructor} props */
    constructor(props) {
        super(props);
        const { size = 'md', icon, iconRight = false, placeholder } = props;
        this.size = size;
        this.icon = icon;
        this.iconRight = iconRight;
        this.placeholder = placeholder;
    }
}
