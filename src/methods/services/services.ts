import { injectable } from 'inversify';
import { IService } from '../services/services.interfase';
import {
	autorisation,
	autorisation_1,
	get_countries,
	get_currencies,
	operationList,
	operationSave,
	transStatus,
	updProv,
} from '../database/db';
import { hash } from 'bcryptjs';

@injectable()
export class Services implements IService {
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
	async Currencies(): Promise<any> {
		return await get_currencies();
	}
	async Countries(): Promise<any> {
		console.log(await get_countries());
		return await get_countries();
	}

	// // Создание запроса на перевод
	async Pay(body: any, date_start: string, status_id: number): Promise<any> {
		return await operationSave(body, date_start, status_id);
	}

	// Получение истории переводов
	async TransList(token: string): Promise<any> {
		return await operationList(token);
	}

	//Подтверждение перевода
	async TransStatus(id: number, status_id: number, providerid?: string | undefined): Promise<any> {
		const provider = await updProv(id, providerid);
		return await transStatus(id, status_id);
	}
}
