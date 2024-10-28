// Requirements Statements
const express = require("express");
const router = new express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/review-validation");


router.post(
  "/add",
  regValidate.reviewRules(),
  regValidate.checkReviewData,
  utilities.handleErrors(reviewController.addReview)
);

// Route to build edit review
router.get(
  "/edit/:review_id",
  utilities.handleErrors(reviewController.editReviewView)
);

router.post(
  "/update",
  regValidate.reviewRules(),
  regValidate.checkReviewData,
  utilities.handleErrors(reviewController.updateReview)
);

// Route to build the delete vehicle view
router.get("/delete/:review_id", utilities.handleErrors(reviewController.deleteReviewView));

router.post(
  "/delete",
  utilities.handleErrors(reviewController.deleteReview)
);

module.exports = router;
