let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
d3.json(queryUrl).then(function (data) {
  createFeatures(data.features);
});

// Function to create map features from earthquake data
function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
  }

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      let magnitude = feature.properties.mag;
      // Scale marker size based on magnitude
      let markerSize = magnitude * 5;
      let depth = feature.geometry.coordinates[2];
      // Get color based on depth
      let markerColor = getMarkerColor(depth);

      // Create a circle marker for each earthquake
      return L.circleMarker(latlng, {
        radius: markerSize,
        fillColor: markerColor,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
      });
    }
  });

  createMap(earthquakes);
}

function createMap(earthquakes) {
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let baseMaps = {
    "Street Map": street
  };

  let overlayMaps = {
    Earthquakes: earthquakes
  };
  let myMap = L.map("map", {
    center: [13.7563, 100.5018],
    zoom: 3,
    layers: [street, earthquakes]
  });

  // Add a legend to explain depth-color relationship
  let legend = L.control({ position: 'bottomright' });
  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
   
    div.style.backgroundColor = 'white';
    div.style.padding = '5px';
    div.style.border = '1px solid #ccc';
    
    let depthLabels = ['-10 - 10', '10-30', '30-50', '50-70', '70-90', '90+'];
    let colors = ['#FFD700', '#FFA500', '#FF4500', '#8B0000', '#800080', '#4B0082'];

    for (let i = 0; i < depthLabels.length; i++) {
      div.innerHTML +=
        '<div style="margin-bottom: 5px;">' +
        `<span style="display: inline-block; width: 20px; height: 20px; background-color: ${colors[i]}"></span>` +
        `<span style="margin-left: 5px;">${depthLabels[i]}</span>` +
        '</div>';
    }

    return div;
  };
  legend.addTo(myMap);
}

function getMarkerColor(depth) {
    if (depth >= -10 && depth <= 10) {
      return '#FFD700'; // Gold
    } else if (depth > 10 && depth <= 30) {
      return '#FFA500'; // Orange
    } else if (depth > 30 && depth <= 50) {
      return '#FF4500'; // Red-Orange
    } else if (depth > 50 && depth <= 70) {
      return '#8B0000'; // Dark Red
    } else if (depth > 70 && depth <= 90) {
      return '#800080'; // Purple
    } else {
      return '#4B0082'; // Indigo
    }
  }
