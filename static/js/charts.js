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
    var metadat = data.metadata;
    // Filter the samples for the object with the desired sample number.
    var sampleArray = samples.filter(sampleObj => sampleObj.id == sample);
    var sampleZero = sampleArray[0];

    // Filter the metadata for the object with the desired sample number.
    var resultArr = metadat.filter(sampleObj => sampleObj.id == sample);
    var resultZero = resultArr[0];

    // Create variables that hold the otu_ids, otu_labels, and sample_values. (BUBBLE CHART)
    var otu_ids = sampleZero.otu_ids;
    var otu_labels = sampleZero.otu_labels;
    var sample_values = sampleZero.sample_values;

    // Create Top Ten variables for the otu_ids, otu_labels, and sample_values. (BAR CHART)
    var toptenSampleVals = (sampleZero.sample_values).sort((a,b) => b-a).slice(0, 10).reverse();
    var toptenOtuIDs = (sampleZero.otu_ids).slice(0, 10).reverse();
    var toptenOtuLabels = (sampleZero.otu_labels).slice(0, 10).reverse();

    // Create a float variable that holds the washing frequency. (GAUGE CHART)
    var washFreq = parseFloat(resultZero.wfreq);

    // Create the yticks for the bar chart.
    var yticks = [(sampleZero.otu_ids).slice(0, 10).map( value => "OTU "+value).reverse()];

    //---------------------------------------------------------------------------
    // Create the trace for the bar chart. 
    var barData = [{
      type: 'bar',
      x: toptenSampleVals,
      y: toptenOtuIDs,
      orientation: 'h',
      hoverinfo: 'text',
      hovertext: toptenOtuLabels
    }];

    // Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",
      plot_bgcolor:"#e6f7ff",
      paper_bgcolor:"#e6f7ff",
      xaxis: {
        showline: true
      },
      yaxis: {
        ticks: 'outside',
        type: 'category',
        categoryorder: 'array',
        categoryarray: 'yticks'
      },
      margin: { t: 30, b: 30},
      modebar: {
        orientation: 'v'
      }
    };

    // Create the config for the bar chart.
    var barConfig = {responsive: true, displaylogo: false};

    // Use Plotly to plot the bar chart data with the layout. 
    Plotly.newPlot('bar', barData, barLayout, barConfig);

    //---------------------------------------------------------------------------
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
          color: 'rgba(165, 196, 55, 5)',
          width: 1,
        },
        size: sample_values,
        sizemode: 'diameter'}
    }];

    // Create the layout for the bubble chart.
    var bubbleLayout = {
      title: 'Bacteria Cultures Per Sample',
      xaxis: {
        title: 'OTU IDs',
        automargin: true
      },
      yaxis: {
        automargin: true
      },
      plot_bgcolor:'#e6f7ff',
      paper_bgcolor:'#e6f7ff',
      showlegend: false,
      hovermode: 'closest',
      height: 600,
      width: 1100,
      displaylogo: false
    };

    // Create the config for the bubble chart.
    var bubbleConfig = {responsive: true, scrollZoom: true, displaylogo: false};

    // Use Plotly to plot the bubble chart data with the layout.
    Plotly.newPlot('bubble', bubbleData, bubbleLayout, bubbleConfig);

    //---------------------------------------------------------------------------
    // Create the trace for the gauge chart.
    var gaugeData = [
      {
        value: washFreq,
        title: {
          text:
            "Belly Button Washing Frequency<br><span style='font-size:0.8em;color:gray'>Scrubs Per Week</span>"
        },
        type: 'indicator',
        align: 'center',
        mode: 'gauge+number', 
        gauge: {
            axis: { range: [null, 10] },
              steps: [
                { range: [0, 2], color: "red" },
                { range: [2, 4], color: "orange" },
                { range: [4, 6], color: "yellow" },
                { range: [6, 8], color: "lightgreen" },
                { range: [8, 10], color: "green" }
              ]
          }
      }
    ];
    
    // Create the layout for the gauge chart.
    var gaugeLayout = { 
      plot_bgcolor:'#e6f7ff',
      paper_bgcolor:'#e6f7ff',
    };

    // Create the config for the gauge chart.
    var gaugeConfig = {responsive: true, displaylogo: false};

    // Use Plotly to plot the gauge data and layout.
    Plotly.newPlot('gauge', gaugeData, gaugeLayout, gaugeConfig);

  });
};
