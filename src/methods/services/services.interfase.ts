export interface IService {
	Main: () => object;
	Login: (body: any) => any;
	Currencies: () => object;
	Countries: () => object;
	Pay: (body: any, date_start: string) => any;
	TransList: (id: number) => object;
	CheckPayStatys: (id: number, uId: number) => void;
	TransConfirm: (id: number, uId: number) => void;
}
