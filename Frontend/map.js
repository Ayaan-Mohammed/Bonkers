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

  function get1KmBounds(center) {
    var lat = center[1];
    var lng = center[0];
    var degLat = 1.0 / 110.574;
    var degLng = 1.0 / (111.320 * Math.cos(lat * (Math.PI / 180)));
    return [
      [+(lng - degLng).toFixed(6), +(lat - degLat).toFixed(6)],
      [+(lng + degLng).toFixed(6), +(lat + degLat).toFixed(6)]
    ];
  }

  function createCirclePolygon(center, radiusInMeters, points) {
    if(!points) points = 64;
    var coords = [];
    var km = radiusInMeters / 1000;
    var lat = center[1];
    var lng = center[0];
    var degLat = km / 110.574;
    var degLng = km / (111.320 * Math.cos(lat * (Math.PI / 180)));

    for(var i = 0; i <= points; i++) {
      var theta = (i / points) * (2 * Math.PI);
      var x = lng + degLng * Math.cos(theta);
      var y = lat + degLat * Math.sin(theta);
      coords.push([+x.toFixed(6), +y.toFixed(6)]);
    }
    return {
      type: "Feature",
      properties: { radius: "1 km" },
      geometry: {
        type: "Polygon",
        coordinates: [coords]
      }
    };
  }

  function generate1KmNeighbors(center, baseNum, initialFeatures) {
    var list = (initialFeatures && initialFeatures.slice()) || [];
    var lat = center[1];
    var lng = center[0];
    var degLat = 1.0 / 110.574;
    var degLng = 1.0 / (111.320 * Math.cos(lat * (Math.PI / 180)));

    var steps = 6;
    var stepX = (degLng * 2) / steps;
    var stepY = (degLat * 2) / steps;

    var num = parseInt(baseNum, 10) || 100;
    var count = 1;

    for(var r = 0; r < steps; r++) {
      for(var c = 0; c < steps; c++) {
        var minX = lng - degLng + c * stepX;
        var maxX = minX + stepX;
        var minY = lat - degLat + r * stepY;
        var maxY = minY + stepY;

        var jx = ((r * 7 + c * 13) % 10 - 5) * 0.00018;
        var jy = ((r * 11 + c * 3) % 10 - 5) * 0.00018;

        var pMinX = +(minX + jx).toFixed(6);
        var pMaxX = +(maxX - jx).toFixed(6);
        var pMinY = +(minY + jy).toFixed(6);
        var pMaxY = +(maxY - jy).toFixed(6);

        var cX = (pMinX + pMaxX) / 2;
        var cY = (pMinY + pMaxY) / 2;
        var distSq = Math.pow((cX - lng) / degLng, 2) + Math.pow((cY - lat) / degLat, 2);

        if(distSq > 1.08) continue;
        if(distSq < 0.08) continue;

        var sVal = (num - 15 + count);
        if(sVal <= 0) sVal = count + 2;
        var sub = (count % 3 === 0) ? "/1" : (count % 4 === 0 ? "/2" : (count % 5 === 0 ? "/A" : ""));
        var label = sVal + sub;
        count++;

        list.push({
          type: "Feature",
          properties: { id: "N-" + label, survey: label, area: (1.1 + (count % 6) * 0.35).toFixed(1) + " Ac" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [pMinX, pMinY],
              [pMaxX, pMinY],
              [pMaxX, pMaxY],
              [pMinX, pMaxY],
              [pMinX, pMinY]
            ]]
          }
        });
      }
    }

    return {
      type: "FeatureCollection",
      features: list
    };
  }

  // Predefined sites with target parcel + realistic neighboring parcels
  var SITES = {
    UP: {
      label: "Khasra 412/1 — Demo District, Uttar Pradesh",
      center: [80.9462, 26.8467],
      zoom: 15.0,
      pitch: 15,
      bearing: 0,
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
      zoom: 15.0,
      pitch: 15,
      bearing: 0,
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
      zoom: 15.0,
      pitch: 15,
      bearing: 0,
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
                [77.0442, 11.0016], [77.0461, 11.0019], [77.0458, 11.0036], [77.0446, 11.0033], [77.0442, 11.0016]
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
    },
    TS: {
      label: "Survey No. 245/A — Kanakamamidi, Rangareddy, Telangana",
      center: [78.2680, 17.3195],
      zoom: 15.0,
      pitch: 15,
      bearing: 0,
      parcel: {
        type: "Feature",
        properties: { id: "TS-DEMO-245-018", survey: "245/A", label: "Survey 245/A" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [78.2668, 17.3186],
            [78.2692, 17.3190],
            [78.2696, 17.3205],
            [78.2676, 17.3208],
            [78.2665, 17.3197],
            [78.2668, 17.3186]
          ]]
        }
      },
      neighbors: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { id: "244" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [78.2668, 17.3186], [78.2652, 17.3182], [78.2648, 17.3196], [78.2665, 17.3197], [78.2668, 17.3186]
              ]]
            }
          },
          {
            type: "Feature",
            properties: { id: "245/B" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [78.2692, 17.3190], [78.2711, 17.3193], [78.2708, 17.3210], [78.2696, 17.3205], [78.2692, 17.3190]
              ]]
            }
          },
          {
            type: "Feature",
            properties: { id: "246" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [78.2676, 17.3208], [78.2696, 17.3205], [78.2699, 17.3222], [78.2679, 17.3225], [78.2676, 17.3208]
              ]]
            }
          }
        ]
      }
    },
    BR: {
      label: "Khasra 512/3 — Walmi, Phulwari Sharif, Patna, Bihar (⚠️ Discrepancy Flagged)",
      center: [85.0741, 25.5682],
      zoom: 15.0,
      pitch: 15,
      bearing: 0,
      parcel: {
        type: "Feature",
        properties: { id: "BR-DEMO-512-004", survey: "512/3", label: "Khasra 512/3 (Jamabandi 418)" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [85.0728, 25.5673],
            [85.0754, 25.5677],
            [85.0759, 25.5691],
            [85.0736, 25.5694],
            [85.0725, 25.5684],
            [85.0728, 25.5673]
          ]]
        }
      },
      neighbors: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { id: "511/1" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [85.0728, 25.5673], [85.0712, 25.5668], [85.0708, 25.5682], [85.0725, 25.5684], [85.0728, 25.5673]
              ]]
            }
          },
          {
            type: "Feature",
            properties: { id: "512/4" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [85.0754, 25.5677], [85.0772, 25.5680], [85.0768, 25.5697], [85.0759, 25.5691], [85.0754, 25.5677]
              ]]
            }
          }
        ]
      }
    },
    MH: {
      label: "Gat No. 88/1A — Wagholi, Haveli Taluka, Pune, Maharashtra (⚠️ Active Bojha)",
      center: [73.9812, 18.5793],
      zoom: 15.0,
      pitch: 15,
      bearing: 0,
      parcel: {
        type: "Feature",
        properties: { id: "MH-DEMO-712-088", survey: "88/1A", label: "7/12 Gat 88/1A" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [73.9798, 18.5784],
            [73.9824, 18.5788],
            [73.9828, 18.5803],
            [73.9806, 18.5806],
            [73.9795, 18.5795],
            [73.9798, 18.5784]
          ]]
        }
      },
      neighbors: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { id: "88/1B" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [73.9798, 18.5784], [73.9782, 18.5779], [73.9778, 18.5793], [73.9795, 18.5795], [73.9798, 18.5784]
              ]]
            }
          },
          {
            type: "Feature",
            properties: { id: "89" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [73.9824, 18.5788], [73.9842, 18.5791], [73.9839, 18.5808], [73.9828, 18.5803], [73.9824, 18.5788]
              ]]
            }
          }
        ]
      }
    }
  };

  // Augment sites with realistic 1 km neighboring cadastral grid
  var SITES_BASE_NUMS = { UP: 412, KA: 88, TN: 187, TS: 245, BR: 512, MH: 88 };
  Object.keys(SITES).forEach(function(k){
    var s = SITES[k];
    s.neighbors = generate1KmNeighbors(s.center, SITES_BASE_NUMS[k] || 100, s.neighbors.features);
  });

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

        // 1. 1 km Radius Buffer Ring
        map.addSource("radius-ring-" + id, {
          type: "geojson",
          data: createCirclePolygon(site.center, 1000)
        });

        map.addLayer({
          id: "radius-ring-fill-" + id,
          type: "fill",
          source: "radius-ring-" + id,
          paint: {
            "fill-color": "#f1cc89",
            "fill-opacity": key === currentKey ? 0.04 : 0.0
          }
        });

        map.addLayer({
          id: "radius-ring-line-" + id,
          type: "line",
          source: "radius-ring-" + id,
          paint: {
            "line-color": "#e7ae59",
            "line-width": 1.5,
            "line-dasharray": [4, 3],
            "line-opacity": key === currentKey ? 0.75 : 0.0
          }
        });

        // 2. Neighboring parcels (1 km radius cadastre)
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
            "line-opacity": key === currentKey ? 0.5 : 0.0,
            "line-dasharray": [2, 2]
          }
        });

        // 3. Primary searched parcel (highlighted with radiant golden boundary)
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
            .setHTML("<b style='color:#1a1207;'>✓ " + site.label + "</b><br><small style='color:#555;'>Selected Target Parcel (Presumptive Verified)</small>")
            .addTo(map);
        });

        // Click popup on neighboring parcel
        map.on("click", "neighbors-fill-" + id, function(e){
          var p = e.features && e.features[0] ? e.features[0].properties : null;
          var sNum = p && p.survey ? ("Survey " + p.survey) : "Neighboring Plot";
          var area = p && p.area ? ("<br><small style='color:#555;'>Area: " + p.area + "</small>") : "";
          new maplibregl.Popup({closeButton: false, offset: 12})
            .setLngLat(e.lngLat)
            .setHTML("<b style='color:#1a1207;'>Neighbor: " + sNum + "</b>" + area + "<br><span style='color:#a37118;font-size:0.75rem;font-weight:600;'>Within 1 km Cadastral Buffer</span>")
            .addTo(map);
        });

        map.on("mouseenter", "neighbors-fill-" + id, function(){ map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "neighbors-fill-" + id, function(){ map.getCanvas().style.cursor = ""; });
        map.on("mouseenter", "parcel-fill-" + id, function(){ map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "parcel-fill-" + id, function(){ map.getCanvas().style.cursor = ""; });
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
      if(map.getLayer("radius-ring-fill-" + id)){
        map.setPaintProperty("radius-ring-fill-" + id, "fill-opacity", isCurrent ? 0.04 : 0.0);
      }
      if(map.getLayer("radius-ring-line-" + id)){
        map.setPaintProperty("radius-ring-line-" + id, "line-opacity", isCurrent ? 0.75 : 0.0);
      }
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
        map.setPaintProperty("neighbors-line-" + id, "line-opacity", isCurrent ? 0.5 : 0.0);
      }
    });

    var site = SITES[currentKey];
    var labelEl = document.getElementById("map-label");
    if(labelEl && site) labelEl.textContent = site.label;
  }

  function selectParcel(key, customLabel){
    var upper = (key || "UP").toUpperCase();
    if(!SITES[upper]) upper = "UP";
    currentKey = upper;
    var site = SITES[currentKey];

    if(ready && map){
      map.resize();
      updateLayerVisibilities();
      if(customLabel){
        var labelEl = document.getElementById("map-label");
        if(labelEl) labelEl.textContent = customLabel;
      }
      var bounds = get1KmBounds(site.center);
      map.fitBounds(bounds, {
        padding: { top: 40, bottom: 40, left: 40, right: 40 },
        pitch: 15,
        bearing: 0,
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
    var bounds = get1KmBounds(site.center);
    map.fitBounds(bounds, {
      padding: { top: 40, bottom: 40, left: 40, right: 40 },
      pitch: 15,
      bearing: 0,
      duration: 750,
      essential: true
    });
  }

  function resetView(){
    if(!map || !SITES[currentKey]) return;
    var site = SITES[currentKey];
    var bounds = get1KmBounds(site.center);
    map.fitBounds(bounds, {
      padding: { top: 40, bottom: 40, left: 40, right: 40 },
      pitch: 15,
      bearing: 0,
      duration: 750,
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
