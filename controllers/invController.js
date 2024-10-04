const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build Single inventory by classification
 * ************************** */
invCont.buildSingleClassification = async function (req, res, next) {
  const inv_id = req.params.inventoryId;
  const data = await invModel.getInventoryByInvId(inv_id);
  const classMake = data[0].inv_make
  const classModel = data[0].inv_model
  const classYear = data[0].inv_year
  const grid = await utilities.buildSingleClassification(data);
  let nav = await utilities.getNav();
  res.render("./inventory/vehicle", {
    title: `${classYear} ${classMake} ${classModel} vehicle`,
    nav,
    grid,
  });
};

/* ***************************
 *  Build error controller
 * ************************** */
invCont.buildError = async function (req, res, next) {
  const error = new Error("Intentional 500 error!");
  error.status = 500;
  next(error);
}

module.exports = invCont;