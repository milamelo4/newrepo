const pool = require("../database")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
*   Update account by ID 
* *************************** */
async function getAccountById(account_id) {
    const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1";
    const result = await pool.query(sql, [account_id]);
    return result.rows[0]; // Return the first row (account information)
}

/* *****************************
*   Update account information 
* *************************** */
async function updateAccount(firstname, lastname, email, accountId) {
  const sql =
    "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4";
  const values = [firstname, lastname, email, accountId]; 
  try {
    const result = await pool.query(sql, values);
    return result.rowCount > 0; 
  } catch (error) {
    console.error("Error in update query:", error);
    throw error; 
  }
}

/* *****************************
*   Update account password 
* *************************** */
async function updatePassword(account_id, newPassword) {
  const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2";
  const result = await pool.query(sql, [newPassword, account_id]);
  return result.rowCount > 0; // Return true if the update was successful
}


module.exports = { 
  registerAccount, 
  checkExistingEmail, 
  getAccountByEmail,
  getAccountById, 
  updateAccount,
  updatePassword};