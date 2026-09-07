/* ============================================================
   GIS Parcel View — MapLibre GL JS module.
   Provides interactive cadastral GIS visualization for Bhu-InterOp:
   - Primary searched parcel with golden boundary highlight
   - Realistic neighboring parcel polygons
   - Minimal GIS controls (Zoom in, Zoom out, Fit parcel, Reset)
   - Smooth aerial camera flyTo animations
============================================================ */
(function(){
  "use strict";

  var STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

  // Predefined sites with target parcel + realistic neighboring parcels
  var SITES = {
    UP: {
      label: "Khasra 412/1 — Demo District, Uttar Pradesh",
      center: [80.9462, 26.8467],
      zoom: 17.4,
      pitch: 35,
      bearing: -15,
      // Irregular target parcel polygon (Khasra 412/1)
      parcel: {
        type: "Feature",
        properties: { id: "UP-DEMO-412-001", survey: "412/1", label: "Khasra 412/1" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [80.9448, 26.8458],
            [80.9472, 26.8463],
            [80.9477, 26.8475],
            [80.9455, 26.8479],
            [80.9445, 26.8469],
            [80.9448, 26.8458]
          ]]
        }
      },
      // Neighboring parcel polygons surrounding the target
      neighbors: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { id: "411/2", survey: "411/2" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [80.9448, 26.8458], [80.9432, 26.8452], [80.9428, 26.8468], [80.9445, 26.8469], [80.9448, 26.8458]
              ]]
            }
          },
          {
            type: "Feature",
            properties: { id: "412/2", survey: "412/2" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [80.9472, 26.8463], [80.9490, 26.8467], [80.9485, 26.8482], [80.9477, 26.8475], [80.9472, 26.8463]
              ]]
            }
          },
          {
            type: "Feature",
            properties: { id: "413/1", survey: "413/1" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [80.9455, 26.8479], [80.9477, 26.8475], [80.9482, 26.8492], [80.9458, 26.8496], [80.9455, 26.8479]
              ]]
            }
          },
          {
            type: "Feature",
            properties: { id: "410", survey: "410" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [80.9448, 26.8458], [80.9456, 26.8442], [80.9478, 26.8447], [80.9472, 26.8463], [80.9448, 26.8458]
              ]]
            }
          }
        ]
      }
    },
    KA: {
      label: "Survey No. 88/2 — Kundana, Bengaluru Rural, Karnataka",
      center: [77.7141, 13.2432],
      zoom: 17.3,
      pitch: 30,
      bearing: 10,
      parcel: {
        type: "Feature",
        properties: { id: "KA-DEMO-088-002", survey: "88/2", label: "Survey 88/2" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [77.7128, 13.2423],
            [77.7152, 13.2426],
            [77.7156, 13.2441],
            [77.7136, 13.2444],
            [77.7125, 13.2433],
            [77.7128, 13.2423]
          ]]
        }
      },
      neighbors: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { id: "88/1" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [77.7128, 13.2423], [77.7112, 13.2418], [77.7108, 13.2432], [77.7125, 13.2433], [77.7128, 13.2423]
              ]]
            }
          },
          {
            type: "Feature",
            properties: { id: "89" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [77.7152, 13.2426], [77.7171, 13.2429], [77.7168, 13.2446], [77.7156, 13.2441], [77.7152, 13.2426]
              ]]
            }
          },
          {
            type: "Feature",
            properties: { id: "87" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [77.7136, 13.2444], [77.7156, 13.2441], [77.7159, 13.2458], [77.7139, 13.2461], [77.7136, 13.2444]
              ]]
            }
          }
        ]
      }
    },
    TN: {
      label: "Patta 1042 — Vellalore, Coimbatore, Tamil Nadu",
      center: [77.0432, 11.0021],
      zoom: 17.3,
      pitch: 32,
      bearing: -8,
      parcel: {
        type: "Feature",
        properties: { id: "TN-DEMO-104-042", survey: "187/2A", label: "Patta 1042" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [77.0418, 11.0012],
            [77.0442, 11.0016],
            [77.0446, 11.0031],
            [77.0426, 11.0034],
            [77.0415, 11.0023],
            [77.0418, 11.0012]
          ]]
        }
      },
      neighbors: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { id: "187/1" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [77.0418, 11.0012], [77.0402, 11.0008], [77.0398, 11.0022], [77.0415, 11.0023], [77.0418, 11.0012]
              ]]
            }
          },
          {
            type: "Feature",
            properties: { id: "188" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [77.0442, 11.0016], [77.0461, 11.0019], [77.0458, 11.0036], [77.0446, 11.0031], [77.0442, 11.0016]
              ]]
            }
          },
          {
            type: "Feature",
            properties: { id: "186" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [77.0426, 11.0034], [77.0446, 11.0031], [77.0449, 11.0048], [77.0429, 11.0051], [77.0426, 11.0034]
              ]]
            }
          }
        ]
      }
    }
  };

  var map = null;
  var currentKey = "UP";
  var ready = false;

  function init(){
    var container = document.getElementById("gis-map");
    if(!container || typeof maplibregl === "undefined") return;

    try{
      map = new maplibregl.Map({
        container: "gis-map",
        style: STYLE_URL,
        center: SITES.UP.center,
        zoom: SITES.UP.zoom,
        pitch: SITES.UP.pitch,
        bearing: SITES.UP.bearing,
        attributionControl: false
      });
    }catch(e){
      console.warn("MapLibre init fallback:", e);
      return;
    }

    map.on("load", function(){
      // Add sources for all sites
      Object.keys(SITES).forEach(function(key){
        var site = SITES[key];
        var id = key.toLowerCase();

        // 1. Neighboring parcels
        map.addSource("neighbors-" + id, {
          type: "geojson",
          data: site.neighbors
        });

        map.addLayer({
          id: "neighbors-fill-" + id,
          type: "fill",
          source: "neighbors-" + id,
          paint: {
            "fill-color": "#382f22",
            "fill-opacity": key === currentKey ? 0.38 : 0.0
          }
        });

        map.addLayer({
          id: "neighbors-line-" + id,
          type: "line",
          source: "neighbors-" + id,
          paint: {
            "line-color": "#d8c7ad",
            "line-width": 1.2,
            "line-opacity": key === currentKey ? 0.45 : 0.0,
            "line-dasharray": [2, 2]
          }
        });

        // 2. Primary searched parcel (highlighted with radiant golden boundary)
        map.addSource("parcel-" + id, {
          type: "geojson",
          data: site.parcel
        });

        map.addLayer({
          id: "parcel-fill-" + id,
          type: "fill",
          source: "parcel-" + id,
          paint: {
            "fill-color": "#e7ae59",
            "fill-opacity": key === currentKey ? 0.42 : 0.0
          }
        });

        map.addLayer({
          id: "parcel-line-" + id,
          type: "line",
          source: "parcel-" + id,
          paint: {
            "line-color": "#e7ae59",
            "line-width": key === currentKey ? 3.5 : 0.0,
            "line-opacity": 1.0
          }
        });

        // Click popup on target parcel
        map.on("click", "parcel-fill-" + id, function(e){
          new maplibregl.Popup({closeButton: false, offset: 12})
            .setLngLat(e.lngLat)
            .setHTML("<b style='color:#1a1207;'>✓ " + site.label + "</b><br><small style='color:#555;'>Presumptive Verified Boundary</small>")
            .addTo(map);
        });
      });

      ready = true;
      updateLayerVisibilities();
    });
  }

  function updateLayerVisibilities(){
    if(!ready || !map) return;
    Object.keys(SITES).forEach(function(key){
      var id = key.toLowerCase();
      var isCurrent = key === currentKey;
      if(map.getLayer("parcel-fill-" + id)){
        map.setPaintProperty("parcel-fill-" + id, "fill-opacity", isCurrent ? 0.42 : 0.0);
      }
      if(map.getLayer("parcel-line-" + id)){
        map.setPaintProperty("parcel-line-" + id, "line-width", isCurrent ? 3.5 : 0.0);
      }
      if(map.getLayer("neighbors-fill-" + id)){
        map.setPaintProperty("neighbors-fill-" + id, "fill-opacity", isCurrent ? 0.38 : 0.0);
      }
      if(map.getLayer("neighbors-line-" + id)){
        map.setPaintProperty("neighbors-line-" + id, "line-opacity", isCurrent ? 0.45 : 0.0);
      }
    });

    var site = SITES[currentKey];
    var labelEl = document.getElementById("map-label");
    if(labelEl && site) labelEl.textContent = site.label;
  }

  function selectParcel(key){
    var upper = (key || "UP").toUpperCase();
    if(!SITES[upper]) upper = "UP";
    currentKey = upper;
    var site = SITES[currentKey];

    if(ready && map){
      updateLayerVisibilities();
      map.flyTo({
        center: site.center,
        zoom: site.zoom,
        pitch: site.pitch,
        bearing: site.bearing,
        speed: 1.1,
        curve: 1.4,
        essential: true
      });
    }
  }

  function zoomIn(){
    if(map) map.zoomIn({duration: 300});
  }

  function zoomOut(){
    if(map) map.zoomOut({duration: 300});
  }

  function fitParcel(){
    if(!map || !SITES[currentKey]) return;
    var site = SITES[currentKey];
    map.flyTo({
      center: site.center,
      zoom: site.zoom + 0.5,
      pitch: 42,
      bearing: site.bearing,
      essential: true
    });
  }

  function resetView(){
    if(!map || !SITES[currentKey]) return;
    var site = SITES[currentKey];
    map.flyTo({
      center: site.center,
      zoom: site.zoom,
      pitch: site.pitch,
      bearing: site.bearing,
      essential: true
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    init();

    // Wire minimal GIS controls
    var btnIn = document.getElementById("map-zoom-in");
    var btnOut = document.getElementById("map-zoom-out");
    var btnFit = document.getElementById("map-fit-parcel");
    var btnReset = document.getElementById("map-reset-view");

    if(btnIn) btnIn.addEventListener("click", zoomIn);
    if(btnOut) btnOut.addEventListener("click", zoomOut);
    if(btnFit) btnFit.addEventListener("click", fitParcel);
    if(btnReset) btnReset.addEventListener("click", resetView);
  });

  window.LandMap = {
    selectParcel: selectParcel,
    zoomIn: zoomIn,
    zoomOut: zoomOut,
    fitParcel: fitParcel,
    resetView: resetView
  };
})();
