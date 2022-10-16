function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");
  // Use the list of sample names to populate the select options
  d3.json("./static/js/samples.json").then((data) => {
    var sampleNames = data.names;
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
};


// Initialize the dashboard
init();


// Fetch new data each time a new sample is selected
function optionChanged(newSample) {
  buildMetadata(newSample);
  buildCharts(newSample);
};


// Demographics Panel 
function buildMetadata(sample) {
  d3.json("./static/js/samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });
  });
};


function buildCharts(sample) {
  // Use d3.json to load and retrieve the samples.json file 
  d3.json("./static/js/samples.json").then((data) => {
    var samples = data.samples;
    // Filter the samples for the object with the desired sample number.
    var sampleArray = samples.filter(sampleObj => sampleObj.id == sample);
    //  Collect the first sample in the array.
    var sampleZero = sampleArray[0];

    console.log("+++++ Sample Zero ++++++");
    console.log(sampleZero);

    // Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_ids = sampleZero.otu_ids;
    var otu_labels = sampleZero.otu_labels;
    var sample_values = sampleZero.sample_values;

    var toptenSampleVals = (sampleZero.sample_values).sort((a,b) => b-a).slice(0, 10).reverse();
    console.log(toptenSampleVals);

    var toptenOtuIDs = (sampleZero.otu_ids).slice(0, 10).reverse();
    console.log(toptenOtuIDs);

    var toptenOtuLabels = (sampleZero.otu_labels).slice(0, 10).reverse();
    console.log(toptenOtuLabels);

    // Create the yticks for the bar chart.

    var yticks = [(sampleZero.otu_ids).slice(0, 10).map( value => "OTU "+value).reverse()];
    console.log("yticks = " + yticks);

    // Create the trace for the bar chart. 
    var barData = [{
      type: 'bar',
      x: toptenSampleVals,
      y: toptenOtuIDs,
      orientation: 'h',
      hoverinfo: "text",
      hovertext: toptenOtuLabels
    }];
    // Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",
      height: 600,
      width: 800,
      xaxis: {title: "Sample Values"},
      yaxis: {
        title: 'OTU IDs'
        , type: 'category'
        , categoryorder: 'array'
        , categoryarray: 'yticks'}
    };
    // Use Plotly to plot the bar chart data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);

    // Create the trace for the bubble chart.
    var bubbleData = [{
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      type: 'scatter',
      mode: 'markers',
      marker: {
        color: otu_ids,
        line: {
          color: 'rgba(165, 196, 50, 1)',
          width: 1,
        },
        size: sample_values,
        sizemode: 'diameter'}
    }];

    // Create the layout for the bubble chart.
    var bubbleLayout = {
      title: 'Bacteria Cultures Per Sample',
      xaxis: {title: 'OTU IDs'},
      yaxis: {title: 'Sample Values'},
      showlegend: false,
      hovermode: 'closest',
      height: 600,
      width: 1000
    };

    // Use Plotly to plot the bubble chart data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);



//        colorway : ['#f3cec9', '#e7a4b6', '#cd7eaf', '#a262a9', '#6f4d96', '#3d3b72', '#182844'],
//    colorscale: [[0, '#e7a4b6'], [0.25, '#cd7eaf'], [0.45, '#a262a9'], [0.65, '#6f4d96'], [0.85, '#3d3b72'], [1, '#182844']],


  });
};
