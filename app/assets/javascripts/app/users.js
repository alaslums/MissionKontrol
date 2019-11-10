function fetchDataForUserTable() {
  $.ajax({
    dataType: "json",
    url: "/" + (location.pathname+location.search).substr(1),
    success: function(d) {
      loadUserDataTable(d.columns);
    }
  });
}

function submitStatusChange () {
  $('body').on("change", "#user--edit-status:checkbox", function (e) {
    var id = $(this).data('user')
    $.post(
      "/admin_users/update_status",
      {
        id: id
      }
    )
  });
}

function submitTeamChange () {
  $('body').on("change", ".user--team-select", function () {
    var id = $(this).data('user');
    var role = $(this).val();
    $.post(
      "/admin_users/update_role",
      {
        id: id,
        role: role,
      }
    )
  })
}

function loadUserDataTable (columns) {
  columns.push({"data":null,"defaultContent":"<a class='user--edit-link' data-remote='true' href='#'><img src='/assets/images/icons/edit@2x.png'></a>"})
  var searchableTable = $("#target-table-admin-users").DataTable({
    "colReorder": true,
    "deferRender": true,
    "autoWidth": false,
    "scrollX": true,
    "serverSide": true,
    "processing": true,
      "language": {
        processing: "<div class='sk-spinner sk-spinner-chasing-dots'>" +
              "<div class='sk-dot1'></div>" +
              "<div class='sk-dot2'></div>" +
            "</div>",
        "paginate": {
          "first":      "First",
          "last":       "Last",
          "next":       "Next >",
          "previous":   "< Prev"
        },
        "info": "of _MAX_ results",
      },
    "ajax": "/" + (location.pathname+location.search).substr(1),
    "dom": 'f<"table--info"piB>rt<"clear">',
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
      let id = data.id;
      let previewUrl = '/users/edit/?id=' + id
      let editLink = row.lastChild.firstChild
      var statusField = row.children[3]
      var userStatus = statusField.innerHTML

      if (userStatus === 'false') {
        statusField.innerHTML = '<img src="/assets/images/icons/circle-with-cross.png">'
      } else {
        statusField.innerHTML = '<img src="/assets/images/icons/circle-with-check-symbol.png">'
      }

      $(editLink).attr( "href",  previewUrl);
    },
    "buttons": [
      {
        "extend": "csv",
        "className": "table--export",
        text: 'Export'
      },
      {
        text: 'Add',
        className: 'table--add',
        action: function () {
          $.ajax({
            "url": "/admin_users/new"
          });
        }
      }
    ],
    "initComplete": function(settings, json) {
      $('[id ^="target-table-"][id $="_filter"] input').unbind();
      $('[id ^="target-table-"][id $="_filter"] input').bind('keyup', function(e) {
        if(e.keyCode === 13) {
          searchableTable.search( this.value ).draw();
        }
      });
    }
  });
}

function saveNewUser () {
  // $('#some-form').submit(function(e) {
  //   e.preventDefault();    
  
  //   $('#more-inputs input').each(function() {
  //     var el = $(this);
  //     $('<input type="hidden" name="' + el.attr('name') + '" />')
  //         .val(el.val())
  //         .appendTo('#some-form');
  //   });
  
  //   $.get('http://yoururl.com', $('#some-form').serialize(), function (data) {
  //       alert('handle your data here: ' + data);
  //   });
  
  // });
  // $('body').on('submit', '#new-user-form', function (evt) {
  //   evt.preventDefault
  //   debugger
  // })
}

$(document).ready(function() {
  let metaTag = $("meta[name=psj]");
  let isCurrentControllerAdminUsers = metaTag.attr("controller") === "admin_users";

  if (isCurrentControllerAdminUsers) {
    fetchDataForUserTable();
  }

  submitStatusChange();
  submitTeamChange();
  saveNewUser();
})