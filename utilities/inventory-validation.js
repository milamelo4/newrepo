const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
// const inventoryModel = require("../models/inventory-model")

/* ******************************
* Classification name validation rules
* ***************************** */
validate.classificationRules = () => {
  return [
    body("classificationName")
      .trim()
      .escape()
      .notEmpty()
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage(
        "Please provide a valid classification name without spaces or special characters."
      ),
  ];
}

validate.checkClassData = async (req, res, next) => {
  const { classificationName } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classificationName,
    })
    return
  }
  next()
}

validate.vehicleRules = () => {
  return [
    // vehicle name is required
    body("inv_make")
      .trim()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage(
        "Please provide a valid vehicle name without spaces or special characters."
      ),

    //vehicle model is required
    body("inv_model")
      .trim()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage(
        "Please provide a valid vehicle model without spaces or special characters."
      ),

    //vehicle description is required
    body("inv_description")
      .trim()
      .notEmpty()
      .isLength({ min: 20 })
      .withMessage(
        "Please provide a valid vehicle description without spaces or special characters."
      ),

    //vehicle image is required
    body("inv_image")
      .trim()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Please provide a valid vehicle image."),

    //vehicle price is required
    body("inv_price")
      .trim()
      .notEmpty()
      .isInt({ min: 1, max: 1000000000 })
      .withMessage(
        "Please provide a valid vehicle price without spaces or special characters."
      ),

    // vehicle miles is required
    body("inv_miles")
      .trim()
      .notEmpty()
      .isInt({ min: 1, max: 1000000000 })
      .withMessage(
        "Please provide a valid vehicle miles without spaces or special characters."
      ),

    // vehicle color is required
    body("inv_color")
      .trim()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage(
        "Please provide a valid vehicle color without spaces or special characters."
      ),

    // vehicle year is required
    body("inv_year")
      .trim()
      .notEmpty()
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage(
        "Please provide a valid vehicle year without spaces or special characters."
      ),

    // vehicle thumbnail is required
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage(
        "Please provide a valid vehicle thumbnail without spaces or special characters."
      ),
  ];
}
validate.checkVehicleData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_price,
    inv_miles,
    inv_color,
    inv_year,
    inv_thumbnail,
    classificationId,
  } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(
      classificationId
    ); // Pass classificationId to make dropdown sticky

    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_price,
      inv_miles,
      inv_color,
      inv_year,
      inv_thumbnail,
      classificationList,
      classificationId,
    });
    return;
  }
  next();
};

module.exports = validate