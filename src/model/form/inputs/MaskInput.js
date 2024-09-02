import { BaseInput } from '@/model/form/inputs/BaseInput';

/**
 * @typedef {object} MaskInputConstructor
 * @property {import('@/model/form/inputs/BaseInput').AutoFormInputSize} [size='md']
 * @property {string} mask
 * @property {string} [icon]
 * @property {boolean} [iconRight=false]
 * @property {string} [placeholder]
 */

/**
 * Модель элемента формы Mask
 * @extends {BaseInput}
 */
export class MaskInput extends BaseInput {
    /** @type {import('@/model/form/inputs/BaseInput').AutoFormInputType} */
    TYPE = 'MASK';
    /**  Размер элемента формы */
    size = 'md';
    /** Можно подсмотреть тут {@link https://www.primefaces.org/diamond/icons.xhtml} */
    icon;
    /** Положение иконки справа */
    iconRight = false;
    /** Placeholder элемента формы */
    placeholder;
    /** Маска инпута {@link https://primevue.org/inputmask/#mask} */
    mask;

    /** @param {MaskInputConstructor &  import('@/model/form/inputs/BaseInput').BaseInputConstructor} props */
    constructor(props) {
        super(props);
        const { size = 'md', icon, iconRight, placeholder, mask } = props;
        if (!mask) throw new Error('Mask is required');
        this.mask = mask;
        this.size = size;
        this.icon = icon;
        this.iconRight = iconRight;
        this.placeholder = placeholder;
    }
}
