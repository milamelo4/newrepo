// Requirements Statements
const reviewModel = require("../models/review-model");
const utilities = require("../utilities/index");
const reviewController = {};

/* ***************************
 *  Add Review
 * ************************** */
reviewController.addReview = async function (req, res, next) {
  const { review_text, inv_id, account_id, screen_name } = req.body;

  // Insert the new review into the database
  const reviewResult = await reviewModel.addReview(
    review_text,
    inv_id,
    account_id,
    screen_name
  );

  if (reviewResult) {
    req.flash("success", "Review added successfully.");
    res.redirect(`/inv/detail/${inv_id}`);
  } else {
    req.flash("notice", "Error adding review. Please try again.");
    res.redirect(`/inv/detail/${inv_id}`);
  }
};

/* ***************************
 *  Build edit review view
 * ************************** */
reviewController.editReviewView = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id);
  let nav = await utilities.getNav();
  
  // Fetch the review data by its ID
  const reviewData = await reviewModel.getReviewById(review_id);
  
  if (!reviewData) {
    req.flash("error", "Review not found");
    return res.redirect("/account");
  }

  // Extract review details
  const itemName = `${reviewData.inv_year} ${reviewData.inv_make} ${reviewData.inv_model}`; 

  res.render("./account/edit-review", {
    title: "Edit Review for: ",
    title2: itemName,
    nav,
    errors: null,
    review_id: reviewData.review_id,
    review_text: reviewData.review_text,
    review_date: reviewData.review_date,
    inv_make: reviewData.inv_make,
    inv_model: reviewData.inv_model,
    inv_id: reviewData.inv_id,
  });
};

/* ***************************
 *  Update Review
 * ************************** */
reviewController.updateReview = async function (req, res, next) {
  const { review_id, review_text } = req.body;

  try {
    const currReview = await reviewModel.getReviewById(review_id);
    if (currReview.review_text === review_text) {
      req.flash("notice", "No changes made. Review not updated.");
      return res.redirect("/account");
    }
    
    const updateResult = await reviewModel.updateReview(
    review_id,
    review_text
    );

    if (updateResult) {
      req.flash("success", "Review updated successfully.");
      return res.redirect("/account");
    } else {
      console.log("Update failed. Rendering form again.");
      const reviewData = { review_id, review_text };
      req.flash("notice", "Error updating review. Please try again.");

      let nav = await utilities.getNav();
      return res.render("account/edit-review", {
        title: "Edit Review",
        nav,
        errors: null,
        reviewData,
      });
    }
  } catch (error) {
    console.error("Error updating review:", error); // Log any error for debugging
    req.flash("notice", "Error updating review. Please try again.");
    return res.redirect("/account");
  }
 };

 // build delete review view
 reviewController.deleteReviewView = async function (req, res, next) {
   const review_id = parseInt(req.params.review_id);
   let nav = await utilities.getNav();
    const reviewData = await reviewModel.getReviewById(review_id);
    if (!reviewData) {
      req.flash("error", "Review not found");
      return res.redirect("/account");
    }
   const itemName = `${reviewData.inv_year} ${reviewData.inv_make} ${reviewData.inv_model}`; 
   res.render("./account/delete-confirm", {
     title: "Delete Review for:",
     title2: itemName,
     nav,
     errors: null,
     review_id: reviewData.review_id,
     review_text: reviewData.review_text,
     review_date: reviewData.review_date,
     inv_make: reviewData.inv_make,
     inv_model: reviewData.inv_model,
     inv_id: reviewData.inv_id,
   });  
 }
 // delete review
 reviewController.deleteReview = async function (req, res, next) {
   const { review_id } = req.body;
   const result = await reviewModel.deleteReview(review_id);
   if (result) {
     req.flash("success", "Review deleted successfully.");
     res.redirect("/account");
   } else {
     req.flash("notice", "Error deleting review. Please try again.");
     res.redirect("/account");
   }
 };


module.exports = reviewController;