import { Pool } from 'pg';

const pool = new Pool({
	user: 'postgres',
	password: '1234567890',
	host: 'localhost',
	port: 5432,
	database: 'GENEX',
});

export const get_users = (): object => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM Users;', (err, result) => {
			if (err) {
				reject(err);
			} else {
				// console.log(result.rows);
				resolve(result.rows);
			}
		});
	});
};

export const autorisation = (body: any): any => {
	// console.log(body.login);
	return new Promise((resolve, reject) => {
		pool.query(
			`SELECT * FROM Users WHERE login = '${body.login}' AND password = '${body.password}';`,
			(err, result) => {
				if (err) {
					console.log(err);
					return reject(err);
				} else {
					// console.log(result.rows.toString());
					if (result.rows.toString() == '') {
						return resolve({ success: false });
					} else return resolve({ success: true });
				}
			},
		);
	});
};

export const get_currencies = (): object => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM Currencies;', (err, result) => {
			if (err) {
				return reject(err);
			} else {
				// console.log(result.rows);
				return resolve(result.rows);
			}
		});
	});
};

export const get_countries = (): object => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM Countries;', (err, result) => {
			if (err) {
				reject(err);
			} else {
				// console.log(result.rows);
				return resolve(result.rows);
			}
		});
	});
};

export const operationSave = (body: any): Promise<any> => {
	// return new Promise((resolve, reject) => {
	const sql = `INSERT INTO Operations (UsersId, RecipientCardNumber, CountryOfRecipient, CurrencyOfRecipient, OperationStatusId, TransDate, TransSumm) VALUES ( '${body.UsersId}', '${body.RecipientCardNumber}', '${body.Country}', '${body.CurrencyOfTrans}', '1', '${body.DateTime}', '${body.SumOfTransaction}');`;
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
	const sql = `SELECT statusName FROM OperationsStatus WHERE id = '${id}'`;
	return new Promise((resolve, reject) => {
		pool.query(sql, (err, result) => {
			if (err) {
				return reject(err);
			} else {
				// console.log(result.rows[0]);
				return resolve(result.rows[0].statusname);
			}
		});
	});
};

export const operationList = (id: number): Promise<object> => {
	const sql = `SELECT id, RecipientCardNumber, CountryOfRecipient, CurrencyOfRecipient, OperationStatusId, TransDate,  TransSumm FROM Operations WHERE UsersId = '${id}'`;
	return new Promise((resolve, reject) => {
		pool.query(sql, async (err, result) => {
			if (err) {
				return reject(err);
			} else {
				const Status = await getTransStatus(result.rows[0].operationstatusid);
				result.rows[0].operationstatusid = Status;
				// console.log(result.rows[0]);
				return resolve(result.rows);
			}
		});
	});
};

export const checkPayStatys = (id: number, uId: number): Promise<any> => {
	const sql = `SELECT OperationStatusId FROM Operations WHERE id = ${id} AND UsersId = ${uId}`;
	return new Promise((resolve, reject) => {
		pool.query(sql, async (err, result) => {
			if (err) {
				return reject(err);
			} else {
				const Status = await getTransStatus(result.rows[0].operationstatusid);
				return resolve(Status);
			}
		});
	});
};

export const transConfirm = (id: number, uId: number): Promise<string> => {
	const sql = `UPDATE Operations SET operationstatusid = '3' WHERE operationstatusid = '1' AND UsersId = ${uId} AND id = ${id}`;
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
