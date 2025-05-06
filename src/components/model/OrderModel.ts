// импортируем интерфейсы
import { IEvents, 
	IOrderModel, 
	OrderModelData, 
	OrderErrors, 
	OrderValidator 
} from "../../types";

/*
	класс для работы с данными, требующими валидации
*/
export class OrderModel implements IOrderModel {
// данные
	private order: OrderModelData = {
		payment: 'card',
		address: '',
		email: '',
		phone: '',
}
		
// способы валидации
private validator: OrderValidator = {
		payment: (payment) => true, // пользователь не может ввести некорректный способ оплаты
		address: (address) => !!address, // остальные поля проверяются только на заполненость
		email: (email) => !!email,
		phone: (phone) => !!phone,
}

// элементы сообщений об ошибках
private errors: OrderErrors = {
	payment: 'способ оплаты',
	address: 'адрес',
	email: 'почту',
	phone: 'телефон',
}

	constructor(private events: IEvents) {}
	// установка значения в поле данных
	setField<K extends keyof OrderModelData>(field: K, value: OrderModelData[K]) : void {
		this.order[field] = value;
		this.events.emit('order:changed', this.order);
	}

	// очистка данных
	clear() : void {
		this.order = {
			payment: 'card',
			address: '',
			email: '',
			phone: '',
		}
		this.events.emit('order:changed', this.order);
	}

	// получение поля данных по ключу
	getField<K extends keyof OrderModelData>(field: K) : OrderModelData[K] {
		return this.order[field];
	}

	// получение всех полей
	getData() : OrderModelData {
		return this.order;
	}

	// валидация 
	validate(): OrderErrors {
		const result: Partial<OrderErrors> = {};

		// Перебираем все поля в заказе
		for (const key in this.order) {
			const field = key as keyof OrderModelData;

			// Получаем значение и функцию-валидатор
			const value = this.order[field];
			const validator = this.validator[field] as (v: typeof value) => boolean;

			// Применяем валидатор
			if (!validator(value)) {
				result[field] = this.errors[field];
			}
		}
		console.log(result);
		return result as OrderErrors;
	}
}


