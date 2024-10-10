// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/index");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildSingleClassification));

// Route to build the management view
// "/" acts as the main entry point for the router’s route, typically handling requests to the base path where the router is mounted.
router.get("/", utilities.handleErrors(invController.buildManagement));

// Error 500
router.get("/trigger-error", utilities.handleErrors(invController.buildError))

module.exports = router;