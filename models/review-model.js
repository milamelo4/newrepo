const pool = require("../database/"); 

/* ***************************
 *  Add Review
 * ************************** */
async function addReview(review_text, inv_id, account_id) {
  try {
    const sql = `
      INSERT INTO review (review_text, inv_id, account_id, review_date)
      VALUES ($1, $2, $3, NOW()) RETURNING *;
    `;
    const result = await pool.query(sql, [review_text, inv_id, account_id]);
    return result.rowCount > 0; // True if insertion was successful
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}
/* ***************************
 *  Get reviews by inventory ID
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `
      SELECT review_text, review_date, 
      account_firstname, account_lastname, 
      CONCAT(LEFT(account_firstname, 1), account_lastname) AS screen_name
      FROM review
      JOIN account ON review.account_id = account.account_id
      WHERE review.inv_id = $1
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows; // Returns an array of reviews with the dynamically generated screen_name
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
}

/* ***************************
 *  Get Reviews by Account ID
 * ************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `
      SELECT review_id, review_text, inv_make, inv_model, review_date
      FROM review
      JOIN inventory ON review.inv_id = inventory.inv_id
      WHERE review.account_id = $1
    `;
    const result = await pool.query(sql, [account_id]);
    return result.rows; // Make sure this returns rows
  } catch (error) {
    console.error("Error fetching reviews by account ID:", error);
    throw error;
  }
}


/* ***************************
 *  Get all Reviews for Admin
 * ************************** */
async function getAllReviews() {
   try {
     const sql = `
      SELECT r.review_id, r.review_text, r.review_date, a.account_firstname, a.account_lastname, i.inv_make, i.inv_model
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      JOIN inventory i ON r.inv_id = i.inv_id
      ORDER BY r.review_date DESC;
    `;
     const result = await pool.query(sql);
     return result.rows;
   } catch (error) {
     console.error("Error fetching all reviews:", error);
     throw error;
   }
 }

// Get review by ID
async function getReviewById(review_id) {
  const sql = `
    SELECT r.review_id, r.review_text, r.review_date, i.inv_year ,i.inv_make, i.inv_model, r.inv_id
    FROM review r
    JOIN inventory i ON r.inv_id = i.inv_id
    WHERE r.review_id = $1
  `;
  const result = await pool.query(sql, [review_id]);
  return result.rows[0];
}

// Update review
async function updateReview(review_id, review_text) {
  const sql = `
    UPDATE review
    SET review_text = $1
    WHERE review_id = $2
    RETURNING *;
  `;
  const result = await pool.query(sql, [review_text, review_id]);
  return result.rowCount > 0;
}

// Delete review
async function deleteReview(review_id) {
  const sql = `DELETE FROM review WHERE review_id = $1 RETURNING *;`;
  const result = await pool.query(sql, [review_id]);
  return result.rowCount > 0;
}

module.exports = {
  addReview,
  getReviewsByInventoryId,
  getReviewsByAccountId,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview
};
