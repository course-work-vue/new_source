import { BaseInput } from '@/model/form/inputs/BaseInput';

/**
 * @typedef {object} DateInputConstructor
 * @property {boolean} [showIcon=false]
 * @property {string} dateFormat
 * @property {Date} [minDate]
 * @property {Date} [maxDate]
 * @property {boolean} [showButtonBar]
 * @property {import('@/model/form/inputs/BaseInput').AutoFormInputSize} [size='md']
 */

/**
 * Модель элемента формы Date
 * @link {https://primevue.org/calendar/#format}
 * @extends {BaseInput}
 */
export class DateInput extends BaseInput {
    /** @type {import('@/model/form/inputs/BaseInput').AutoFormInputType} */
    TYPE = 'DATE';
    /** Показывать ли иконку */
    showIcon = false;
    /** Формат даты {@link https://primevue.org/calendar/#format} */
    dateFormat;
    /** Минимальная для выбора дата */
    minDate;
    /** Максимальная для выбора дата */
    maxDate;
    /** Дополнительные элементы ui {@link https://primevue.org/calendar/#button} */
    showButtonBar = true;
    /**  Размер элемента формы */
    size;

    /** @param {DateInputConstructor &  import('@/model/form/inputs/BaseInput').BaseInputConstructor} props */
    constructor(props) {
        super(props);
        const {
            showIcon,
            dateFormat,
            minDate,
            maxDate,
            showButtonBar = true,
            size = 'md',
        } = props;
        this.showIcon = showIcon;
        this.dateFormat = dateFormat;
        this.minDate = minDate;
        this.maxDate = maxDate;
        this.showButtonBar = showButtonBar;
        this.size = size;
    }
}
