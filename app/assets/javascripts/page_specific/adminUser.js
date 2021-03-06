function submitSettingsChange () {
  $("body").on("change", "#role--edit-settings:checkbox", function () {
    var id = $(this).data("role");
    var setting = $(this).data("setting");
    $.ajax({
     method: "PUT",
     url: "/roles",
     data: {
       id: id,
       setting: setting
     },
    });
  });

  $("body").on("change", "#role--export-limit", function () {
    var id = $(this).data("role");
    var limit = $(this).val();
    $.ajax({
     method: "PUT",
     url: "/roles",
     data: {
       id: id,
       limit: limit
     },
    })
  });
}

Paloma.controller("AdminUsers", {
  index () {
    submitSettingsChange();
  }
});
