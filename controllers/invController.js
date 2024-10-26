const invModel = require("../models/inventory-model");
const reviewModel = require("../models/review-model");
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
 *  Build Single view by classification
 * ************************** */
invCont.buildSingleClassification = async function (req, res, next) {
  const inv_id = req.params.inventoryId;
  const data = await invModel.getInventoryByInvId(inv_id);
  const reviews = await reviewModel.getReviewsByInventoryId(inv_id);

  const classMake = data[0].inv_make;
  const classModel = data[0].inv_model;
  const classYear = data[0].inv_year;
  const grid = await utilities.buildSingleClassification(data);
  let nav = await utilities.getNav();

  // Check if the user is logged in
  const loggedIn = req.session && req.session.loggedin;

  res.render("./inventory/vehicle", {
    title: `${classYear} ${classMake} ${classModel} vehicle`,
    nav,
    grid,
    reviews,
    vehicle: data[0],
    inv_id,
    errors: null,
    accountData: res.locals.accountData,
    loggedIn, // Pass loggedIn to the view
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
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
    errors: null,
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

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  const classResult = await invModel.newClassification(classification_name);
  const classificationSelect = await utilities.buildClassificationList();
  let nav = await utilities.getNav();
  if (classResult) {
    req.flash("success", `Congratulations, you added ${classification_name}!`);
    res.status(201).render("./inventory/management", {
      title: "Management",
      nav,
      classificationSelect,
    });
  } else {
    req.flash("notice", "Sorry, the new classification wasn't entered.");
    res.status(501).render("./inventory/add-classification", {
      title: "Enter new classification",
      nav,
      errors: null,
    });
  }
};

/* ***************************
*Build Add Inventory View
* ************************** */
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
 *  Process Add Inventory view
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  let nav = await utilities.getNav();
 
  const insertResult = await invModel.newInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  );

  if (insertResult) {
    req.flash("success", `Added new vehicle: ${inv_make} ${inv_model}`);
  
    const classificationList = await utilities.buildClassificationList();
    res.status(201).render("./inventory/management", {
      title: "Management",
      nav,
      classificationSelect: classificationList,
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
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
}   

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemDataArray = await invModel.getInventoryByInvId(inv_id);
  const itemData = itemDataArray[0]; // Access the first element of the array instead of adding on res.render

  if (!itemData) {
    req.flash("error", "Item not found");
    return res.redirect("/inv");
  }

  const classificationList = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
};

/* ***************************
 *  Update Inventory
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("success", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemDataArray = await invModel.getInventoryByInvId(inv_id);
  const itemData = itemDataArray[0]; // Access the first element of the array instead of adding on res.render
  //console.log(itemData);
  if (!itemData) {
    req.flash("error", "Item not found");
    return res.redirect("/inv");
  }
 
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  });
};

invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_price,
    inv_year,
  } = req.body;
  const updateResult = await invModel.deleteInventoryItem(
    inv_id,
    inv_make,
    inv_model,
    inv_price,
    inv_year,
  );

  const itemName = updateResult.inv_make + " " + updateResult.inv_model;
  if (updateResult) {
    req.flash("success", `The vehicle was successfully deleted.`);
    res.redirect("/inv/");
  } else {    
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
    });
  }
};

module.exports = invCont;