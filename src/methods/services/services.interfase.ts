export interface IService {
	Main: () => object;
	Login: (body: any) => any;
	Login_1: (body: any) => any;
	Currencies: () => object;
	Countries: () => object;
	Pay: (body: any, date_start: string, status_id: number) => any;
	TransList: (token: string) => object;
	CheckPayStatys: (id: number, token: string) => void;
	TransConfirm: (id: number, token: string, status_id: number) => void;
}
