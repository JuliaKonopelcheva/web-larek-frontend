import { PaymentMethod, IOrderModel } from "../../types";
import { IEvents } from '../../types';

export class OrderModel implements IOrderModel {
	private payment: PaymentMethod = 'card';
	private address: string = '';
	private email: string = '';
	private phone: string = '';

	constructor(private events: IEvents) {}

	// Установка способа оплаты
	setPayment(method: PaymentMethod): void {
		this.payment = method;
	}

	// Установка адреса доставки
	setAddress(value: string): void {
		this.address = value.trim();
	}

	// Установка контактов
	setContacts(email: string, phone: string): void {
		this.email = email.trim();
		this.phone = phone.trim();
	}

    // Валидация контактов
    validateContacts(email: string, phone: string): void {
//      console.log('[Model] validating:', email, phone);
        const isEmailValid = this.validateEmail(email);
        const isPhoneValid = this.validatePhone(phone);
    
        const isValid = isEmailValid && isPhoneValid;
    
        this.events.emit('contacts:validation', {
            isValid,
            isEmailValid,
            isPhoneValid
        });
    }

    // Валидация адреса
    validateOrder(address: string): void {
        const isValid = address.trim().length > 0;
        this.events.emit('order:validation', {
            isValid
        });
    }

	// Валидатор email
	private validateEmail(email: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
	}

	// Валидатор телефона
	private validatePhone(phone: string): boolean {
		return /^[\d\s()+-]{5,}$/.test(phone.trim());
	}
}
