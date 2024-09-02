import { BaseInput } from '@/model/form/inputs/BaseInput';

/**
 * @typedef CheckboxInputConstructor
 * @property {boolean} binary
 */

/**
 *  Модель элемента формы Checkbox
 *  @extends {BaseInput}
 */
export class CheckboxInput extends BaseInput {
    /** @type {import('@/model/form/inputs/BaseInput').AutoFormInputType} */
    TYPE = 'CHECKBOX';
    /** Значения только true и false */
    binary;

    /** @param {CheckboxInputConstructor & import('@/model/form/inputs/BaseInput').BaseInputConstructor} props */
    constructor(props) {
        super(props);
        const { binary = true } = props;
        this.binary = binary;
    }
}
