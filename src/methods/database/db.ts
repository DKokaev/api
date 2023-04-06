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

export const get_users = (): object => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM users;', (err, result) => {
			if (err) {
				reject(err);
			} else {
				// console.log(result.rows);
				resolve(result.rows);
			}
		});
	});
};

export const autorisation = (body: any, date: any): any => {
	console.log(date);
	return new Promise((resolve, reject) => {
		pool.query(
			`SELECT * FROM users WHERE login = '${body.login}' AND password = '${body.password}';`,
			(err, result) => {
				if (err) {
					console.log(err);
					return reject(err);
				} else {
					// console.log(result.rows.toString());
					if (result.rows.toString() == '') {
						return resolve({ success: false });
					} else {
						pool.query(
							`UPDATE users SET last_online_date = '${date}' WHERE login = '${body.login}' AND password = '${body.password}'; `,
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
			},
		);
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

export const operationSave = (body: any, date_start: any): Promise<any> => {
	// return new Promise((resolve, reject) => {
	const sql = `INSERT INTO transations (user_id, country_id, currency_id, card_number, sum_rub, sum_currency, exchange_rate, date_start, status_id) VALUES ('${body.UsersId}', '${body.Country_id}', '${body.Currency_id}',  '${body.RecipientCardNumber}',  '${body.SumOfTransaction}', '${body.SumOfTransInCurrency}',  '${body.CurrencyEchangeRateToTether}', '${date_start}',1);`;
	console.log(sql);
	return new Promise((resolve, reject) => {
		pool.query(sql, (err, result) => {
			if (err) {
				return reject(err);
			} else {
				console.log(result);
				return resolve({ succes: true });
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
				console.log(result.rows[0]);
				return resolve(result.rows[0].status_name);
			}
		});
	});
};

export const operationList = (id: number): Promise<any> => {
	const sql = `SELECT transation_id, user_id, card_number, sum_rub, sum_currency, exchange_rate, date_start, status_id FROM transations WHERE user_id = '${id}'`;
	console.log(sql);
	return new Promise((resolve, reject) => {
		pool.query(sql, async (err, result) => {
			if (err) {
				return reject(err);
			} else {
				const Status = await getTransStatus(result.rows[0].status_id);
				result.rows[0].status_id = Status;
				// console.log(result.rows[0]);
				return resolve(result.rows);
			}
		});
	});
};

export const checkPayStatys = (id: number, uId: number): Promise<any> => {
	const sql = `SELECT status_id FROM transations WHERE transation_id = '${id}' AND user_Id = ${uId}`;
	return new Promise((resolve, reject) => {
		pool.query(sql, async (err, result) => {
			if (err) {
				return reject(err);
			} else {
				const Status = await getTransStatus(result.rows[0].status_id);
				return resolve(Status);
			}
		});
	});
};

export const transConfirm = (id: number, uId: number): Promise<string> => {
	const sql = `UPDATE transations SET status_id = '3' WHERE status_id = '1' AND user_id = ${uId} AND transation_id = ${id}`;
	return new Promise((resolve, reject) => {
		pool.query(sql, (err, res) => {
			if (err) {
				return reject(err);
			} else {
				return resolve('succes');
			}
		});
	});
};
