// Import data using D3 library
function dropDown(){
    // Drop down menu data and import subject names into menu
    var selection = d3.select('#selDataset');
    d3.json('samples.json').then(function(dataSamples){
        var names = dataSamples.names;
        selection.selectAll('option')
        .data(names)
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => d)
    var base = names[0];
    //Call functions makeGraphs and sortInfo for data plots and metadata dor
    // demographic info display
    makeGraphs(base);
    sortInfo(base);
    }).catch(error => console.log(error));
};
// Create the function for optionChange to initiate chnage from dropdown menu
function optionChanged(newBase){
    makeGraphs(newBase);
    sortInfo(newBase);
}
// Create function to clean metadata for each selected subject
function sorted(str){
    return str.toLowerCase().split(' ').map(letter => {
        return (letter.charAt(0).toUpperCase() + letter.slice(1));
    }).join(' ');
}
// Create function to display metadata for each subject in sample-metadata
function sortInfo(id){
    d3.json('samples.json').then(function(dataSamples){
        // Filter data from dataSamples metadata based on subject id
        var filtered = dataSamples.metadata.filter(sample => sample.id == id);
        // Declare selection as sample-metadata
        var selection = d3.select('#sample-metadata');
        selection.html('')
        // Appending extracted data into the panel sample-metadata
        Object.entries(filtered[0]).forEach(([i,z]) => {
            selection.append('h5')
                .text(`${sorted(i)}: ${z}`);
        });
    });
}
//Create makeGraphs function to create horizontal bar plot,  bubble plot, and Washing Frequency Gauge
function   makeGraphs(id) {
    d3.json("samples.json").then(function(graphsData){
        // Filter data for selected id
        let filterID = graphsData.samples.filter(sample => sample.id == id);
        let result = filterID[0];
        // Store metadata into gaugeData variable
        let gaugeData = graphsData.metadata.filter(sample => sample.id == id);

        // Create an array dataPL to store otu_ids, sample_values, and otu_labels
        dataPL = [];
        // Loop through result and store selected data for plotting
        for (i=0; i<result.sample_values.length; i++){
            dataPL.push({
                id: `OTU ${result.otu_ids[i]}`,
                value: result.sample_values[i],
                label: result.otu_labels[i]
            });
        }

        // Get top 10 OTUs
        let sortData = dataPL.sort(function sortFunction(a,b){
            return b.value - a.value;
        }).slice(0,10);
        // console.log(sortData)

        // Sort data in descending order
        let descData = sortData.sort(function sortFunction(a,b){
            return a.value - b.value;
        })

        // Create traceBar for horizontal bar graph
        let colors = ['#ECFFDC', '#98FB98', '#0BDA51',  '#50C878', '#4CBB17', '#2AAA8A', '#008000', '#088F8F', '#097969', '#454B1B']
        let traceBar = {
            type: "bar",
            orientation: 'h',
            x: descData.map(row=> row.value),
            y: descData.map(row => row.id),
            text: descData.map(row => row.label),
            mode: 'markers',
            marker: {
                color: colors
            }
          };
        // Create barData for horizontal bar plot
        let barData = [traceBar];
          
        let barLayout = {
            title: `<span style='font-size:1em; color:#008B8B'><b>Top 10 OTUs for Subject ${id}<b></span>`,
            xaxis: {autorange: true, title: 'Measured Sample Values'},
            yaxis: {autorange: true},
            width: 500,
            height: 500,
            plot_bgcolor: 'rgb(248,248,255)',
            paper_bgcolor: "lavender",
          };
        
        // Create the horizontal bar plot
        Plotly.newPlot("bar", barData, barLayout);

        // Declare bubble graphntrace bubble
        let traceBubble = {
            x: result.otu_ids,
            y: result.sample_values,
            mode: 'markers',
            marker: {
                size: result.sample_values,
                color: result.otu_ids,
                colorscale: 'YlGnBu'
            },
            text: result.otu_labels
        };
        // Declare bubble graph data
        let bubbleData = [traceBubble]

        let bubbleLayout = {
            title: `<span style='font-size:1em; color:##008B8B'><b>OTU Data for Subject ${id}<b></span>`,
            xaxis: {title:'Measured OTU ID'},
            yaxis: {title: 'Measured Sample Values'},
            width: window.width,
            paper_bgcolor: "lavender",
        };

        // Create bubble graph
        Plotly.newPlot('bubble', bubbleData, bubbleLayout);
        // Declare gauge indicator data
        let dataGauge = [
            {
              type: "indicator",
              mode: "gauge+number+delta",
              value: gaugeData[0].wfreq,
              title: `<span style='font-size:1.0em; color:#008B8B'><b>Washing Frequency<b><br>From Subject ${id}<br>No. of Weekly Scrubs</span>`,
              delta: { reference: 7, increasing: { color: "RebeccaPurple" } },
              gauge: {
                axis: { range: [null, 10], tickwidth: 1, tickcolor: "darkblue" },
                bar: { color: "darkblue" },
                bgcolor: "white",
                borderwidth: 2,
                bordercolor: "gray",
                steps: [
                  { range: [0, 2], color: '#097969' },
                  { range: [2, 4], color: '#088F8F' },
                  { range: [4, 6], color: '#2AAA8A' },
                  { range: [6, 8], color: '#98FB98' },
                  { range: [8, 10], color: '#ECFFDC' }
                ],
                threshold: {
                  line: { color: "red", width: 4 },
                  thickness: 1.0,
                  value: 9
                }
              }
            }
          ];
          //Declare indicator gauge layout
          let layoutGauge = {
            width: window.width,
            height: 500,
            margin: { t: 25, r: 25, l: 25, b: 25 },
            paper_bgcolor: "lavender",
            font: { color: "darkblue", family: "Arial" }
          };
          
          Plotly.newPlot('gauge', dataGauge, layoutGauge);

    }).catch(error => console.log(error));

}
dropDown()