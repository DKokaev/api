import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app';
import { TYPES } from './TYPES';
import { ILogger } from './logger/logger.interface';
import { LoggerService } from './logger/logger.service';
import { IMethodsController } from './methods/controllers/methods.controller.interface';
import { MethodsController } from './methods/controllers/methods.constroller';
import { IService } from './methods/services/services.interfase';
import { Services } from './methods/services/services';
import { ExeptionFilter } from './errors/exeption.filter';
import { IExeptionFilter } from './errors/exeption.filter.interface';

export interface IBootstrapReturn {
	app: App;
	appContainer: Container;
}

export const appBinding = new ContainerModule((bind: interfaces.Bind) => {
	bind<App>(TYPES.Application).to(App);
	bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
	bind<MethodsController>(TYPES.MethodsController).to(MethodsController).inSingletonScope();
	bind<IMethodsController>(TYPES.IMethodsController).to(MethodsController).inSingletonScope();
	bind<Services>(TYPES.Services).to(Services).inSingletonScope();
	bind<IService>(TYPES.IService).to(Services).inSingletonScope();
	bind<IExeptionFilter>(TYPES.ExeptionFilter).to(ExeptionFilter).inSingletonScope();
});

function bootstrap(): IBootstrapReturn {
	const appContainer = new Container();
	appContainer.load(appBinding);
	const app = appContainer.get<App>(TYPES.Application);
	app.init();
	return { appContainer, app };
}
export const { app, appContainer } = bootstrap();
