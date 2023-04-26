export interface IService {
	Login: (body: any) => any;
	Login_1: (body: any) => any;
	Currencies: () => object;
	Countries: () => object;
	Pay: (body: any, date_start: string, status_id: number) => any;
	TransList: (token: string) => object;
	TransConfirm: (id: number, token: string, status_id: number) => void;
	TransStatus: (id: number, status_id: number, providerid: string) => void;
}
