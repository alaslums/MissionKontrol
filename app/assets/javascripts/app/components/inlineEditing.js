function showEditable(evt) {
  evt.preventDefault();

  let editableRow = evt.currentTarget.parentElement.parentElement.parentElement;
  let editableInput = $(editableRow).find(".editable-input");

  evt.currentTarget.style.display = "none";
  $(editableInput).css("display", "inline-block");
  $(editableInput).focus();

  return true;
}

function cancelEditable(evt) {
  evt.preventDefault();

  let editableRow = evt.currentTarget.parentElement.parentElement.parentElement;
  let editableContent = $(editableRow).find(".editable-content");
  let editableInput = $(editableRow).find(".editable-input");

  $(editableContent).css("display", "inline-block");
  $(editableInput).css("display", "none");
}

function hideEditable(editableContent, editableRow) {
  let editableInput = $(editableRow).find(".editable-input");

  $(editableContent).css("display", "inline-block");
  $(editableInput).css("display", "none");
}

function refreshEditableContent(editableContent, newValue) {
  $(editableContent).children(".editable-content-text").text(newValue);
}

function updateTableField(evt, table, field, id, databaseId) {
  evt.preventDefault();

  let editableRow = evt.currentTarget.parentElement.parentElement.parentElement;
  let editableContent = $(editableRow).find(".editable-content");
  let editableInput = $(editableRow).find(".editable-input");
  let currentValue = $(editableContent).text().trim();
  let newValue = $(editableInput).children("input").val();

  if (currentValue === newValue) {
    cancelEditable(evt);
    return;
  }

  let data = {};
  data["table_field"] = {};
  data["table_field"]["table"] = table;
  data["table_field"]["id"] = id;
  data["table_field"]["field"] = field;
  data["table_field"]["value"] = newValue;
  data["database_id"] = databaseId;

  $.ajax({
    url: "/table_field",
    type: "PATCH",
    data,
    error (XMLHttpRequest){
      if (XMLHttpRequest.status === 400) {
        prepareLongToast();
        toastr.error(XMLHttpRequest.responseJSON.error);
      }
    },
    success (){
      refreshEditableContent(editableContent, newValue);
      hideEditable(editableContent, editableRow);
      toastr.info("Table field successfully updated.");
    }
  });
}

function updateRelatedTableField(evt, table, field, foreignKeyTitle, foreignKeyValue) {
  evt.preventDefault();

  let editableRow = evt.currentTarget.parentElement.parentElement.parentElement;
  let editableContent = editableRow.getElementsByClassName("editable-content")[0];
  let editableInput = editableRow.getElementsByClassName("editable-input")[0];
  let currentValue = editableContent.innerText.trim();
  let newValue = editableInput.children[0].value;

  if (currentValue === newValue) {
    cancelEditable(evt);
    return;
  }

  let data = {};
  data["related_table_field"] = {};
  data["related_table_field"]["table"] = table;
  data["related_table_field"]["foreign_key_value"] = foreignKeyValue;
  data["related_table_field"]["foreign_key_title"] = foreignKeyTitle;
  data["related_table_field"]["field"] = field;
  data["related_table_field"]["value"] = newValue;

  $.ajax({
    url: "/related_table_field",
    type: "PATCH",
    data,
    error (XMLHttpRequest){
      if (XMLHttpRequest.status === 400) {
        prepareLongToast();
        toastr.error(XMLHttpRequest.responseJSON.error);
      }
    },
    success () {
      refreshEditableContent(editableContent, newValue);
      hideEditable(editableContent, editableRow);
      toastr.info("Related table field successfully updated.");
    }
  });
}

function updateFields (event) {
  const table = event.target.dataset.table;
  const field = event.target.dataset.field;
  const id = event.target.dataset.id;
  const foreignKeyTitle = event.target.dataset.foreignKeyTitle;
  const foreignKeyValue = event.target.dataset.foreignKeyValue;
  const databaseId = event.target.dataset.databaseId;

  if (foreignKeyTitle) {
    updateRelatedTableField(event, table, field, foreignKeyTitle, foreignKeyValue);
  } else {
    updateTableField(event, table, field, id, databaseId);
  }
}

function updateEditableFieldInput () {
  $(".editable-input input").blur(function(event) {
    updateFields(event);
  });

  $(".editable-input input").keypress(function(event){
    if(event.keyCode === 13) {
      updateFields(event);
    }
  });
}
