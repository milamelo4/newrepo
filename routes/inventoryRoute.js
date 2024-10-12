// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/index");
const regValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildSingleClassification));

// Route to build the management view
// "/" acts as the main entry point for the router’s route, typically handling requests to the base path where the router is mounted.
router.get("/", utilities.handleErrors(invController.buildManagement));

// Error 500
router.get("/trigger-error", utilities.handleErrors(invController.buildError))

// Route to build the add classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Process classification name attempt
router.post(
  "/add-classification",
  regValidate.classificationRules(),
  regValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build the add vehicle view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddVehicle));

// Process vehicle name attempt
router.post(
  "/add-inventory",
  regValidate.vehicleRules(),
  regValidate.checkVehicleData,
  utilities.handleErrors(invController.addInventory)
);


module.exports = router;