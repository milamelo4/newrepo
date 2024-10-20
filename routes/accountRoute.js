// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/index");
const regValidate = require("../utilities/account-validation");

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build account registration
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to handle account management
router.get("/", 
  utilities.handleErrors(utilities.checkLogin), 
  utilities.handleErrors(accountController.buildAccountManagement));

// Route to handle account logout
router.get("/logout", utilities.handleErrors(accountController.logoutAccount));
// Route to handle account registration form (POST request)

// Route to build the update form (without account_id in URL)
router.get("/update", 
  utilities.handleErrors(utilities.checkJWTToken), 
  utilities.handleErrors(accountController.buildUpdateAccount));

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLogData,
  utilities.handleErrors(accountController.accountLogin)
);

// Account update route
router.post(
  "/update",
  regValidate.acctUpdateRules(),
  regValidate.checkAccData,
  utilities.handleErrors(accountController.updateAccount)
);

// Account change password route
router.post(
  "/change-password",
  regValidate.passwordChangeRules(),
  regValidate.checkPasswordChangeData,
  utilities.handleErrors(accountController.changePassword)
);

module.exports = router;