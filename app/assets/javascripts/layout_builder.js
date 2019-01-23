var draggable;

$(document).ready(function() {
  if (window.location.pathname.includes("layouts")) {
    $('.layout-builder-nav-item').click(function(evt) {
      evt.preventDefault();

      let currentTable = $('#view_builder_table_name').data('table-name');

      var tabName = $(this).data().tabName;

      tablinks = document.getElementsByClassName("layout-builder-nav-item");

      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }

      evt.currentTarget.className += " active";


      goToTab(tabName);
    })

    $('.layout_builder_selected_table_name').click(function(evt) {
      evt.preventDefault();
      var table = $(this).data().tableName;
      showFieldSettingsFormScreen2();
      rebuildDraggableFields(table);
    })

    $('.layout_builder_field_settings_form_back_btn').click(function() {
      showFieldSettingsFormScreen1();
    })

    $('#layout-builder-modal-next-button').click(function() {
      goToNextScreen();
    })

    $('#layout-builder-modal-back-button').click(function() {
      goToPreviousScreen();
    })

    $('#layout-builder-modal-save-button').click(function() {
      var layoutName = document.getElementById('layout-builder-modal-form-name').value;
      var layoutPrimaryTable = document.getElementById('layout-builder-modal-form-primary-table').value;
      saveLayout(layoutName, layoutPrimaryTable);
    })

    $('#layout-builder-modal').modal({
      backdrop: 'static',
      keyboard: false
    });

    let currentTable = $('#view_builder_table_name').data('table-name');

    if (currentTable) {
      document.getElementById("layout-builder-field-settings-tab").click();
      showFieldSettingsFormScreen2();
      rebuildDraggableFields(currentTable)
    } else {
      document.getElementById("layout-builder-general-settings-tab").click();
    }
  }
})

function rebuildDraggableFields(table) {
  if (draggable) {
    draggable.destroy();
  }

  getOptionsForDraggable(table);
  document.getElementById('layout_builder_selected_table_name').innerHTML = "Fields / " + table;
}

function getOptionsForDraggable(primaryTable) {
  $.ajax({
    url: "/layouts/table_fields_with_type",
    type: 'GET',
    data: {
      table: primaryTable
    },
    async: true,
    dataType: "json",
    error: function(XMLHttpRequest, errorTextStatus, error){
              alert("Failed: "+ errorTextStatus+" ;"+error);
           },
    success: function(data){
      updateDraggableFields(data);
    }
  })
}

function updateDraggableFields(data) {
  $('#layout-builder-draggable-fields-container').html('');

  //
  // populate containers first with data attributes for container as draggable items
  //
  // refreshFromDataAttributes();

  for (var i = 0; i < data.length; i++) {
    var fieldName = data[i][0]
    var fieldType = data[i][1]
    var icon = iconForFieldType(fieldType);
    var item = "<div class='layout-builder-draggable-field layout-builder-draggable-item draggable-source'>" +
    "<i class=" + "'" + icon + "'" + "aria-hidden='true'></i> " + fieldName +
    "</div>"

    //
    // add field to draggable container if container data contains field AND
    // contianer does not already inlcude a dragable item with the same field name.
    //
    if (containerDataContainsField('layout-builder-draggable-header-container1', fieldName)) {
      if (!containerContainsDraggableItem('#layout-builder-draggable-header-container1', fieldName)) {
        $('#layout-builder-draggable-header-container1').append(item);
      }
    } else if (containerDataContainsField('layout-builder-draggable-header-container2', fieldName)) {
      if (!containerContainsDraggableItem('#layout-builder-draggable-header-container2', fieldName)) {
        $('#layout-builder-draggable-header-container2').append(item);
      }
    } else if (containerDataContainsField('layout-builder-draggable-side-container', fieldName)) {
      if (!containerContainsDraggableItem('#layout-builder-draggable-side-container', fieldName)) {
        $('#layout-builder-draggable-side-container').append(item);
      }
    } else if (containerDataContainsField('layout-builder-draggable-main-container1', fieldName)) {
      if (!containerContainsDraggableItem('#layout-builder-draggable-main-container1', fieldName)) {
        $('#layout-builder-draggable-main-container1').append(item);
      }
    } else if (containerDataContainsField('layout-builder-draggable-main-container2', fieldName)) {
      if (!containerContainsDraggableItem('#layout-builder-draggable-main-container2', fieldName)) {
        $('#layout-builder-draggable-main-container2').append(item);
      }
    } else if (containerDataContainsField('layout-builder-draggable-main-container3', fieldName)) {
      if (!containerContainsDraggableItem('#layout-builder-draggable-main-container3', fieldName)) {
        $('#layout-builder-draggable-main-container3').append(item);
      }
    } else {
      $('#layout-builder-draggable-fields-container').append(item);
    }
  }

  initializeDraggable();
}

