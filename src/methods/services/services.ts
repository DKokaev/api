import { injectable } from 'inversify';
import { IService } from '../services/services.interfase';
import {
	autorisation,
	autorisation_1,
	get_countries,
	get_currencies,
	get_users,
	operationList,
	operationSave,
	transConfirm,
} from '../database/db';
import { hash } from 'bcryptjs';

@injectable()
export class Services implements IService {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	constructor() {}

	async Main(): Promise<object> {
		// console.log(await get_users());
		return await get_users();
	}

	async Login(body: any): Promise<any> {
		const salt = process.env.SATL;
		const token = await hash(body.password, Number(salt));
		const date = new Date().toISOString();
		console.log(date, typeof date, 'token  ' + token);
		return await autorisation(body, date, token);
	}
	async Login_1(body: any): Promise<any> {
		const date = new Date().toISOString();
		return await autorisation_1(body.token, date);
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
	async Pay(body: any, date_start: string, status_id: number): Promise<any> {
		// console.log(body, date_start);
		return await operationSave(body, date_start, status_id);
	}

	// Получение истории переводов
	async TransList(token: string): Promise<any> {
		// console.log(typeof token);
		return await operationList(token);
	}

	//Подтверждение перевода
	async TransConfirm(id: number, token: string, status_id: number): Promise<string> {
		// console.log(id, token);
		return await transConfirm(id, token, status_id);
	}
}
