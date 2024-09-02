import { BaseInput } from '@/model/form/inputs/BaseInput';

/**
 * @typedef RadioInputOption
 * @property {string} value
 * @property {string} label
 *
 * @typedef RadioInputConstructor
 * @property {RadioInputOption[]} options
 */

/**
 * Модель элемента формы Radio
 * @extends {BaseInput}
 */
export class RadioInput extends BaseInput {
    /** @type {import('@/model/form/inputs/BaseInput').AutoFormInputType} */
    TYPE = 'RADIO';
    /** Возможные значения инпута */
    options;

    /** @param {RadioInputConstructor & import('@/model/form/inputs/BaseInput').BaseInputConstructor} props  */
    constructor(props) {
        super(props);
        const { options } = props;
        if (options && !Array.isArray(options)) {
            throw new Error('Invalid options list');
        }
        this.options = options;
    }
}
