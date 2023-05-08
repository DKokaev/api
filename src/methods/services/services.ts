import { injectable } from 'inversify';
import { IService } from '../services/services.interfase';
import {
	checkUserForId,
	getUserIdForLoginPassword,
	get_countries,
	get_currencies,
	operationList,
	operationSave,
	transStatus,
	updProv,
	updateUsersDate,
} from '../database/db';
import { sign, verify } from 'jsonwebtoken';

@injectable()
export class Services implements IService {
	async Login(req: any): Promise<any> {
		const total = await getUserIdForLoginPassword(req.body).then(async (user: any) => {
			if (typeof user != 'string') {
				const data = this.generateAccessJWT(user[0].user_id);
				const date = new Date().toISOString();
				updateUsersDate(await data, user[0].user_id, date);
				// console.log('efefefefefefe', await data);
				return data;
			} else {
				return { error: user };
			}
		});
		return total;
	}

	generateAccessJWT = async (id: any): Promise<any> => {
		console.log(id);
		return new Promise((resolve, reject) => {
			const accessToken = sign(
				{ id: id, iat: Math.floor(Date.now() / 1000) },
				process.env.ACCESS_TOKEN_SECRET as string,
				{ expiresIn: '10m', algorithm: 'HS256' },
				(err, token) => {
					if (err) {
						return resolve({ error: `${err.message}`, success: false });
					} else {
						resolve({ token: token as string, success: true });
					}
				},
			);
		});
	};

	JWTverify = async (token: string): Promise<any> => {
		return new Promise((resolve, reject) => {
			verify(`${token}`, process.env.ACCESS_TOKEN_SECRET as string, async (err, payload) => {
				// console.log(payload);
				if (err) {
					// console.log('err.message', err.message);
					// reject(err.message);
					resolve({ error: err.message, success: false });
				} else if (payload) {
					// console.log('payload', payload);
					const date = new Date().toISOString();
					const success = await checkUserForId(`${token}`, date);
					resolve(success);
					// console.log(payload);
				}
			});
		});
	};

	async Currencies(): Promise<any> {
		return await get_currencies();
	}
	async Countries(): Promise<any> {
		console.log(await get_countries());
		return await get_countries();
	}

	// // Создание запроса на перевод
	async Pay(body: any, date_start: string, status_id: number, token: string): Promise<any> {
		return await operationSave(body, date_start, status_id, token);
	}

	// Получение истории переводов
	async TransList(token: string): Promise<any> {
		return await operationList(token);
	}

	//Подтверждение перевода
	async TransStatus(id: number, status_id: number, providerid?: string | undefined): Promise<any> {
		if (providerid != null) {
			const provider = await updProv(id, providerid);
			return await transStatus(id, status_id);
		} else {
			console.log(1);
			return await transStatus(id, status_id);
		}
	}
}
