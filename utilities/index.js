const utils = require("pg/lib/utils");
const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  //console.log(data)
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display" class="inv-ul">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors"></a>'
      grid += '<div class="namePrice">'      
      grid += '<h2 class="button_cont">'
      grid +=
        '<a class="example_d" href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        " </a>";
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += "<hr>"
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  
  return grid
}

/* **************************************
* Build the single classification grid
* ************************************ */
Util.buildSingleClassification = async function (data) {
 let grid = "";
if (data.length > 0) {
 
  data.forEach((vehicle) => {
    grid += `
      <div class="img-desc">
        <div id="test-desc">
          <p class="single-desc">${vehicle.inv_description}</p>
        </div>
        <div class="full-img">
          <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${
      vehicle.inv_model
    } on CSE Motors">
        </div>
      </div>
      <div class="inventory-container">
        <ul class="desc-ul">
          <li class="vehicle-price"><strong>Price:</strong> $${new Intl.NumberFormat(
            "en-US"
          ).format(vehicle.inv_price)}</li>
          <li class="miles"><strong>Mileage:</strong> ${new Intl.NumberFormat(
            "en-US"
          ).format(vehicle.inv_miles)}</li>
          <li class="inv-color"><strong>Color:</strong> ${
            vehicle.inv_color
          }</li>
        </ul>
        <p class="call-today">Call us TODAY!</p>
      </div>
    `;
  });
  
} else {
  grid = `<p class="notice">Sorry, no matching vehicles could be found.</p>`;
}

return grid;
}

/* **************************************
* Build the management grid
* ************************************ */

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classification_id" required class="form-dropdown">';
  classificationList += "<option value=''>Choose a Classification</option>";

  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}" ${
      row.classification_id === Number(classification_id) ? "selected" : ""
    }>`;
    classificationList += `${row.classification_name}</option>`;
  });

  classificationList += "</select>";
  return classificationList;
};


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util;

