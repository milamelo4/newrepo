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
    errors: null,
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
    errors: null,
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


/* ***************************
 *  Build Management inventory view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  res.render("./inventory/management", {
    title: "Management",
    nav,
    classificationList,
    error: null,
  });
};

/* ***************************
 *  Build Add Classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
}

invCont.addClassification = async function (req, res, next) {
  const { classificationName } = req.body;

  try {
    const insertResult = await invModel.newClassification(classificationName);
    if (insertResult) {
      const newClassificationId = insertResult.id;

      // Return JSON if it's an AJAX request
      if (req.xhr || req.headers.accept.includes("json")) {
        return res.json({
          success: true,
          message: `Added new classification: ${classificationName}`,
          newClassificationId,
          newClassificationName: classificationName,
        });
      } else {
        req.flash("notice", `Added new classification: ${classificationName}`);
        return res.redirect("/inv");
      }
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Error adding classification." });
    }
  } catch (error) {
    console.error("Error adding classification:", error);
    if (req.xhr || req.headers.accept.includes("json")) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Unexpected error occurred while adding classification.",
        });
    } else {
      req.flash(
        "notice",
        "Unexpected error occurred while adding classification."
      );
      return res.redirect("/inv/add-classification");
    }
  }
};



invCont.buildAddVehicle = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null,
  });
} 

/* ***************************
 *  Build Add Inventory view
 * ************************** */
invCont.addInventory = async function (req, res, next) {
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
  let nav = await utilities.getNav();
 
  const insertResult = await invModel.newInventory(
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_price,
    inv_miles,
    inv_color,
    inv_year,
    inv_thumbnail,
    classification_id
  );

  if (insertResult) {
    req.flash("notice", `Added new vehicle: ${inv_make} ${inv_model}`);
  
    const classificationList = await utilities.buildClassificationList();
    res.status(201).render("./inventory/management", {
      title: "Management",
      nav,
      classificationList,
      error: null,
    })
  } else {
    req.flash("notice", `Error adding new vehicle: ${inv_make} ${inv_model}`);
    let classificationList = await utilities.buildClassificationList();
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      errors: null,
      classificationList,
    
    })
  }
}   

module.exports = invCont;