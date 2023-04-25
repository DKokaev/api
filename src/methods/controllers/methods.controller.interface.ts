import { NextFunction, Request, Response } from 'express';

export interface IMethodsController {
	Login: (req: Request, res: Response, next: NextFunction) => void;
}
