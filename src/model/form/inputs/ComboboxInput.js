import { BaseInput } from '@/model/form/inputs/BaseInput';

/**
 * @typedef ComboboxInputOption
 * @property {string} label
 * @property {string} value
 *
 * @typedef ComboboxInputConstructor
 * @property {ComboboxInputOption[]} options
 * @property {string} [optionLabel='label']
 * @property {string} [optionValue='value']
 * @property {boolean} [filter=true]
 * @property {boolean} [clearIcon=true]
 */

/**
 *  Модель элемента формы Combobox
 *  @extends {BaseInput}
 */
export class ComboboxInput extends BaseInput {
    /** @type {import('@/model/form/inputs/BaseInput').AutoFormInputType} */
    TYPE = 'COMBOBOX';
    /** Список возможных для выбора опций */
    options;
    /** Ключ названии опции в объекте из списка опций */
    optionLabel;
    /** Ключ значения опции в объекте из списка опций */
    optionValue;
    /** Включить фильтрации опций */
    filter;
    /** Показывать иконку отчистки инпута */
    clearIcon;

    /** @param {ComboboxInputConstructor & import('@/model/form/inputs/BaseInput').BaseInputConstructor} props  */
    constructor(props) {
        super(props);
        const {
            options,
            optionLabel = 'label',
            optionValue = 'value',
            filter = true,
            clearIcon = true,
        } = props;
        if (options && !Array.isArray(options)) {
            throw new Error('Invalid options list');
        }
        this.options = options;
        this.optionValue = optionValue;
        this.optionLabel = optionLabel;
        this.filter = filter;
        this.clearIcon = clearIcon;
    }
}
