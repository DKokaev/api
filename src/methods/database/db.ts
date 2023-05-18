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

export const getUserIdForLoginPassword = (body: any): any => {
	return new Promise((resolve, reject) => {
		pool.query(
			`SELECT * FROM users WHERE login = '${body.login}' AND password = '${body.password}';`,
			(err, result) => {
				if (err) {
					// console.log(err.message);
					return reject(err.message);
				} else {
					// console.log(result.rows);
					if (result.rows.length != 0) {
						return resolve(result.rows);
					} else {
						return resolve('Пользователь не найден');
					}
				}
			},
		);
	});
};

export const updateUsersDate = (data: any, id: number, date: string): any => {
	pool.query(
		`UPDATE users SET token = '${data.token}' WHERE user_id = '${id}';
		UPDATE users SET last_online_date = '${date}' WHERE user_id = '${id}'`,
		(err, result) => {
			if (err) {
				console.log(err);
			} else {
				return { success: 'true' };
			}
		},
	);
};

export const checkUserForId = (token: string, date: string): any => {
	console.log(token, date);
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM users WHERE token = '${token}';`;

		pool.query(sql, (err, result) => {
			if (err) {
				// console.log(err.message);
				reject(err.message);
			} else {
				const sql = `UPDATE users SET last_online_date = '${date}' WHERE token = '${token}';`;
				pool.query(sql, (err, res) => {
					if (err) {
						// console.log(err);
					} else {
						// console.log(`Yes Online ${date}`);
						return resolve({ success: true });
					}
				});
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
				// console.log(result.rows, 'yes');
				return resolve(result.rows);
			}
		});
	});
};

export const get_commission = (): any => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM commission;', (err, result) => {
			if (err) {
				return reject(err);
			} else {
				// console.log(result.rows, 'yes');
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
				// console.log(result.rows, 'yes');
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
				// console.log(err);
			} else {
				// console.log(res);
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
	token: string,
): Promise<any> => {
	const id = await uId(token);

	const sql = `INSERT INTO transations (user_id, country_id, currency_id, card_number, sum_rub, sum_currency, exchange_rate, date_start, status_id) VALUES ('${id.user_id}', '${body.Country_id}', '${body.Currency_id}',  '${body.RecipientCardNumber}',  '${body.SumOfTransaction}', '${body.SumOfTransInCurrency}',  '${body.CurrencyEchangeRateToTether}', '${date_start}', ${status_id}) RETURNING transation_id;`;
	// console.log(sql);
	return new Promise((resolve, reject) => {
		pool.query(sql, (err, result) => {
			if (err) {
				return reject(err);
			} else {
				// console.log(result.rows);
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
	const sql = `SELECT transation_id, user_id, card_number, sum_rub, currency_id, sum_currency, exchange_rate, date_start, status_id FROM transations WHERE user_id = '${id.user_id}'`;
	// console.log(sql);
	return new Promise((resolve, reject) => {
		pool.query(sql, async (err, result) => {
			if (err) {
				return reject(err);
			} else {
				console.log(result.rows);
				for (const i in result.rows) {
					// console.log(i);
					const Currency: any = await get_currencies_for_id(result.rows[i].currency_id);
					delete result.rows[i].currency_id;
					result.rows[i].currency = Currency[0].currency_simbol;
					const Status = await getTransStatus(result.rows[i].status_id);
					delete result.rows[i].status_id;
					result.rows[i].status = Status;
					// console.log(result.rows[i]);
				}
				return resolve(result.rows);
			}
		});
	});
};

export const usr_operation_for_id = async (id: number, token: string): Promise<any> => {
	if ((await getTransationForId(id)).length != 0) {
		console.log('kk');
		const Uid = await uId(token);
		const sql = `SELECT transation_id, user_id, card_number, sum_rub, sum_currency, exchange_rate, date_start, status_id, providerid FROM transations WHERE user_id = '${Uid.user_id}' AND transation_id = ${id}`;
		return new Promise((resolve, reject) => {
			pool.query(sql, async (err, result) => {
				if (err) {
					return resolve(err.message);
				} else {
					const Status = await getTransStatus(result.rows[0].status_id);
					delete result.rows[0].status_id;
					result.rows[0].status = Status;
					return resolve({ result: result.rows, success: true });
				}
			});
		});
	} else {
		return { error: 'Запись не найдена', success: false };
	}
};

export const transStatus = async (id: number, status_id: number): Promise<any> => {
	const sql = `UPDATE transations SET status_id = '${status_id}' WHERE transation_id = ${id};`;
	return new Promise((resolve, reject) => {
		pool.query(sql, async (err, res) => {
			if (err) {
				return resolve(err.message);
			} else {
				const status = await getTransStatus(status_id);
				return resolve({ success: true, status: status });
			}
		});
	});
};

const getTransationForId = async (id: number): Promise<any> => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM transations WHERE transation_id = '${id}';`;
		pool.query(sql, (err, result) => {
			if (err) {
				console.log(err.message);
				return reject(err);
			} else {
				return resolve(result.rows);
			}
		});
	});
};
