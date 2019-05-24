var enjoyhint;

$(document).ready(function() {
  let metaTag = $('meta[name=psj]');
  let isCurrentControllerDashboard = metaTag.attr('controller') == 'dashboard';
  let isCurrentControllerTables = metaTag.attr('controller') == 'tables';
  let isCurrentControllerLayoutBuilder = metaTag.attr('controller') == 'layout_builder';
  let isCurrentActionShow = metaTag.attr('action') == 'show';
  let isCurrentActionPreview = metaTag.attr('action') == 'preview';
  let isCurrentActionEdit = metaTag.attr('action') == 'edit';
  let tourComplete = (sessionStorage.tourCompleted === 'true');

  loadFlotChart();
  loadFooTable();
  loadToastr();

  if (isCurrentControllerDashboard && isCurrentActionShow) {
    if (!tourComplete) {
      loadEnjoyhint1();
      enjoyhint.run();
    }
  }

  if (isCurrentControllerTables && isCurrentActionShow) {
    if (!tourComplete) {
      loadEnjoyhint2();
      enjoyhint.run();
    }
  }

  if (isCurrentControllerTables && isCurrentActionPreview) {
    loadEnjoyhint3();
    enjoyhint.run();
  }

  if (isCurrentControllerLayoutBuilder && isCurrentActionEdit) {
    if (!tourComplete) {
      loadEnjoyhint4();
      enjoyhint.run();
    }
  }
});

function loadFooTable () {
  $('.footable').footable();
}

function loadFlotChart() {
  var data1 = [
    [0, 4], [1, 8], [2, 5], [3, 10], [4, 4], [5, 16], [6, 5], [7, 11], [8, 6], [9, 11], [10, 30], [11, 10], [12, 13], [13, 4], [14, 3], [15, 3], [16, 6]
  ];

  var data2 = [
    [0, 1], [1, 0], [2, 2], [3, 0], [4, 1], [5, 3], [6, 1], [7, 5], [8, 2], [9, 3], [10, 2], [11, 1], [12, 0], [13, 2], [14, 8], [15, 0], [16, 0]
  ];

  $("#flot-dashboard-chart").length && $.plot($("#flot-dashboard-chart"), [
    data1, data2
  ],
  {
    series: {
      lines: {
        show: false,
        fill: true
      },
      splines: {
        show: true,
        tension: 0.4,
        lineWidth: 1,
        fill: 0.4
      },
      points: {
        radius: 0,
        show: true
      },
      shadowSize: 2
    },
    grid: {
      hoverable: true,
      clickable: true,
      tickColor: "#d5d5d5",
      borderWidth: 1,
      color: '#d5d5d5'
    },
    colors: ["#1ab394", "#1C84C6"],
    xaxis: {
    },
    yaxis: {
      ticks: 4
    },
    tooltip: false
  }
);
}

function loadToastr() {
  toastr.options = {
      closeButton: true,
      howMethod: 'fadeIn',
      hideMethod: 'fadeOut',
      preventDuplicates: true,
      timeOut: 2000
  };
}

function loadEnjoyhint1() {
  enjoyhint = new EnjoyHint({
    onSkip: function() {
      completeTour();
    }
  });
  let description = "<p>" + "Welcome to Kuwinda." + "<br/>" +
  "We’d love to show you around quickly." +
  "We have the app connected to a dummy database for a very basic events app." + "<br /><br />" +
  "Click on the tables to show tables available from the database" + "</p>";

  let description_tables = "<p>" + "When first setting up Kuwinda, it automatically finds all the tables available to it in your database and presents them here." + "<br/><br />" +
  "Click on users to see the users table." + "</p>";

  var enjoyhint_script_steps = [
    {
      'click #nav-link-for-tables': description,
      showSkip: false
    },
    {
      description: description_tables,
      selector: "#side-menu",
      showSkip: false
    }
  ];

  enjoyhint.set(enjoyhint_script_steps);
}

function loadEnjoyhint2() {
  enjoyhint = new EnjoyHint({
    onSkip: function() {
      completeTour();
    }
  });

  let description = "<p>" + "By default Kuwinda will show all the fields that it can find in the table, you can change this later." + "<br/>" +
  "Click on the first user to look at that user in a bit more detail." + "</p>";

  var enjoyhint_script_steps = [
    {
      description: description,
      selector: ".table-responsive",
      showNext: false,
      showSkip: false
    }
  ];

  enjoyhint.set(enjoyhint_script_steps);
}

function loadEnjoyhint3() {
  enjoyhint = new EnjoyHint({
    onSkip: function() {
      completeTour();
    }
  });

  let description = "<p>" + "A layout is built using the fields from the table. It can also show fields from related tables." + "<br/>" +
  "We have included the ability to comment on records and will be adding more here soon." + "<br /><br />" +
  "Click on Edit layout to see how a layout is built." + "</p>";

  var enjoyhint_script_steps = [
    {
      description: description,
      selector: ".edit-layout-btn",
      timeout: 800,
      showNext: false,
      showSkip: false
    }
  ];

  enjoyhint.set(enjoyhint_script_steps);
}

function loadEnjoyhint4() {
  enjoyhint = new EnjoyHint({
    onSkip: function() {
      completeTour();
    },
    onEnd: function() {
      completeTour();
    }
  });

  let description = "<p>" + "Build your layouts using our drag and drop editor." + "<br/>" +
  "You can add fields from the main table or fields from related tables." + "<br /><br />" +
  "Try adding some fields yourself. Click end now." + "</p>";

  var enjoyhint_script_steps = [
    {
      description: description,
      event: 'click',
      selector: ".layout_builder_selected_table_name",
      showSkip: false,
      showNext: true,
      "nextButton" : {text: "End"}
    }
  ];

  enjoyhint.set(enjoyhint_script_steps);
}

function completeTour() {
  sessionStorage.setItem('tourCompleted', true);
}