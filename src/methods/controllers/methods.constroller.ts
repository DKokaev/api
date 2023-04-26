import { inject, injectable } from 'inversify';
import { ILogger } from '../../logger/logger.interface';
import { TYPES } from '../../TYPES';
import { IMethodsController } from './methods.controller.interface';
import { BaseController } from '../../common/base.controller';
import { NextFunction, Request, Response } from 'express';
import { IService } from '../services/services.interfase';
import axios from 'axios';
import { get_countries_fo_id, get_currencies_for_id, usr_operation_for_id } from '../database/db';

const dir = 'files/';

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
				method: 'get',
				path: '/transList:token?',
				func: this.TransList,
			},
			{
				method: 'post',
				path: '/statChange',
				func: this.ConfirmPayStatus,
			},
			{
				method: 'get',
				path: '/statGet',
				func: this.get_Status,
			},
		]);
	}

	async Login(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(req.body);
		if (req.body.token) {
			console.log('jjjjjjjjjjjjjjjj');
			res.json(await this.services.Login_1(req.body));
		} else {
			res.json(await this.services.Login(req.body));
		}
	}

	async Currencies(req: Request, res: Response, next: NextFunction): Promise<void> {
		// this.services.Currencies();
		res.json(await this.services.Currencies());
	}

	async Countries(req: Request, res: Response, next: NextFunction): Promise<void> {
		// this.services.Countries();
		res.json(await this.services.Countries());
	}

	// // Создание запроса на платеж
	async Pay(req: Request, res: Response, next: NextFunction): Promise<any> {
		const date_start: string = new Date().toISOString();
		const transation: any = await this.services.Pay(req.body, date_start, 1);
		const country: any = await get_countries_fo_id(Number(req.body.Country_id));
		const currency: any = await get_currencies_for_id(Number(req.body.Currency_id));
		// 		Пример API запроса в бот:
		const data = {
			TelegramChatId: `${country[0].telegram_chat_id}`,
			Country: `${country[0].country_full_name}`,
			OperationsID: transation.transation,
			SumOfTransInCurrency: `${req.body.SumOfTransaction}`,
			CurrencyOfTrans: `${currency[0].currency_full_name}`,
			SumOfTether: `${req.body.SumOfTether}`,
			CurrencyEchangeRateToTether: `${req.body.CurrencyEchangeRateToTether}`,
			Card_Number: `${req.body.RecipientCardNumber}`,
		};

		// const data = {
		// 	TelegramChatId: '-1001951668017',
		// 	Country: '????Турция',
		// 	OperationsID: 'AA004',
		// 	SumOfTransInCurrency: '100',
		// 	CurrencyOfTrans: 'TL',
		// 	SumOfTether: '5',
		// 	CurrencyEchangeRateToTether: '19,12',
		// 	CardNumber: '1234134097512451',
		// };
		const total = await axios
			.post(String(process.env.BOT_URL), data, {
				headers: {
					'api-key': '13f4217gyDSA21tS',
					'Content-Type': 'application/json',
				},
			})
			.then((res) => console.log(res));
		console.log(transation, data, country, currency);
	}
	//Получение статуса из бота
	get_Status = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		// 		Пример API запроса из Бота:
		// {
		// "data": [{
		// "OperationsID": "AA001",
		// "ProviderID": "98159148",
		// "Status": "Ожидает подтверждения"
		// }]
		// }
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
		const total = await this.services.TransList(String(req.query.token));
		res.json(total);
	}

	// Запрос на подтверждение перевода
	async ConfirmPayStatus(req: Request, res: Response, next: NextFunction): Promise<any> {
		const transation = await usr_operation_for_id(req.body.id, req.body.token);
		// 		Пример API запрос в Бот:
		const data = {
			OperationsID: `${req.body.id}`,
			ProviderID: `${transation.providerid}`,
			SumOfTether: `${transation[0].sum_rub}`,
			CryptoWalletNumber: `${transation[0].card_number}`,
			Status: 'Выполнен',
		};
		console.log(data, transation);
		const total = await axios
			.post(String(process.env.FINISH_BOT_URL), data)
			.then(async () => res.json(await this.services.TransConfirm(req.body.id, req.body.token, 3)));
		// res.json(await this.services.TransConfirm(req.body.id, req.body.token, 3));
	}
}
