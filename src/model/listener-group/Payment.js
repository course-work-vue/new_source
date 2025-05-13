// src/model/listener-group/Payment.js
export default class Payment {
    constructor({
        id = null,
        contract_id = null,
        expiration_date = null,
        all_sum = 0,
        deposited_amount = 0, // Удалено, т.к. генерируется БД
        status = 'not_paid',    // Новое поле, значение по умолчанию
        date_paid_40 = null,    // Ранее date_40
        date_paid_100 = null,   // Новое поле
        bank = '',
        deleted_at = null,
        left_to_pay = 0,      // Удалено, т.к. генерируется БД
    } = {}) {
        this.id = id;
        this.contract_id = contract_id;
        this.expiration_date = expiration_date; // Срок оплаты
        this.all_sum = all_sum;
        this.status = status;
        this.date_paid_40 = date_paid_40;     // Дата оплаты 40%
        this.date_paid_100 = date_paid_100;   // Дата полной оплаты
        this.bank = bank;
        this.deleted_at = deleted_at;

        // Эти поля могут приходить с бэкенда для отображения, но не участвуют в POST/PUT как редактируемые
        this.deposited_amount = deposited_amount;
        this.left_to_pay = left_to_pay;
    }
}