import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
	// user: 'postgres',
	// password: '1234567890',
	// host: 'localhost',
	// port: 5432,
	// database: 'GENEX',

	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	database: process.env.DB_NAME,
});

export const autorisation = (body: any, date: any, token: any): any => {
	console.log(date);
	return new Promise((resolve, reject) => {
		pool.query(
			`SELECT * FROM users WHERE login = '${body.login}' AND password = '${body.password}';`,
			(err, result) => {
				if (err) {
					console.log(err);
					return reject(err);
				} else {
					console.log(result.rows.toString());
					if (result.rows.toString() == '') {
						return resolve({ success: false, message: 'Неверный логин или пароль' });
					} else {
						pool.query(
							`UPDATE users SET last_online_date = '${date}' WHERE login = '${body.login}' AND password = '${body.password}';
							UPDATE users SET token = '${token}' WHERE login = '${body.login}' AND password = '${body.password}' `,
							(err, result) => {
								if (err) {
									console.log(err);
								} else {
									// console.log(`Yes Online ${date}`);
									return resolve({ token: token });
								}
							},
						);
					}
				}
			},
		);
	});
};
export const autorisation_1 = (token: any, date: any): any => {
	console.log(date);
	return new Promise((resolve, reject) => {
		pool.query(`SELECT * FROM users WHERE token = '${token}';`, (err, result) => {
			if (err) {
				console.log(err);
				return reject(err);
			} else {
				// console.log(result.rows.toString());
				if (result.rows.toString() == '') {
					return resolve({ success: false, message: 'Неверный токен' });
				} else {
					pool.query(
						`UPDATE users SET last_online_date = '${date}' WHERE token = '${token}';`,
						(err, result) => {
							if (err) {
								console.log(err);
							} else {
								// console.log(`Yes Online ${date}`);
								return resolve({ success: true });
							}
						},
					);
				}
			}
		});
	});
};
// INSERT INTO currencies (currency_full_name, name_eng, short_name, short_name_eng, icon, exchange) VALUES ('Доллар', 'Dollar','Долл','Doll','mkmkmkmkmk','79.5');
// INSERT INTO status (status_id, status_name) VALUES (1, 'В обработке');
//INSERT INTO status (status_id, status_name) VALUES (2,'Ожидает подтверждения');
//INSERT INTO status (status_id, status_name) VALUES (3,'Выполнен');
// INSERT INTO status (status_id, status_name) VALUES (4,'Отменён');
export const get_currencies = (): object => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM currencies;', (err, result) => {
			if (err) {
				return reject(err);
			} else {
				console.log(result.rows, 'yes');
				return resolve(result.rows);
			}
		});
	});
};

export const get_currencies_for_id = (id: number): object => {
	return new Promise((resolve, reject) => {
		pool.query(`SELECT * FROM currencies WHERE currency_id = ${id};`, (err, result) => {
			if (err) {
				return reject(err);
			} else {
				console.log(result.rows, 'yes');
				return resolve(result.rows);
			}
		});
	});
};

export const get_countries = (): object => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM countries;', (err, result) => {
			if (err) {
				reject(err);
			} else {
				// console.log(result.rows);
				return resolve(result.rows);
			}
		});
	});
};

export const get_countries_fo_id = (id: number): object => {
	return new Promise((resolve, reject) => {
		pool.query(`SELECT * FROM countries WHERE country_id = ${id};`, (err, result) => {
			if (err) {
				reject(err);
			} else {
				// console.log(result.rows);
				return resolve(result.rows);
			}
		});
	});
};

export const uId = (token: string): Promise<any> => {
	const sql = `SELECT user_id FROM users WHERE token = '${token}'`;
	return new Promise((resolve, reject) => {
		pool.query(sql, (err, res) => {
			if (err) {
				console.log(err);
			} else {
				console.log(res);
				return resolve(res.rows[0]);
			}
		});
	});
};

export const updProv = (id: number, providerid: string | undefined): Promise<any> => {
	const sql = `UPDATE transations SET providerid = '${providerid}' WHERE transation_id = '${id}'`;
	return new Promise((resolve, reject) => {
		pool.query(sql, (err, result) => {
			if (err) {
				return reject(err);
			} else {
				// console.log(result.rows[0]);
				return resolve({ success: true });
			}
		});
	});
};

export const operationSave = async (
	body: any,
	date_start: any,
	status_id: number,
): Promise<any> => {
	const id = await uId(body.token);

	const sql = `INSERT INTO transations (user_id, country_id, currency_id, card_number, sum_rub, sum_currency, exchange_rate, date_start, status_id) VALUES ('${id.user_id}', '${body.Country_id}', '${body.Currency_id}',  '${body.RecipientCardNumber}',  '${body.SumOfTransaction}', '${body.SumOfTransInCurrency}',  '${body.CurrencyEchangeRateToTether}', '${date_start}', ${status_id}) RETURNING transation_id;`;
	console.log(sql);
	return new Promise((resolve, reject) => {
		pool.query(sql, (err, result) => {
			if (err) {
				return reject(err);
			} else {
				console.log(result.rows);
				return resolve({ transation: result.rows[0].transation_id, success: true });
			}
		});
	});
};

const getTransStatus = (id: number): Promise<string> => {
	const sql = `SELECT status_name FROM status WHERE status_id = '${id}'`;
	return new Promise((resolve, reject) => {
		pool.query(sql, (err, result) => {
			if (err) {
				return reject(err);
			} else {
				return resolve(result.rows[0].status_name);
			}
		});
	});
};

export const operationList = async (token: string): Promise<any> => {
	const id = await uId(token);
	const sql = `SELECT transation_id, user_id, card_number, sum_rub, sum_currency, exchange_rate, date_start, status_id FROM transations WHERE user_id = '${id.user_id}'`;
	console.log(sql);
	return new Promise((resolve, reject) => {
		pool.query(sql, async (err, result) => {
			if (err) {
				return reject(err);
			} else {
				const Status = await getTransStatus(result.rows[0].status_id);
				result.rows[0].status_id = Status;
				return resolve(result.rows);
			}
		});
	});
};

export const usr_operation_for_id = async (id: number, token: string): Promise<any> => {
	const Uid = await uId(token);
	const sql = `SELECT transation_id, user_id, card_number, sum_rub, sum_currency, exchange_rate, date_start, status_id, providerid FROM transations WHERE user_id = '${Uid.user_id}' AND transation_id = ${id}`;
	console.log(sql);
	return new Promise((resolve, reject) => {
		pool.query(sql, async (err, result) => {
			if (err) {
				return reject(err);
			} else {
				const Status = await getTransStatus(result.rows[0].status_id);
				delete result.rows[0].status_id;
				result.rows[0].status = Status;
				return resolve(result.rows);
			}
		});
	});
};

export const transConfirm = async (id: number, token: string, status_id: number): Promise<any> => {
	const uid = await uId(token);
	console.log(uid);
	const sql = `UPDATE transations SET status_id = '${status_id}' WHERE user_id = ${uid.user_id} AND transation_id = ${id}`;
	return new Promise((resolve, reject) => {
		pool.query(sql, (err, res) => {
			if (err) {
				return reject(err);
			} else {
				return resolve('success');
			}
		});
	});
};

export const transStatus = async (id: number, status_id: number): Promise<any> => {
	const sql = `UPDATE transations SET status_id = '${status_id}' WHERE transation_id = ${id}`;
	return new Promise((resolve, reject) => {
		pool.query(sql, (err, res) => {
			if (err) {
				return reject(err);
			} else {
				return resolve('success');
			}
		});
	});
};
