// src/model/listener-group/Payment.js
export default class Payment {
    constructor({
        id = null,
        contract_id = null,
        expiration_date = null,
        all_sum = 0,
        deposited_amount = 0, 
        status = 'not_paid',    
        date_paid_40 = null,    
        date_paid_100 = null,   
        bank = '',
        deleted_at = null,
        left_to_pay = 0,      
    } = {}) {
        this.id = id;
        this.contract_id = contract_id;
        this.expiration_date = expiration_date ? new Date(expiration_date) : null; 
        this.all_sum = all_sum;
        this.status = status;
        this.date_paid_40 = date_paid_40 ? new Date(date_paid_40) : null;     
        this.date_paid_100 = date_paid_100 ? new Date(date_paid_100) : null;  
        this.bank = bank;
        this.deleted_at = deleted_at;

        this.deposited_amount = deposited_amount;
        this.left_to_pay = left_to_pay;
    }
}