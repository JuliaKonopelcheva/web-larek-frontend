import { ensureAllElements, ensureElement } from '../../utils/utils';
import { FormView } from './Form';
import { PaymentMethod } from '../../types';
import { IEvents, FormData, OrderData } from '../../types';


export class OrderFormView extends FormView<OrderData> {
	private address: HTMLInputElement;
	private paymentButtons: HTMLButtonElement[];

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this.address = ensureElement<HTMLInputElement>('input[name="address"]', container);
		this.paymentButtons = ensureAllElements<HTMLButtonElement>('.order__buttons button', container);


        // Обработка изменения формы
		/*
		this.bindEvent(this.address, 'input', () => {
			this.events.emit('order:update', {
				address: this.address.value.trim(),
				payment: this.selectedPayment
			});
		});
		*/

		// Обработка выбора способа оплаты
		this.paymentButtons.forEach((button) => {
			this.bindEvent(button, 'click', () => {
				this.events.emit('order:update', {
					address: this.address.value.trim(),
					payment: button.name as PaymentMethod
				});
			});
		});
	
	}

	// получить имя выделенной кнопки
	private getSelectedPayment(): PaymentMethod {
		const activeButton = this.paymentButtons.find(button =>
			button.classList.contains('button_alt-active')
		);
	
		return activeButton?.name as PaymentMethod;
	}

	// Отметить выбранную кнопку и сохранить выбор
	protected setPayment(method: PaymentMethod): void {
		this.paymentButtons.forEach((button) => {
			this.toggleClass(button,'button_alt-active', button.name === method);
		});
	}


	// Обработка отправки формы
	protected onSubmit(): void {
		this.events.emit('order:submit', {
			address: this.address.value.trim(),
			payment: this.getSelectedPayment()
		});
	}

  protected emitUpdate(): void {
				this.events.emit('order:update', {
					address: this.address.value.trim(),
					payment: this.getSelectedPayment()
				});
	}

	 public override updateFormState(data: FormData, payment?: PaymentMethod): void {
		if (payment !== undefined) {
			this.setPayment(payment);
		}
		super.updateFormState(data);
	}
	
	// Отрисовка данных в форме
	override render(data?: Partial<OrderData>): HTMLElement {
		if (data?.address !== undefined) {
			this.address.value = data.address;
		}
		if (data?.payment !== undefined) {
			this.setPayment(data.payment);
		}
		return super.render(data);
	}
}

