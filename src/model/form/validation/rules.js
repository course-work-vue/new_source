const PHONE_RX_MASKED = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;
const EMAIL_RX = /^[\w.+-]+@[a-zA-Z\d-]+(\.[a-zA-Z\d-]+)*\.[a-zA-Z]{2,}$/;

export function requiredRule(v) {
    if (!v) return 'Обязательно к заполнению';
    return true;
}


export function minLengthRule(length) {

    return function (v) {
        if (v.length < length) {
            return `Минимальная длина должна быть ${length}`;
        }
    };
}


export function emailRule(v) {
    if (!EMAIL_RX.test(v)) return 'Неправильная почта';
    return true;
}


export function phoneRule(v) {
    if (!v) return true; 

    if (!PHONE_RX_MASKED.test(v)) {
        return 'Номер телефона должен быть в формате +7 (XXX) XXX-XX-XX';
    }
    return true;
}
