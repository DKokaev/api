export interface IService {
	Login: (body: any) => any;
	Currencies: () => any;
	Countries: () => object;
	Pay: (body: any, date_start: string, status_id: number, token: string) => any;
	TransList: (token: string) => object;
	TransStatus: (id: number, status_id: number, providerid?: string | undefined) => void;
	JWTverify: (token: string) => any;
}
