/* ============================================================
   GIS Parcel View — MapLibre GL JS module.

   Owns everything map-related. Exposes window.LandMap so the rest
   of the app (script.js) can tell the map which parcel to show,
   without this file needing to know anything about search or the
   parcel card. Fails quietly (map section just stays empty) if the
   map can't load — e.g. no network — so the rest of the page keeps
   working either way.
============================================================ */
(function(){
  "use strict";

  var STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

  // Camera positions + a mock parcel boundary per sample record.
  // Boundaries are small illustrative rectangles around the parcel's
  // stated coordinates — not surveyed geometry.
  var SITES = {
    TN: {
      label: "Vellalore, Coimbatore — Survey No. 187/2A",
      center: [77.0432, 11.0021],
      levels: {
        india:    {center:[79.0, 22.0], zoom:3.6, pitch:0},
        state:    {center:[78.4, 11.0], zoom:6.2, pitch:0},
        district: {center:[77.05, 11.05], zoom:9.0, pitch:0},
        village:  {center:[77.0432, 11.0021], zoom:13.5, pitch:20},
        parcel:   {center:[77.0432, 11.0021], zoom:17.2, pitch:35}
      },
      parcel: rectAround(77.0432, 11.0021, 0.00045, 0.00035)
    },
    KA: {
      label: "Kundana, Bengaluru Rural — Survey No. 42/3",
      center: [77.7141, 13.2432],
      levels: {
        india:    {center:[79.0, 22.0], zoom:3.6, pitch:0},
        state:    {center:[76.6, 15.3], zoom:6.2, pitch:0},
        district: {center:[77.65, 13.3], zoom:9.0, pitch:0},
        village:  {center:[77.7141, 13.2432], zoom:13.5, pitch:20},
        parcel:   {center:[77.7141, 13.2432], zoom:17.2, pitch:35}
      },
      parcel: rectAround(77.7141, 13.2432, 0.00040, 0.00032)
    }
  };

  function rectAround(lng, lat, dLng, dLat){
    return {
      type:"Feature",
      properties:{},
      geometry:{
        type:"Polygon",
        coordinates:[[
          [lng-dLng, lat-dLat],[lng+dLng, lat-dLat],
          [lng+dLng, lat+dLat],[lng-dLng, lat+dLat],[lng-dLng, lat-dLat]
        ]]
      }
    };
  }

  var map = null;
  var currentSite = "TN";
  var currentLevel = "parcel";
  var ready = false;

  function init(){
    var container = document.getElementById("gis-map");
    if(!container || typeof maplibregl === "undefined") return;

    try{
      map = new maplibregl.Map({
        container: "gis-map",
        style: STYLE_URL,
        center: SITES.TN.levels.parcel.center,
        zoom: SITES.TN.levels.parcel.zoom,
        pitch: 30,
        attributionControl: false
      });
    }catch(e){ return; }

    map.addControl(new maplibregl.NavigationControl({showCompass:false}), "top-right");

    map.on("load", function(){
      map.addSource("parcel-tn", {type:"geojson", data: SITES.TN.parcel});
      map.addSource("parcel-ka", {type:"geojson", data: SITES.KA.parcel});

      ["tn","ka"].forEach(function(id){
        map.addLayer({
          id: "parcel-fill-" + id, type:"fill", source:"parcel-" + id,
          paint:{"fill-color":"#A8462F","fill-opacity": id === "tn" ? 0.42 : 0.0}
        });
        map.addLayer({
          id: "parcel-line-" + id, type:"line", source:"parcel-" + id,
          paint:{"line-color":"#A8462F","line-width":2}
        });
        map.on("click", "parcel-fill-" + id, function(e){
          new maplibregl.Popup({closeButton:false, offset:8})
            .setLngLat(e.lngLat)
            .setHTML("<b>" + (id === "tn" ? SITES.TN.label : SITES.KA.label) + "</b>")
            .addTo(map);
        });
      });

      ready = true;
      applyLevel(currentLevel, true);
    });
  }

  function setActiveCrumb(level){
    document.querySelectorAll("#crumb-nav button").forEach(function(btn){
      btn.classList.toggle("active", btn.dataset.level === level);
    });
  }

  function applyLevel(level, instant){
    if(!ready || !map) return;
    currentLevel = level;
    var site = SITES[currentSite];
    var target = site.levels[level] || site.levels.parcel;

    map.flyTo({
      center: target.center, zoom: target.zoom, pitch: target.pitch,
      speed: instant ? 3 : 0.9, essential: true
    });

    // only show the fill for the site currently focused
    ["tn","ka"].forEach(function(id){
      var isCurrent = id === currentSite.toLowerCase();
      if(map.getLayer("parcel-fill-" + id)){
        map.setPaintProperty("parcel-fill-" + id, "fill-opacity", isCurrent ? 0.42 : 0);
      }
    });

    var labelEl = document.getElementById("map-label");
    if(labelEl) labelEl.textContent = site.label;
    setActiveCrumb(level);
  }

  function selectParcel(abbr){
    if(!SITES[abbr]) return;
    currentSite = abbr;
    if(ready) applyLevel(currentLevel, false);
  }

  document.addEventListener("DOMContentLoaded", function(){
    init();

    document.querySelectorAll("#crumb-nav button").forEach(function(btn){
      btn.addEventListener("click", function(){
        applyLevel(btn.dataset.level, false);
      });
    });
  });

  window.LandMap = { selectParcel: selectParcel };
})();
