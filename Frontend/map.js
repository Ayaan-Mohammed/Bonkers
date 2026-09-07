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

  // Generates a seamless, non-overlapping planar cadastral mesh within the 1 km buffer
  // using a shared-vertex lattice where adjacent plots and target parcel share exact edges
  function buildNonOverlappingCadastre(center, baseNum, targetSurvey, targetId, siteLabel) {
    var lat = center[1];
    var lng = center[0];
    var degLat = 1.0 / 110.574;
    var degLng = 1.0 / (111.320 * Math.cos(lat * (Math.PI / 180)));

    var M = 7;
    var targetC = 3;
    var targetR = 3;
    var stepX = (degLng * 2.05) / M;
    var stepY = (degLat * 2.05) / M;
    var startLng = lng - (targetC + 0.5) * stepX;
    var startLat = lat - (targetR + 0.5) * stepY;

    // 1. Compute shared corner vertices (M+1 x M+1)
    var nodes = {};
    for(var r = 0; r <= M; r++) {
      for(var c = 0; c <= M; c++) {
        var baseLng = startLng + c * stepX;
        var baseLat = startLat + r * stepY;
        var jx = 0;
        var jy = 0;
        // Inner vertices have organic, deterministic cadastral jitter
        if(c > 0 && c < M && r > 0 && r < M) {
          var seed = c * 17.13 + r * 31.41 + baseNum;
          var r1 = Math.abs(Math.sin(seed) * 10000) % 1;
          var r2 = Math.abs(Math.cos(seed) * 10000) % 1;
          jx = (r1 - 0.5) * stepX * 0.30;
          jy = (r2 - 0.5) * stepY * 0.30;
        }
        nodes[c + "_" + r] = [+(baseLng + jx).toFixed(6), +(baseLat + jy).toFixed(6)];
      }
    }

    // 2. Primary target parcel (occupies slot targetC, targetR)
    var targetCoords = [
      nodes[targetC + "_" + targetR],
      nodes[(targetC + 1) + "_" + targetR],
      nodes[(targetC + 1) + "_" + (targetR + 1)],
      nodes[targetC + "_" + (targetR + 1)],
      nodes[targetC + "_" + targetR]
    ];
    var targetParcel = {
      type: "Feature",
      properties: { id: targetId, survey: targetSurvey, label: siteLabel },
      geometry: { type: "Polygon", coordinates: [targetCoords] }
    };

    // 3. Contiguous, non-colliding neighboring parcels within 1 km radius
    var neighborsList = [];
    var count = 1;
    for(var gr = 0; gr < M; gr++) {
      for(var gc = 0; gc < M; gc++) {
        if(gc === targetC && gr === targetR) continue;

        var cX = (nodes[gc + "_" + gr][0] + nodes[(gc + 1) + "_" + (gr + 1)][0]) / 2;
        var cY = (nodes[gc + "_" + gr][1] + nodes[(gc + 1) + "_" + (gr + 1)][1]) / 2;
        var distSq = Math.pow((cX - lng) / degLng, 2) + Math.pow((cY - lat) / degLat, 2);
        if(distSq > 1.05) continue; // Boundary constrained to 1 km radius

        var sVal = (baseNum - 12 + count);
        if(sVal <= 0) sVal = count + 2;
        var sub = (count % 4 === 0) ? "/1" : (count % 5 === 0 ? "/2" : (count % 3 === 0 ? "/B" : ""));
        var label = sVal + sub;
        count++;

        var poly = [
          nodes[gc + "_" + gr],
          nodes[(gc + 1) + "_" + gr],
          nodes[(gc + 1) + "_" + (gr + 1)],
          nodes[gc + "_" + (gr + 1)],
          nodes[gc + "_" + gr]
        ];

        var areaAc = (1.4 + ((gc * 3 + gr * 5) % 9) * 0.35).toFixed(1);
        neighborsList.push({
          type: "Feature",
          properties: {
            id: "N-" + label,
            survey: label,
            area: areaAc + " Ac"
          },
          geometry: { type: "Polygon", coordinates: [poly] }
        });
      }
    }

    return {
      parcel: targetParcel,
      neighbors: { type: "FeatureCollection", features: neighborsList }
    };
  }

  var SITES_CONFIG = {
    UP: {
      label: "Khasra 412/1 — Demo District, Uttar Pradesh",
      center: [80.9462, 26.8467],
      baseNum: 412,
      targetSurvey: "412/1",
      targetId: "UP-DEMO-412-001"
    },
    KA: {
      label: "Survey No. 88/2 — Kundana, Bengaluru Rural, Karnataka",
      center: [77.7141, 13.2432],
      baseNum: 88,
      targetSurvey: "88/2",
      targetId: "KA-DEMO-088-002"
    },
    TN: {
      label: "Patta 1042 (Survey 187/2A) — Vellalore, Coimbatore, Tamil Nadu",
      center: [77.0432, 11.0021],
      baseNum: 187,
      targetSurvey: "187/2A",
      targetId: "TN-DEMO-104-042"
    },
    TS: {
      label: "Survey No. 245/A — Kanakamamidi, Rangareddy, Telangana",
      center: [78.2680, 17.3195],
      baseNum: 245,
      targetSurvey: "245/A",
      targetId: "TS-DEMO-245-018"
    },
    BR: {
      label: "Khasra 512/3 — Walmi, Phulwari Sharif, Patna, Bihar (⚠️ Discrepancy Flagged)",
      center: [85.0741, 25.5682],
      baseNum: 512,
      targetSurvey: "512/3",
      targetId: "BR-DEMO-512-004"
    },
    MH: {
      label: "Gat No. 88/1A — Wagholi, Haveli Taluka, Pune, Maharashtra (⚠️ Active Bojha)",
      center: [73.9812, 18.5793],
      baseNum: 88,
      targetSurvey: "88/1A",
      targetId: "MH-DEMO-712-088"
    }
  };

  var SITES = {};
  Object.keys(SITES_CONFIG).forEach(function(k){
    var cfg = SITES_CONFIG[k];
    var cad = buildNonOverlappingCadastre(cfg.center, cfg.baseNum, cfg.targetSurvey, cfg.targetId, cfg.label);
    SITES[k] = {
      label: cfg.label,
      center: cfg.center,
      zoom: 15.0,
      pitch: 15,
      bearing: 0,
      parcel: cad.parcel,
      neighbors: cad.neighbors
    };
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
            "fill-color": "#2e2417",
            "fill-opacity": key === currentKey ? 0.32 : 0.0
          }
        });

        map.addLayer({
          id: "neighbors-line-" + id,
          type: "line",
          source: "neighbors-" + id,
          paint: {
            "line-color": "#c29e69",
            "line-width": 1.1,
            "line-opacity": key === currentKey ? 0.60 : 0.0
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
        map.setPaintProperty("neighbors-fill-" + id, "fill-opacity", isCurrent ? 0.32 : 0.0);
      }
      if(map.getLayer("neighbors-line-" + id)){
        map.setPaintProperty("neighbors-line-" + id, "line-opacity", isCurrent ? 0.60 : 0.0);
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
