/** Базовая модель элемента ввода автогенерируемой формы, все остальные модели элементов формы должны унаследоваться от BaseInput  */
export class BaseInput {
    /**
     * Тип элемента
     * @public
     * @type {AutoFormInputType}
     * */
    TYPE;
    /** Имя элемента ввода, которое будет выведено */
    label;
    /** Уникальный ключ в схеме формы */
    key;
    /** Набор правил валидации значения элемента */
    validation;

    /** @param {BaseInputConstructor} a @abstract */
    constructor({ label, key, validation = [] }) { // Default to empty array
        if (!key) throw new Error('Key is required');
        this.label = label;
        this.key = key;
        if (validation) {
            if (Array.isArray(validation)) {
                this.validation = validation;
            } else {
                throw new Error('Validation should be an array of functions');
            }
        } else {
            this.validation = []; // Ensure validation is always an array
        }
    }

    /** Провалидировать элемент ввода по всем переданам правилам */
    validate(v) {
        let errorMessage = '';
        for (const check of this.validation) {
            const error = check(v);
            if (typeof error === 'string' && error) {
                return error;
            }
        }
        return errorMessage || true;
    }
}
