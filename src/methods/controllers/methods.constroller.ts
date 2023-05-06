import { inject, injectable } from 'inversify';
import { ILogger } from '../../logger/logger.interface';
import { TYPES } from '../../TYPES';
import { IMethodsController } from './methods.controller.interface';
import { BaseController } from '../../common/base.controller';
import { NextFunction, Request, Response } from 'express';
import { IService } from '../services/services.interfase';
import axios from 'axios';
import { get_countries_fo_id, get_currencies_for_id, usr_operation_for_id } from '../database/db';
import * as fs from 'fs';

@injectable()
export class MethodsController extends BaseController implements IMethodsController {
	constructor(
		@inject(TYPES.ILogger) private loggerServise: ILogger,
		@inject(TYPES.Services) private services: IService,
	) {
		super(loggerServise);
		this.bindRoutes([
			{
				method: 'post',
				path: '/login',
				func: this.Login,
			},
			{
				method: 'get',
				path: '/currencies',
				func: this.Currencies,
			},
			{
				method: 'get',
				path: '/countries',
				func: this.Countries,
			},
			{
				method: 'post',
				path: '/pay',
				func: this.Pay,
			},
			{
				method: 'post',
				path: '/transList',
				func: this.TransList,
			},
			{
				method: 'post',
				path: '/statChange',
				func: this.ConfirmPayStatus,
			},
			{
				method: 'post',
				path: '/statGet',
				func: this.get_Status,
			},
		]);
	}

	async Login(req: Request, res: Response, next: NextFunction): Promise<void> {
		res.json(await this.services.Login(req));
	}

	async Currencies(req: Request, res: Response, next: NextFunction): Promise<void> {
		const dir = 'currencies';
		const checkToken = await this.services
			.JWTverify(req.headers.access_token as string)
			.then(async (result: any) => {
				if (result.success) {
					res.json(await this.services.Currencies());
				} else {
					res.status(401).json(result);
				}
			});
	}

	async Countries(req: Request, res: Response, next: NextFunction): Promise<void> {
		// this.services.Countries();
		const checkToken = await this.services
			.JWTverify(req.headers.access_token as string)
			.then(async (result: any) => {
				if (result.success) {
					res.json(await this.services.Countries());
				} else {
					res.status(401).json(result);
				}
			});
		// res.json(await this.services.Countries());
	}

	// // Создание запроса на платеж
	async Pay(req: Request, res: Response, next: NextFunction): Promise<any> {
		const checkToken = await this.services
			.JWTverify(req.headers.access_token as string)
			.then(async (result: any) => {
				if (result.success) {
					const date_start: string = new Date().toISOString();
					const transation: any = await this.services.Pay(
						req.body,
						date_start,
						1,
						req.headers.access_token as string,
					);
					const country: any = await get_countries_fo_id(Number(req.body.Country_id));
					const currency: any = await get_currencies_for_id(Number(req.body.Currency_id));

					const data = {
						TelegramChatId: `${country[0].telegram_chat_id}`,
						Country: `${country[0].country_full_name}`,
						OperationsID: transation.transation,
						SumOfTransInCurrency: `${req.body.SumOfTransaction}`,
						CurrencyOfTrans: `${currency[0].currency_full_name}`,
						SumOfTether: `${req.body.SumOfTether}`,
						CurrencyEchangeRateToTether: `${req.body.CurrencyEchangeRateToTether}`,
						CardNumber: `${req.body.RecipientCardNumber}`,
					};
					console.log(data);
					const total = new Promise((resolve, reject) => {
						axios
							.post(String(process.env.BOT_URL), data, {
								headers: {
									'api-key': '13f4217gyDSA21tS',
									'Content-Type': 'application/json',
								},
							})
							.then((data) => {
								console.log(data.data);
								res.json(data.data);
							})
							.catch((error: Error) => {
								console.log(error);
								res.json(error.message);
							});
					});
				} else {
					res.status(401).json(result);
				}
			});
	}
	//Получение статуса из бота
	get_Status = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		if (req.body.Status == 'Ожидает подтверждения') {
			this.services.TransStatus(req.body.OperationsID, 2, req.body.ProviderID);
			res.json({ status: 'Ожидает подтверждения' });
		}
		if (req.body.Status == 'Отменен') {
			this.services.TransStatus(req.body.OperationsID, 4, req.body.ProviderID);
			res.json({ status: 'Отменен' });
		}
	};

	// Получение истории переводов
	async TransList(req: Request, res: Response, next: NextFunction): Promise<any> {
		const checkToken = await this.services
			.JWTverify(req.headers.access_token as string)
			.then(async (result: any) => {
				if (result.success) {
					res.json(await this.services.TransList(String(req.headers.access_token as string)));
				} else {
					res.status(401).json(result);
				}
			});
	}

	// Запрос на подтверждение перевода
	async ConfirmPayStatus(req: Request, res: Response, next: NextFunction): Promise<any> {
		const checkToken = await this.services
			.JWTverify(req.headers.access_token as string)
			.then(async (result: any) => {
				if (result.success) {
					const transation = await usr_operation_for_id(
						req.body.id,
						req.headers.access_token as string,
					);

					const data = {
						OperationsID: `${req.body.id}`,
						ProviderID: `${transation[0].providerid}`,
						SumOfTether: `${transation[0].sum_rub}`,
						CryptoWalletNumber: `${transation[0].card_number}`,
						Status: 'Выполнен',
					};

					const confTrans = this.services.TransStatus(req.body.id, 3);

					// console.log(data, transation);
					const total = await axios
						.post(String(process.env.FINFSH_BOT_URL), data)
						.then((result) => res.json({ success: result.data, status: confTrans }))
						.catch((error: Error) => res.json(error.message));
				} else {
					res.status(401).json(result);
				}
			});
	}
}
