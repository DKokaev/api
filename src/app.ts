import express, { Express } from 'express';
import { Server } from 'http';
import { injectable, inject } from 'inversify';
import { TYPES } from './TYPES';
import { ILogger } from './logger/logger.interface';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import 'reflect-metadata';
import { MethodsController } from './methods/controllers/methods.constroller';
import bodyParser from 'body-parser';
import { IExeptionFilter } from './errors/exeption.filter.interface';

@injectable()
export class App {
	server: Server;
	app: Express;
	port: number;
	host: String;

	constructor(
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.MethodsController) private methodsController: MethodsController,
		@inject(TYPES.ExeptionFilter) private exeptionFilter: IExeptionFilter,
	) {
		this.app = express();
		this.app.use(fileUpload());
		this.app.use(express.static(String(process.env.FILES_DIRECTORY)));
		this.port = Number(process.env.APP_PORT);
		this.host = 'localhost';
		this.app.use(express.json());
		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.use(
			cors({
				origin: '*',
				methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
			}),
		);
	}

	Users(): void {
		this.app.use('/', this.methodsController.router);
	}
	useExeptionFilters(): void {
		this.app.use(this.exeptionFilter.catch.bind(this.exeptionFilter));
	}

	public async init(): Promise<void> {
		this.Users();
		this.useExeptionFilters();
		this.server = this.app.listen(this.port);
		console.log(`Server is running on ${this.host}:${this.port}`);
	}
}
