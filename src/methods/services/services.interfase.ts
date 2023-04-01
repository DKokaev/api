export interface IService {
	Main: () => object;
	Login: (body: any) => any;
	Currencies: () => object;
	Countries: () => object;
	Pay: (body: any) => any;
	TransList: (id: number) => object;
	CheckPayStatys: (id: number, uId: number) => void;
	TransConfirm: (id: number, uId: number) => void;
}
