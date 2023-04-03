import { inject, injectable } from 'inversify';
import { ILogger } from '../../logger/logger.interface';
import { TYPES } from '../../TYPES';
import { IMethodsController } from './methods.controller.interface';
import { BaseController } from '../../common/base.controller';
import { NextFunction, Request, Response } from 'express';
import { IService } from '../services/services.interfase';
// import { transConfirm } from '../database/db';

@injectable()
export class MethodsController extends BaseController implements IMethodsController {
	constructor(
		@inject(TYPES.ILogger) private loggerServise: ILogger,
		@inject(TYPES.Services) private services: IService,
	) {
		super(loggerServise);
		this.bindRoutes([
			{
				method: 'get',
				path: '/main',
				func: this.Main,
			},
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
				path: '/transList:id?',
				func: this.TransList,
			},
			{
				method: 'post',
				path: '/status',
				func: this.CheckPayStatys,
			},
			{
				method: 'post',
				path: '/statChange',
				func: this.ConfirmPayStatus,
			},
		]);
	}
	async Main(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log('Run Main');
		this.services.Main();
	}

	async Login(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(req.body);
		res.json(await this.services.Login(req.body));
	}

	async Currencies(req: Request, res: Response, next: NextFunction): Promise<void> {
		// this.services.Currencies();
		res.json(await this.services.Currencies());
	}

	async Countries(req: Request, res: Response, next: NextFunction): Promise<void> {
		// this.services.Countries();
		res.json(await this.services.Countries());
	}

	// Создание запроса на платеж
	async Pay(req: Request, res: Response, next: NextFunction): Promise<any> {
		const data = {
			data: [
				{
					TelegramChatId: '981655201',
					Country: `${req.body.Country}`,
					OperationsID: 'AA001',
					SumOfTransInCurrency: '1000',
					CurrencyOfTrans: `${req.body.CurrencyOfTrans}`,
					SumOfTether: `${req.body.SumOfTether}`,
					CurrencyEchangeRateToTether: `${req.body.CurrencyEchangeRateToTether}`,
				},
			],
		};
		// const time = new Date().toLocaleDateString() + new Date().toLocaleTimeString();

		// console.log(time);
		res.send(await this.services.Pay(req.body));
	}

	// Получение истории переводов
	async TransList(req: Request, res: Response, next: NextFunction): Promise<any> {
		// console.log(req.query);
		const total = await this.services.TransList(Number(req.query.id));
		res.json(total);
	}

	// Запрос на проверку статуса платежа
	async CheckPayStatys(req: Request, res: Response, next: NextFunction): Promise<any> {
		res.send(await this.services.CheckPayStatys(req.body.id, req.body.UserId));
	}

	// Запрос на подтверждение перевода
	async ConfirmPayStatus(req: Request, res: Response, next: NextFunction): Promise<any> {
		const data = {
			data: [
				{
					OperationsID: 'AA001',
					ProviderID: '98159148',
					Status: 'Ожидает подтверждения',
				},
			],
		};
		res.send(await this.services.TransConfirm(req.body.id, req.body.UserId));
	}
}
