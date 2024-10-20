/* ***************************
 *  Account Model
 * ************************** */
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const accountController = {};

/* ***************************
 *  Account Controller
 * ************************** */
const utilities = require("../utilities");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    }); 
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 }
      );

      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/"); 
    } else {
      req.flash("notice", "Invalid password. Please try again."); 
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      }); // Ensure we return a response here as well
    }
  } catch (error) {
    console.error(error);
    req.flash(
      "notice",
      "An error occurred while trying to log in. Please try again."
    );
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    }); // Handle error cases properly
  }
}


// build accountManagement view (used in accountRoute.js)
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav();
  res.render("account/accountManagement", {
    title: "Account Management",
    nav,
    errors: null,
    accountData: res.locals.accountData,
  });
}

// logout account 
async function logoutAccount(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have successfully logged out.")
  res.redirect("/account/login");
}

// Build Update Account View
async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav();
  res.render("account/update-account", {
    title: "Manage Account",
    nav,
    errors: null,
    
  });
}
// update account
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { 
    account_firstname, 
    account_lastname, 
    account_email, account_id 
  } = req.body;
  const accountId = parseInt(account_id);

  try {
    // Update the account details in the database
    const currentAccount = await accountModel.getAccountById(accountId);
    if (currentAccount) {
      const hasChanges =
        currentAccount.account_firstname !== account_firstname ||
        currentAccount.account_lastname !== account_lastname ||
        currentAccount.account_email !== account_email;

      if (!hasChanges) {
        req.flash("notice", "No changes were made.");
        res.render("account/accountManagement", {
          title: "Account Management",
          nav,
          errors: null,
          accountData: currentAccount,
        });
        return;
      }
    }
    const updResult = await accountModel.updateAccount(
      account_firstname,
      account_lastname,
      account_email,
      accountId
    );

    if (updResult) {
      req.flash("notice", "Congratulations, you updated the account!");

      // Create a new JWT token with updated data
      const accountToken = await accountModel.getAccountByEmail(account_email);
      delete accountToken.account_password;
      const token = jwt.sign(accountToken, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600 * 1000,
      });

      // Set the JWT cookie
      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600 * 1000,
      };
      if (process.env.NODE_ENV !== "development") {
        cookieOptions.secure = true;
      }
      res.cookie("jwt", token, cookieOptions);

      // Render the account management page with updated data
      res.render("account/accountManagement", {
        title: "Account Management",
        nav,
        errors: null,
        accountData: accountToken,
      });
    } else {
      // If update fails, flash an error and re-render the update form
      req.flash("notice", "Sorry, the account update failed.");
      res.status(501).render("account/update-account", {
        title: "Edit Account",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    console.error(error);
    req.flash("notice", "An error occurred while updating the account.");
    res.status(500).render("account/update-account", {
      title: "Edit Account",
      nav,
      errors: [{ msg: "Internal server error. Please try again later." }],
    });
  }
}
// Process change password
async function changePassword(req, res) {
  const { password, confirmPassword, account_id } = req.body;
  let nav = await utilities.getNav();
  if (password !== confirmPassword) {
    req.flash("notice", "Passwords do not match.");
    return res.status(400).render("account/update-account", {
      title: "Edit Account",
      nav,
      errors: null,
    });
  }

  try {
    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the account's password in the database
    const updateResult = await accountModel.updatePassword(
      account_id,
      hashedPassword
    );

    if (updateResult) {
      req.flash("notice", "Your password has been successfully changed.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Failed to update password. Please try again.");
      return res.status(500).render("account/update-account", {
        title: "Edit Account",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    console.error(error);
    req.flash("notice", "An error occurred while changing the password.");
    return res.status(500).render("account/update-account", {
      title: "Edit Account",
      nav,
      errors: null,
    });
  }
}


module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  logoutAccount,
  updateAccount,
  buildUpdateAccount,
  changePassword
};
