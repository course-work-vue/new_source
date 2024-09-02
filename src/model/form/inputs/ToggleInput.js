import { BaseInput } from '@/model/form/inputs/BaseInput';

/**
 * @typedef ToggleInputConstructor
 * @property {string} onLabel
 * @property {string} offLabel
 * @property {string} [onIcon]
 * @property {string} [offIcon]
 */

/**
 *  Модель элемента формы Toggle
 *  @extends {BaseInput}
 */
export class ToggleInput extends BaseInput {
    /** @type {import('@/model/form/inputs/BaseInput').AutoFormInputType} */
    TYPE = 'TOGGLE';
    /** Название включенного toggle  */
    onLabel;
    /** Название выключенного toggle  */
    offLabel;
    /** Иконка включенного toggle  */
    onIcon;
    /** Иконка выключенного toggle  */
    offIcon;

    /** @param {ToggleInputConstructor & import('@/model/form/inputs/BaseInput').BaseInputConstructor} props */
    constructor(props) {
        super(props);
        const {
            onLabel = 'ON',
            offLabel = 'OFF',
            onIcon = '',
            offIcon = '',
        } = props;
        this.onLabel = onLabel;
        this.offLabel = offLabel;
        this.onIcon = onIcon;
        this.offIcon = offIcon;
    }
}