function refreshFromDataAttributes() {
  // for each container, create a draggable item for its data attributes
  let containerIds = ["#layout-builder-draggable-header-container1", "#layout-builder-draggable-header-container2", "#layout-builder-draggable-side-container", "#layout-builder-draggable-main-container1", "#layout-builder-draggable-main-container2", "#layout-builder-draggable-main-container3"]

  for (var i = 0; i < containerIds.length; i++) {
    let containerId = containerIds[i];
    let containerData = $(containerId).data('fields-for-container');
    for (var i = 0; i < containerData.length; i++) {
      var fieldName = containerData[i][0]
      var fieldType = containerData[i][1]
      var icon = iconForFieldType(fieldType);
      var item = "<div class='layout-builder-draggable-field layout-builder-draggable-item draggable-source'>" +
      "<i class=" + "'" + icon + "'" + "aria-hidden='true'></i> " + fieldName +
      "</div>"
      $(containerId).append(item);
    }
  }
}

function containerDataContainsField(containerId, fieldName) {
  let fields = $('#' + containerId).data('fields-for-container');
  return fields.includes(fieldName)
}

function containerContainsDraggableItem(containerId, fieldName) {
  let draggableItems = $(containerId + ' .layout-builder-draggable-item').text().trim().split(" ")
  return draggableItems.includes(fieldName)
}

function initializeDraggable() {
  const containers = '#layout-builder-draggable-trash-container, #layout-builder-draggable-fields-container, #layout-builder-draggable-header-container1, #layout-builder-draggable-header-container2, #layout-builder-draggable-side-container, #layout-builder-draggable-main-container1, #layout-builder-draggable-main-container2, #layout-builder-draggable-main-container3'
  const dataContainers = '#layout-builder-draggable-trash-container, #layout-builder-draggable-header-container1, #layout-builder-draggable-header-container2, #layout-builder-draggable-side-container, #layout-builder-draggable-main-container1, #layout-builder-draggable-main-container2, #layout-builder-draggable-main-container3'

  draggable = new window.Draggable.Sortable(document.querySelectorAll(containers), {
    draggable: '.layout-builder-draggable-item'
  });

  const fieldsContainer = document.querySelectorAll('#layout-builder-draggable-fields-container')[0];

  draggable.on('drag:start', (dragEvent) => {
    showTrashContainer();
  })

  draggable.on('drag:stop', (dragEvent) => {
    let currentContainer = dragEvent.source.parentNode;
    let destinationContainerId = currentContainer.id;
    let sourceContainerId = dragEvent.data.sourceContainer.id;
    let currentContainerId = currentContainer.id;
    let currentFieldValue = dragEvent.source.innerText.trim();

    hideTrashContainer();

    if (destinationContainerId === 'layout-builder-draggable-trash-container') {
      fieldsContainer.insertBefore(dragEvent.source, fieldsContainer.childNodes[0]);

      setTimeout(function () {
        fieldsContainer.firstElementChild.classList.toggle('layout-builder-trash-can-item-put-back');
      }, 100);

      setTimeout(function () {
        fieldsContainer.firstElementChild.classList.toggle('layout-builder-trash-can-item-put-back');
      }, 2000);
    }

    if (sourceContainerId === destinationContainerId) {
      return
    }

    if (isDataContainer(sourceContainerId)) {
      saveDraggableContainer(dragEvent, sourceContainerId)
    }

    if (isDataContainer(destinationContainerId)) {
      saveDraggableContainer(dragEvent, destinationContainerId)
    }
  });
}

function iconForFieldType(fieldType) {
  switch(fieldType) {
    case 'string':
    case 'text':
      return 'fa fa-font'
      break;
    case 'time':
    case 'timestamp':
      return 'fa fa-clock-o'
      break;
    case 'date':
    case 'datetime':
      return 'fa fa-calendar'
      break;
    case 'boolean':
      return 'fa fa-toggle-on'
      break;
    default:
      return 'fa fa-font'
  }
}

