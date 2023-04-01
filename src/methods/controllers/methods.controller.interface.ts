import { NextFunction, Request, Response } from 'express';

export interface IMethodsController {
	Main: (req: Request, res: Response, next: NextFunction) => void;
}
