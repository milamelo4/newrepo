const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const invModel = require("../models/inventory-model");
const reviewModel = require("../models/review-model");

/* ******************************
* Review text validation rules
* ***************************** */
validate.reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 5, max: 500 })
      .withMessage(
        "Review text is required and must be between 5 and 500 characters."
      ),
  ];
};

validate.checkReviewData = async (req, res, next) => {
  const { review_text, inv_id } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let data = await invModel.getInventoryByInvId(inv_id);
    const vehicle = data[0];
    const grid = await utilities.buildSingleClassification(data);
    const reviews = await reviewModel.getReviewsByInventoryId(inv_id);

    res.render("inventory/vehicle", {
      errors,
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} vehicle`,
      grid,
      nav,
      vehicle,
      inv_id,
      review_text,
      reviews,
      loggedIn: req.session.loggedin,
      accountData: res.locals.accountData,
    });
    return;
  }
  next();
};


module.exports = validate