function isDataContainer(containerId) {
  return isNotTrashContainer(containerId) && isNotFieldsContainer(containerId)
}

function isNotTrashContainer(containerId) {
  return containerId != 'layout-builder-draggable-trash-container'
}

function isNotFieldsContainer(containerId) {
  return containerId != 'layout-builder-draggable-fields-container'
}

function saveDraggableContainer(dragEvent, containerId) {
  let notification;
  let field = dragEvent.source.innerText.trim();
  let queryId = "#" + containerId;
  let containerItems = getContainerItems(containerId);
  let containerItemsJSON = [];

  for (var i = 0; i < containerItems.length; i++) {
    containerItemsJSON.push(containerItems[i].innerText.trim())
  }

  updateLayoutBuilderContainer(containerId, containerItemsJSON)
}

function updateLayoutBuilderContainer(containerId, containerItems) {
  var url = window.location.href;
  var id = url.split("/")[4];
  var containerParam = getContainerParam(containerId);
  var data = {};
  data["view_builder"] = {};

  if (containerItems.length === 0) {
    data["view_builder"][containerParam] = JSON.stringify(containerItems)
  } else {
    data["view_builder"][containerParam] = containerItems
  }

  $.ajax({
    url: "/layouts/" + id,
    type: 'PATCH',
    data: data,
    error: function(XMLHttpRequest, errorTextStatus, error){
      console.error("PATCH /layouts/:id Failed: "+ errorTextStatus+" ;"+error);
    },
    success: function(response, status, request){
      console.log("PATCH /layouts/:id Success")
    }
  })
}

function getContainerItems(containerId) {
  let query;
  query = "#" + containerId + " " + ".layout-builder-draggable-field:not(.draggable--original):not(.draggable-mirror)"
  return document.querySelectorAll(query);
}

function showTrashContainer() {
  $('#layout-builder-draggable-trash-container').removeClass('hide');
  $('#layout-builder-draggable-trash-container').addClass('animated zoomIn');
}

function hideTrashContainer() {
  $('#layout-builder-draggable-trash-container').addClass('hide');
}

function getContainerParam(containerId) {
  switch(containerId) {
    case 'layout-builder-draggable-header-container1':
      return 'draggable_fields_header_container1'
      break;
    case 'layout-builder-draggable-header-container2':
      return 'draggable_fields_header_container2'
      break;
    case 'layout-builder-draggable-main-container1':
      return 'draggable_fields_main_container1'
      break;
    case 'layout-builder-draggable-main-container2':
      return 'draggable_fields_main_container2'
      break;
    case 'layout-builder-draggable-main-container3':
      return 'draggable_fields_main_container3'
      break;
    case 'layout-builder-draggable-side-container':
      return 'draggable_fields_side_container'
      break;
    default:
      console.error("unknown container - " + containerId);
      return
  }
}

function saveLayout(name, primaryTable) {
  var layoutID;
  var redirectURL;

  $.ajax({
    url: "/layouts",
    type: 'POST',
    data: {
      table: primaryTable,
      view_name: name
    },
    error: function(XMLHttpRequest, errorTextStatus, error){
              alert("Failed: "+ errorTextStatus+" ;"+error);
           },
    success: function(response, status, request){
      layoutID = response.id;
      redirectURL = "/layouts/" + layoutID + "/edit";
      window.location.replace(redirectURL);
    }
  })
}

function goToNextScreen() {
  $('#layout-builder-modal-screen-1').toggleClass('hide');
  $('#layout-builder-modal-screen-2').toggleClass('hide');
}

function goToPreviousScreen() {
  $('#layout-builder-modal-screen-1').toggleClass('hide');
  $('#layout-builder-modal-screen-2').toggleClass('hide');
}

function showFieldSettingsFormScreen2() {
  $('#layout_builder_field_settings_form_screen_1').addClass('hide');
  $('#layout_builder_field_settings_form_screen_2').removeClass('hide');
}

function showFieldSettingsFormScreen1() {
  $('#layout_builder_field_settings_form_screen_2').addClass('hide');
  $('#layout_builder_field_settings_form_screen_1').removeClass('hide');
}

function goToTab(tabName) {
  var i, tabContent;

  // Get all elements with class="tabcontent" and hide them
  tabContent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }

  // Show the current tab
  document.getElementById(tabName).style.display = "block";
}
