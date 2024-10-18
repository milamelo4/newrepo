const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel = require("../models/inventory-model")

/* ******************************
* Classification name validation rules
* ***************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Classification name is required.")
      .bail() // stop on first error
      .isLength({ min: 3 })
      .withMessage("Classification name must be at least 3 characters.")
      .bail()
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage(
        "Classification name is required and must be without spaces or special characters."
      )
      .custom(async (classification_name) => {
        // Check if the classification already exists
        const existingClassification = await invModel.findClassificationByName(
          classification_name
        );
        if (existingClassification) {
          throw new Error(
            "Classification name already exists. Please enter a unique name."
          );
        }
      }),
  ];
};

validate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

/* ******************************
* Inventory name validation rules
* ***************************** */
validate.vehicleRules = () => {
  return [
    // Classification (required dropdown selection)
    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a classification."),

    // vehicle name is required
    body("inv_make")
      .trim()
      .isLength({ min: 2 })
      .matches(/^[a-zA-Z0-9\s]{2,}$/)
      .withMessage(
        "Vehicle name is required and must be at least 2 characters long without special characters."
      ),

    //vehicle model is required
    body("inv_model")
      .trim()
      .isLength({ min: 2 })
      .matches(/^[a-zA-Z0-9\s]{2,}$/)
      .withMessage(
        "Vehicle model is required and must be at least 2 characters long without special characters."
      ),

    // vehicle year is required
    body("inv_year")
      .trim()
      .matches(/^\d{4}$/)
      .withMessage(
        "Vehicle year is required and must be a 4-digit number, e.g., 2024."
      ),

    //vehicle description is required
    body("inv_description")
      .trim()
      .isLength({ min: 20 })
      .escape()
      .withMessage(
        "Vehicle description is required and must be at least 20 characters long."
      ),
    // .customSanitizer((value) => value.trim())
    // .customSanitizer((value) => value.replace(/[^\x20-\x7E\n\r]/g, "")), // removes control characters but keeps new lines

    //vehicle image is required
    body("inv_image")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Image path must be at least 3 characters long."),

    // vehicle thumbnail is required
    body("inv_thumbnail")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Image path must be at least 3 characters long."),

    //vehicle price is required
    body("inv_price")
      .trim()
      .isInt({ min: 1, max: 1000000000 })
      .withMessage("Vehicle price is required and must be a positive number."),

    // vehicle miles is required
    body("inv_miles")
      .trim()
      .isInt({ min: 1, max: 1000000000 })
      .withMessage("Vehicle miles is required and must be a positive number."),

    // vehicle color is required
    body("inv_color")
      .trim()
      .isLength({ min: 3 })
      .withMessage(
        "Vehicle color is required and must be at least 3 characters long."
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
    classification_id,
  } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(
      classification_id
    ); // Pass classification_id to make dropdown sticky

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
      classification_id,
    });
    return;
  }
  next();
};

/* ******************************
* Inventory name validation rules
* ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_price,
    inv_miles,
    inv_color,
    inv_year,
    inv_thumbnail,
    classification_id,
  } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(
      classification_id
    ); // Pass classification_id to make dropdown sticky

    res.render("inventory/edit-inventory", {
      errors: errors.array(),
      title: "Edit Inventory",
      nav,
      inv_id,
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
      classification_id,
    });
    return;
  }
  next();
};
module.exports = validate