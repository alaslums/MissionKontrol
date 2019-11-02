function fetchDataForPermissionsTable() {
  $.ajax({
    dataType: "json",
    url: "/" + (location.pathname+location.search).substr(1),
    success: function(d) {
      loadPermissionsDataTable(d.columns);
    }
  });
}

function displayCheckbox (value, role_name, action) {
  if (value === true) {
    return "<img class='filled-checkbox' src='/assets/images/icons/black-check-box-with-white-check.png' data-role='"+role_name+"' data-action='"+action+"'>"
  } else {
    return "<img class='empty-checkbox' src='/assets/images/icons/black-checkbox-empty.svg' data-role='"+role_name+"' data-action='"+action+"'>"
  }
}

function formatNestedColumns ( d ) {
  return '<table id="permissions--nested-table" data-table="'+d.Table+'">'+
      '<tr>'+
          '<td class="permissions--nested-table-data"><p>View</p></td>'+
          '<td class="permissions--nested-table-data">'+ displayCheckbox(d.Admin_view, 'Admin', 'view') +'</td>'+
          '<td class="permissions--nested-table-data">'+ displayCheckbox(d.Sales_view, 'Sales', 'view') +'</td>'+
          '<td class="permissions--nested-table-data">'+ displayCheckbox(d.Team_Lead_view, 'Team Lead', 'view') +'</td>'+
      '</tr>'+
      '<tr>'+
          '<td class="permissions--nested-table-data"><p>Create</p></td>'+
          '<td class="permissions--nested-table-data">'+ displayCheckbox(d.Admin_create, 'Admin', 'create') +'</td>'+
          '<td class="permissions--nested-table-data">'+ displayCheckbox(d.Sales_create, 'Sales', 'create') +'</td>'+
          '<td class="permissions--nested-table-data">'+ displayCheckbox(d.Team_Lead_create, 'Team Lead', 'create') +'</td>'+
      '</tr>'+
      '<tr>'+
          '<td class="permissions--nested-table-data"><p>Edit</p></td>'+
          '<td class="permissions--nested-table-data">'+ displayCheckbox(d.Admin_edit, 'Admin', 'edit') +'</td>'+
          '<td class="permissions--nested-table-data">'+ displayCheckbox(d.Sales_edit, 'Sales', 'edit') +'</td>'+
          '<td class="permissions--nested-table-data">'+ displayCheckbox(d.Team_Lead_edit, 'Team Lead', 'edit') +'</td>'+
      '</tr>'+
      '<tr>'+
          '<td class="permissions--nested-table-data"><p>Delete</p></td>'+
          '<td class="permissions--nested-table-data">'+ displayCheckbox(d.Admin_delete, 'Admin', 'delete') +'</td>'+
          '<td class="permissions--nested-table-data">'+ displayCheckbox(d.Sales_delete, 'Sales', 'delete') +'</td>'+
          '<td class="permissions--nested-table-data">'+ displayCheckbox(d.Team_Lead_delete, 'Team Lead', 'delete') +'</td>'+
      '</tr>'+
  '</table>';
}

function loadPermissionsDataTable (columns) {
  var searchableTable = $(".data-table-permissions").DataTable({
    "colReorder": true,
    "paging": false,
    "info": false,
    "searching": false,
    "deferRender": true,
    "autoWidth": false,
    "scrollX": true,
    "serverSide": true,
    "processing": true,
      "language": {
        processing: "<div class='sk-spinner sk-spinner-chasing-dots'>" +
              "<div class='sk-dot1'></div>" +
              "<div class='sk-dot2'></div>" +
            "</div>"},
    "ajax": "/" + (location.pathname+location.search).substr(1),
    "columns": columns,
    "stateSave": true,
    "stateSaveCallback": function (settings, data) {
      if ( settings.iDraw <= 1 ) {
        return;
      }

      $.ajax({
        "url": "/data_table_states/save?table=" + $(this).data("table-name"),
        "data": { "state": data },
        "dataType": "json",
        "type": "POST",
        "success": function () {}
      });
    },
    "stateLoadCallback": function (settings, callback) {
      $.ajax({
        "url": "/data_table_states/load?table=" + $(this).data("table-name"),
        "dataType": "json",
        "success": function (json) {
          callback( json );
        }
      });
    },
    "createdRow": function( row, data, dataIndex ) {
      let table = $(this).data("table-name");
      let id = data.id;
      let previewUrl = "/tables/" + table + "/" + id + "?table=" + table;
      $(row).addClass( "clickable-row-permissions" );
      $(row).attr( "data-href",  previewUrl);
    },
    "initComplete": function(settings, json) {
      $('[id ^="target-table-"][id $="_filter"] input').unbind();
      $('[id ^="target-table-"][id $="_filter"] input').bind('keyup', function(e) {
        if(e.keyCode === 13) {
          searchableTable.search( this.value ).draw();
        }
      });
    }
  });

  $('body').on('click', '#target-table-permissions > tbody > tr.clickable-row-permissions', function () {
    var tr = $(this);
    var row = searchableTable.row(tr);

    if ( row.child.isShown() ) {
      row.child.hide();
      tr.removeClass('shown');
    }
    else {
      row.child( formatNestedColumns(row.data()) ).show();
      tr.addClass('shown');
    }
  })
}

function addRolePermission (role, permission, table) {
  $.post({
    dataType: "json",
    url: "/permissions/add_to_role.js",
    data:
      {
        role: role,
        permission: permission,
        table: table
      },
    success: function(d) {
    }
  });
}

function removeRolePermission (role, permission, table) {
  $.post({
    dataType: "json",
    url: "/permissions/remove_from_role.js",
    data:
      {
        role: role,
        permission: permission,
        table: table
      },
    success: function(d) {
    }
  });
}

$(document).ready(function() {
  let metaTag = $("meta[name=psj]");
  let isCurrentControllerPermissions = metaTag.attr("controller") === "permissions";

  if (isCurrentControllerPermissions) {
    fetchDataForPermissionsTable();
  }

  $('body').on('click', '#target-table-permissions .empty-checkbox', function () {
    var role = $(this).data('role')
    var permission = $(this).data('action')
    var table = $(this).closest('table').data('table')

    addRolePermission(role, permission, table)
  });

  $('body').on('click', '#target-table-permissions .filled-checkbox', function () {
    var role = $(this).data('role')
    var permission = $(this).data('action')
    var table = $(this).closest('table').data('table')

    removeRolePermission(role, permission, table)
  });
})
