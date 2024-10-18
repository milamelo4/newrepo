const form = document.querySelector("#inventoryForm");
form.addEventListener("change", function () {
  const updateBtn = document.querySelector("#submitBtn");
  updateBtn.removeAttribute("disabled");
});
