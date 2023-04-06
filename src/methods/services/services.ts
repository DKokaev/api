import { injectable } from 'inversify';
import { IService } from '../services/services.interfase';
import {
	autorisation,
	checkPayStatys,
	get_countries,
	get_currencies,
	get_users,
	operationList,
	operationSave,
	transConfirm,
} from '../database/db';

@injectable()
export class Services implements IService {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	constructor() {}

	async Main(): Promise<object> {
		// console.log(await get_users());
		return await get_users();
	}

	async Login(body: any): Promise<any> {
		// console.log(await autorisation(body));
		const date = new Date().toISOString();
		console.log(date, typeof date);
		return await autorisation(body, date);
	}

	async Currencies(): Promise<object> {
		console.log(await get_currencies());
		return await get_currencies();
	}
	async Countries(): Promise<object> {
		console.log(await get_countries());
		return await get_countries();
	}

	// // Создание запроса на перевод
	async Pay(body: any, date_start: string): Promise<any> {
		console.log(body, date_start);
		return await operationSave(body, date_start);
	}

	// Получение истории переводов
	async TransList(id: number): Promise<any> {
		console.log(typeof id);
		return await operationList(id);
	}
	// Проверка статуса платежа
	async CheckPayStatys(id: number, uId: number): Promise<any> {
		return await checkPayStatys(id, uId);
	}

	//Подтверждение перевода
	async TransConfirm(id: number, uId: number): Promise<string> {
		console.log(id, uId);
		return await transConfirm(id, uId);
	}
}
