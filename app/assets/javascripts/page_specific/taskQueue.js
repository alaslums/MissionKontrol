function loadTaskQueuePreviewDataTable (columns) {
  if ($.fn.dataTable.isDataTable("#task-queue-preview-table")) {
    var table = $("#task-queue-preview-table").DataTable();
    table.destroy();
  }

  $("#task-queue-preview-table").DataTable({
    colReorder: false,
    deferRender: true,
    autoWidth: false,
    scrollX: true,
    serverSide: true,
    ajax: "/task_queues/" + location.pathname.split("/")[2] + "/preview",
    dom: "f<'table--info'pB>rti<'clear'>",
    pagingType: "simple_numbers",
    language: {
      paginate: {
        next: "Next >",
        previous: "< Prev",
      },
      info: "of _MAX_ results",
      zeroRecords: "Nothing found - sorry",
      infoEmpty: "",
      infoFiltered: "filtered from _MAX_ total records"
    },
    columns,
    stateSave: true,
    stateSaveCallback(settings, data) {
      stateSaveCallbackFunction(settings, data, $(this));
    },
    stateLoadCallback(settings, callback) {
      stateLoadCallbackFunction($(this), callback);
    },
    buttons: [
      {
        extend: "csv",
        className: "table--export ",
        text: "Export"
      }
    ],
    createdRow(row, data, dataIndex) {
      let id = data.id;
      $(row).addClass("task-queue-item");
      $(row).attr( "data-task-queue-item-primary-key", id);
    }
  });

  $("#task-queue-preview-table").removeClass("hide");
}

function initQueryBuilder (filters) {
  $("#builder").on("afterUpdateRuleValue.queryBuilder", function(e, rule) {
    if (rule.filter.plugin === "datepicker") {
      rule.$el.find(".rule-value-container input").datepicker("update");
    }
  });

  $("#builder").queryBuilder({
    filters,
    operators: ["equal",
                "not_equal",
                "contains",
                "not_contains",
                "between",
                "not_between",
                "is_null",
                "is_not_null",
                "begins_with",
                "not_begins_with",
                "is_empty",
                "is_not_empty",
                "less",
                "less_or_equal",
                "greater",
                "greater_or_equal",
                "ends_with",
                "not_ends_with"]
  });

  let taskQueueRules = $("#builder").data().taskQueueRules;

  if ($.isEmptyObject(taskQueueRules) ) {
    console.log("no rule present")
  } else {
    $("#builder").queryBuilder("setRules", taskQueueRules);
  }
}

function buildFilterForDataType (type, id) {
  var filter = {};

  if (type === "datetime") {
    filter["id"] = id;
    filter["type"] = "date";
    filter["validation"] = {
      format: "YYYY/MM/DD"
    };
    filter["plugin"] = "datepicker";
    filter["plugin_config"] = {
      format: "yyyy/mm/dd",
      todayBtn: "linked",
      todayHighlight: true,
      autoclose: true
    };
  } else {
    filter["id"] = id;
    filter["type"] = type;
  }

  return filter;
}

function loadQueryBuilder (data) {
  const filters = [];

  for (var i = 0; i < data.length; i++) {
    var filter;
    var id = data[i][0];
    var type = data[i][1];

    if (type === "inet" || type === "text") {
      filter = {};
      filter["id"] = id;
      filter["type"] = "string";
    } else {
      filter = buildFilterForDataType(type, id);
    }

    filters.push(filter);
  }

  initQueryBuilder(filters);
}

function getFieldsWithType (table) {
  $.ajax({
    url: "/layouts/table_fields_with_type",
    type: "GET",
    data: {
      table,
      id: $("#database-id").text().trim()
    },
    async: true,
    dataType: "json",
    error() {
      window.toastr.error("Invalid target database, please review credentials.");
    },
    success(data) {
      loadQueryBuilder(data);
    }
  });
}

function loadResults () {
  $(".task-queue-update-button").click(function() {
    let taskQueueId = document.getElementById("builder").dataset.taskQueueId;
    var params = {};
    params["task_queue"] = {};

    if ($("#builder").queryBuilder("getRules") != null) {
      params["task_queue"]["query_builder_rules"] = JSON.stringify($("#builder").queryBuilder("getRules"), null, 2);
    }

    if ($("#builder").queryBuilder("getSQL") != null) {
      params["task_queue"]["query_builder_sql"] = $("#builder").queryBuilder("getSQL").sql;
    }

    params["task_queue"]["details"] = document.getElementById("task_queue_details").value;
    params["task_queue"]["name"] = document.getElementById("task_queue_name").value;
    params["task_queue"]["success_outcome_title"] = document.getElementById("task_queue_success_outcome_title").value;
    params["task_queue"]["success_outcome_timeout"] = document.getElementById("task_queue_success_outcome_timeout").value;
    params["task_queue"]["failure_outcome_title"] = document.getElementById("task_queue_failure_outcome_title").value;
    params["task_queue"]["failure_outcome_timeout"] = document.getElementById("task_queue_failure_outcome_timeout").value;

    $.ajax({
      url: "/task_queues/" + taskQueueId,
      type: "PATCH",
      data: params,
      dataType: "json",
      error() {
        window.toastr.error("Task queue preview failed, review SQL.");
      },
      success(response) {
        let columns = response.columns;

        if (typeof columns !== "undefined") {
          loadTaskQueuePreviewDataTable(columns);
        }

        window.toastr.info("Task queue updated.");
      }
    });
  });
}

Paloma.controller("TaskQueues", {
  new () {
    $("#task-queue-modal").modal({
      backdrop: "static",
      keyboard: false
    });
  },
  edit () {
    let taskQueueTable = document.getElementById("builder").dataset.taskQueueTable;

    getFieldsWithType(taskQueueTable);
    loadResults();
  }
});