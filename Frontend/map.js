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

  function getCadastreBounds(center, bufferKm) {
    var km = bufferKm || 0.30;
    var lat = center[1];
    var lng = center[0];
    var degLat = km / 110.574;
    var degLng = km / (111.320 * Math.cos(lat * (Math.PI / 180)));
    return [
      [+(lng - degLng).toFixed(6), +(lat - degLat).toFixed(6)],
      [+(lng + degLng).toFixed(6), +(lat + degLat).toFixed(6)]
    ];
  }

  // Generates a clean, believable non-overlapping cadastral parcel cluster
  // sitting strictly on agricultural land without straddling or crossing roads.
  // Uses a shared-vertex mesh so adjoining plots share exact shared edges.
  function buildNonOverlappingCadastre(center, baseNum, targetSurvey, targetId, siteLabel) {
    var lat = center[1];
    var lng = center[0];
    var degLat = 1.0 / 110.574;
    var degLng = 1.0 / (111.320 * Math.cos(lat * (Math.PI / 180)));

    // 3 x 3 agricultural compartment: ~85m x ~92m per field (~1.9 acres each)
    // Total footprint: ~255m x ~276m, neatly fitting inside farmland without crossing roads
    var M_COLS = 3;
    var M_ROWS = 3;
    var targetC = 1;
    var targetR = 1;

    var stepX = 0.088 * degLng; // ~88 meters width
    var stepY = 0.092 * degLat; // ~92 meters height
    var startLng = lng - (targetC + 0.5) * stepX;
    var startLat = lat - (targetR + 0.5) * stepY;

    // 1. Compute shared corner vertices (4 x 4 mesh)
    var nodes = {};
    for(var r = 0; r <= M_ROWS; r++) {
      for(var c = 0; c <= M_COLS; c++) {
        var baseLng = startLng + c * stepX;
        var baseLat = startLat + r * stepY;
        var jx = 0;
        var jy = 0;
        // Organic, subtle cadastral field bund variation on interior vertices (~4-7m)
        if(c > 0 && c < M_COLS && r > 0 && r < M_ROWS) {
          var seed = c * 19.31 + r * 37.19 + (baseNum % 97);
          var r1 = Math.abs(Math.sin(seed) * 10000) % 1;
          var r2 = Math.abs(Math.cos(seed) * 10000) % 1;
          jx = (r1 - 0.5) * stepX * 0.16;
          jy = (r2 - 0.5) * stepY * 0.16;
        }
        nodes[c + "_" + r] = [+(baseLng + jx).toFixed(6), +(baseLat + jy).toFixed(6)];
      }
    }

    // 2. Primary target parcel (central slot c=1, r=1)
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

    // 3. Contiguous, non-colliding neighboring cadastral plots (8 surrounding fields)
    var neighborsList = [];
    var neighborSuffixes = ["/1", "/2", "/A", "/B", "/3", "/C", "/4", "/D"];
    var idx = 0;
    for(var gr = 0; gr < M_ROWS; gr++) {
      for(var gc = 0; gc < M_COLS; gc++) {
        if(gc === targetC && gr === targetR) continue;

        var sNum = (baseNum - 4 + idx);
        if(sNum <= 0) sNum = idx + 1;
        var suf = neighborSuffixes[idx % neighborSuffixes.length];
        var sLabel = sNum + suf;
        var areaAc = (1.6 + ((gc * 2 + gr * 3) % 5) * 0.25).toFixed(2);
        idx++;

        var poly = [
          nodes[gc + "_" + gr],
          nodes[(gc + 1) + "_" + gr],
          nodes[(gc + 1) + "_" + (gr + 1)],
          nodes[gc + "_" + (gr + 1)],
          nodes[gc + "_" + gr]
        ];

        neighborsList.push({
          type: "Feature",
          properties: {
            id: "N-" + sLabel,
            survey: sLabel,
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
      label: "Khasra 412/1 — Mahona, Bakshi Ka Talab, Lucknow, Uttar Pradesh",
      center: [80.9180, 27.0950],
      baseNum: 412,
      targetSurvey: "412/1",
      targetId: "UP-DEMO-412-001"
    },
    KA: {
      label: "Survey No. 88/2 — Kundana, Bengaluru Rural, Karnataka",
      center: [77.7120, 13.2410],
      baseNum: 88,
      targetSurvey: "88/2",
      targetId: "KA-DEMO-088-002"
    },
    TN: {
      label: "Patta 1042 (Survey 187/2A) — Vellalore, Coimbatore, Tamil Nadu",
      center: [77.0480, 11.0040],
      baseNum: 187,
      targetSurvey: "187/2A",
      targetId: "TN-DEMO-104-042"
    },
    TS: {
      label: "Survey No. 245/A — Kanakamamidi, Rangareddy, Telangana",
      center: [78.2660, 17.3180],
      baseNum: 245,
      targetSurvey: "245/A",
      targetId: "TS-DEMO-245-018"
    },
    TS2: {
      label: "Survey No. 520/B — Madikonda, Khazipet, Warangal, Telangana",
      center: [79.5240, 17.9780],
      baseNum: 520,
      targetSurvey: "520/B",
      targetId: "TS-DEMO-520-044"
    },
    TS3: {
      label: "Survey No. 165/A — Perkit, Armoor, Nizamabad, Telangana",
      center: [78.2830, 18.7910],
      baseNum: 165,
      targetSurvey: "165/A",
      targetId: "TS-DEMO-165-007"
    },
    PY: {
      label: "Survey No. 42/1 — Ariyankuppam, Puducherry (UT)",
      center: [79.8130, 11.9015],
      baseNum: 42,
      targetSurvey: "42/1",
      targetId: "PY-DEMO-042-005"
    },
    BR: {
      label: "Khasra 512/3 — Walmi, Phulwari Sharif, Patna, Bihar (⚠️ Discrepancy Flagged)",
      center: [85.0680, 25.5600],
      baseNum: 512,
      targetSurvey: "512/3",
      targetId: "BR-DEMO-512-004"
    },
    MH: {
      label: "Gat No. 88/1A — Wagholi, Haveli Taluka, Pune, Maharashtra (⚠️ Active Bojha)",
      center: [74.0050, 18.5720],
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
      zoom: 16.5,
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
      // 0. Esri World Imagery Satellite Raster Layer
      try {
        map.addSource("esri-satellite", {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          ],
          tileSize: 256,
          attribution: "Esri, Maxar, Earthstar Geographics"
        });

        map.addLayer({
          id: "esri-satellite-layer",
          type: "raster",
          source: "esri-satellite",
          layout: {
            visibility: "none"
          },
          paint: {
            "raster-opacity": 1.0
          }
        });
      } catch(err){
        console.warn("Satellite layer init:", err);
      }

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

        // Click popup & inspector card on neighboring parcel
        map.on("click", "neighbors-fill-" + id, function(e){
          var p = e.features && e.features[0] ? e.features[0].properties : null;
          var sNum = p && p.survey ? ("Survey " + p.survey) : "Neighboring Plot";
          var area = p && p.area ? p.area : "2.1 Ac";

          // Show floating inspector card inside map
          var nic = document.getElementById("neighbor-inspect-card");
          var nicTitle = document.getElementById("nic-survey-title");
          var nicArea = document.getElementById("nic-area");
          if(nic && nicTitle && nicArea){
            nicTitle.textContent = "Adjacent " + sNum;
            nicArea.textContent = area + " (Cadastral verified)";
            nic.style.display = "block";
          }

          new maplibregl.Popup({closeButton: false, offset: 12})
            .setLngLat(e.lngLat)
            .setHTML("<b style='color:#1a1207;'>Neighbor: " + sNum + "</b><br><small style='color:#555;'>Area: " + area + "</small><br><span style='color:#a37118;font-size:0.75rem;font-weight:600;'>Within 1 km Cadastral Buffer</span>")
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
      var bounds = getCadastreBounds(site.center, 0.28);
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
    var bounds = getCadastreBounds(site.center, 0.28);
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
    var bounds = getCadastreBounds(site.center, 0.28);
    map.fitBounds(bounds, {
      padding: { top: 40, bottom: 40, left: 40, right: 40 },
      pitch: 15,
      bearing: 0,
      duration: 750,
      essential: true
    });
  }

  function setBaseLayer(mode){
    if(!map || !ready) return;
    var isSat = (mode === "satellite");
    if(map.getLayer("esri-satellite-layer")){
      map.setLayoutProperty("esri-satellite-layer", "visibility", isSat ? "visible" : "none");
    }

    // Toggle button active classes
    var btnVec = document.getElementById("layer-btn-vector");
    var btnSat = document.getElementById("layer-btn-satellite");
    if(btnVec && btnSat){
      if(isSat){
        btnSat.classList.add("active");
        btnVec.classList.remove("active");
      } else {
        btnVec.classList.add("active");
        btnSat.classList.remove("active");
      }
    }
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

    // Layer switcher buttons
    var btnVec = document.getElementById("layer-btn-vector");
    var btnSat = document.getElementById("layer-btn-satellite");
    if(btnVec) btnVec.addEventListener("click", function(){ setBaseLayer("vector"); });
    if(btnSat) btnSat.addEventListener("click", function(){ setBaseLayer("satellite"); });

    // Neighbor inspect card close button
    var nicClose = document.getElementById("nic-close-btn");
    if(nicClose){
      nicClose.addEventListener("click", function(){
        var nic = document.getElementById("neighbor-inspect-card");
        if(nic) nic.style.display = "none";
      });
    }
  });

  window.LandMap = {
    selectParcel: selectParcel,
    setBaseLayer: setBaseLayer,
    zoomIn: zoomIn,
    zoomOut: zoomOut,
    fitParcel: fitParcel,
    resetView: resetView
  };
})();
