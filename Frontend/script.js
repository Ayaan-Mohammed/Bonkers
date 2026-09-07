(function(){
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     1. HERO MOSAIC — a field of cadastral parcels that settles
        once into a stylized (not geographically precise) outline
        suggestive of India. One orchestrated reveal, not per-card
        fades scattered through the page.
  ============================================================ */
  function buildMosaic(){
    var host = document.getElementById("mosaic");
    if(!host) return;

    var w = 900, h = 620;
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("preserveAspectRatio", "xMaxYMid slice");
    svg.style.width = "100%";
    svg.style.height = "100%";

    // A simplified, stylized silhouette — illustrative, not to scale.
    var outline = "M470,40 L560,55 L610,110 L640,180 L660,250 L630,300 L650,360 " +
                  "L600,420 L560,470 L520,560 L480,600 L455,540 L430,470 L400,430 " +
                  "L360,460 L330,420 L340,360 L300,330 L310,270 L280,230 L300,170 " +
                  "L350,150 L360,100 L410,70 Z";

    var clip = document.createElementNS(svgNS, "clipPath");
    clip.setAttribute("id", "mosaicClip");
    var clipPath = document.createElementNS(svgNS, "path");
    clipPath.setAttribute("d", outline);
    clip.appendChild(clipPath);

    var defs = document.createElementNS(svgNS, "defs");
    defs.appendChild(clip);
    svg.appendChild(defs);

    var group = document.createElementNS(svgNS, "g");
    group.setAttribute("clip-path", "url(#mosaicClip)");
    svg.appendChild(group);

    // faint outline stroke so the shape reads even where parcels are sparse
    var outlineStroke = document.createElementNS(svgNS, "path");
    outlineStroke.setAttribute("d", outline);
    outlineStroke.setAttribute("fill", "none");
    outlineStroke.setAttribute("stroke", "rgba(242,230,208,0.22)");
    outlineStroke.setAttribute("stroke-width", "1");
    svg.appendChild(outlineStroke);

    // irregular parcel grid — jittered quadrilaterals
    var cell = 34, cols = Math.ceil(w/cell)+1, rows = Math.ceil(h/cell)+1;
    var seed = 7;
    function rand(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

    var cx = w/2, cy = h/2;
    var parcels = [];

    for(var r=0; r<rows; r++){
      for(var c=0; c<cols; c++){
        var x0 = c*cell + (rand()-0.5)*10;
        var y0 = r*cell + (rand()-0.5)*10;
        var jw = cell - 3 + (rand()-0.5)*6;
        var jh = cell - 3 + (rand()-0.5)*6;
        var rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", x0);
        rect.setAttribute("y", y0);
        rect.setAttribute("width", Math.max(6,jw));
        rect.setAttribute("height", Math.max(6,jh));
        var isSurvey = rand() > 0.86;
        rect.setAttribute("fill", isSurvey ? "rgba(184,155,114,0.30)" : "rgba(242,230,208,0.055)");
        rect.setAttribute("stroke", "rgba(242,230,208,0.16)");
        rect.setAttribute("stroke-width", "0.6");
        group.appendChild(rect);

        var dist = Math.hypot(x0-cx, y0-cy);
        parcels.push({el: rect, dist: dist, x0:x0, y0:y0});
      }
    }

    // a handful of "data nodes" — small marks, not glowing dots
    for(var n=0; n<9; n++){
      var nx = 320 + rand()*300, ny = 100 + rand()*430;
      var node = document.createElementNS(svgNS, "circle");
      node.setAttribute("cx", nx); node.setAttribute("cy", ny); node.setAttribute("r", 2.4);
      node.setAttribute("fill", "#B89B72");
      node.setAttribute("opacity", "0.85");
      group.appendChild(node);
    }

    host.appendChild(svg);

    if(reduceMotion) return;

    // settle animation: parcels start slightly scattered/rotated,
    // ease into place, ordered outward from center (one orchestrated pass)
    parcels.sort(function(a,b){ return a.dist - b.dist; });
    var maxDist = parcels.length ? parcels[parcels.length-1].dist : 1;

    parcels.forEach(function(p){
      var delay = (p.dist / maxDist) * 700;
      p.el.style.transformOrigin = (p.x0+8) + "px " + (p.y0+8) + "px";
      p.el.style.transform = "translateY(-14px) rotate(6deg)";
      p.el.style.opacity = "0";
      p.el.style.transition = "transform 0.7s cubic-bezier(.2,.7,.3,1) " + delay + "ms, opacity 0.6s ease " + delay + "ms";
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          p.el.style.transform = "translateY(0) rotate(0deg)";
          p.el.style.opacity = "1";
        });
      });
    });
  }

  /* ============================================================
     2. MOCK PARCEL DATA
  ============================================================ */
  var PARCELS = {
    "TN04-0021-0087-00456": {
      ulpin: "TN04-0021-0087-00456",
      survey: "187/2A",
      state: "Tamil Nadu", district: "Coimbatore", mandal: "Sulur Taluk", village: "Vellalore",
      area: "0.86 ha (2.13 acres)", type: "Agricultural — irrigated",
      zoning: "Rural / agricultural zone", coords: "11.0021° N, 77.0432° E",
      holder: "K. Meenakshi Sundaram", ownership: "Presumptive record of rights",
      ror: "Patta issued, 2011", mutation: "No pending mutation",
      encumbrance: "None recorded", tax: "Paid to date (FY 2025–26)", valuation: "Guideline value ₹18.2L / acre",
      status: "Record consistent",
      history: [
        {date:"2024-11-02", title:"Property tax paid", desc:"Annual tax cleared for FY 2024–25 at the Sulur taluk office."},
        {date:"2022-06-14", title:"Boundary re-survey", desc:"Cadastral boundary re-verified against drone survey under SVAMITVA."},
        {date:"2011-03-30", title:"Patta issued", desc:"Record of rights formally issued to current recorded holder."}
      ]
    },
    "KA09-0114-0033-00921": {
      ulpin: "KA09-0114-0033-00921",
      survey: "42/3", state: "Karnataka", district: "Bengaluru Rural", mandal: "Devanahalli Taluk", village: "Kundana",
      area: "0.32 ha (0.79 acres)", type: "Residential — vacant plot",
      zoning: "Urban residential (CDP)", coords: "13.2432° N, 77.7141° E",
      holder: "R. Prashanth Rao", ownership: "Presumptive record of rights",
      ror: "RTC updated, 2023", mutation: "Mutation pending — sale deed dated 2024-08-12",
      encumbrance: "Bank charge registered — HDFC Ltd.", tax: "Due — last paid FY 2023–24", valuation: "Guideline value ₹4,600 / sq ft",
      status: "Flagged — 2 items need review",
      history: [
        {date:"2024-08-12", title:"Sale deed registered", desc:"Ownership transfer registered; mutation to new holder still pending at the taluk office."},
        {date:"2021-01-20", title:"Bank encumbrance added", desc:"Charge registered against the parcel for a housing loan."},
        {date:"2016-09-05", title:"RTC first digitised", desc:"Record of rights, tenancy and crops entry digitised under DILRMP."}
      ]
    }
  };

  var CHECKS = [
    {name:"Boundary verification", desc:"Cadastral boundary matched against the latest survey.", ok:{TN:"ok",KA:"ok"}},
    {name:"Record vs. map", desc:"Record of rights area compared against mapped parcel area.", ok:{TN:"ok",KA:"warn"}},
    {name:"Land-use consistency", desc:"Recorded land use checked against zoning and current imagery.", ok:{TN:"ok",KA:"ok"}},
    {name:"Ownership verification", desc:"Recorded holder cross-checked against registration filings.", ok:{TN:"ok",KA:"warn"}},
    {name:"Duplicate record check", desc:"Parcel checked against neighbouring ULPINs for overlap.", ok:{TN:"ok",KA:"ok"}},
    {name:"Land-change detection", desc:"Compared against the last two available survey cycles.", ok:{TN:"ok",KA:"ok"}},
    {name:"Encumbrance check", desc:"Cross-checked against registered charges and mortgages.", ok:{TN:"ok",KA:"crit"}}
  ];

  var STAMP_LABEL = {ok:"Verified", warn:"Attention", crit:"Critical"};

  var ASSESSMENT_ROWS = ["Ownership","GIS boundary","Registration","Tax","Encumbrance","Mutation","Record consistency"];

  /* ============================================================
     3. RENDER: parcel card
  ============================================================ */
  function stateAbbr(stateName){ return stateName === "Tamil Nadu" ? "TN" : "KA"; }

  function renderParcel(p){
    var section = document.getElementById("search");
    var card = document.getElementById("parcel-card");
    var abbr = stateAbbr(p.state);
    var flagged = p.status.indexOf("Flagged") === 0;

    card.innerHTML =
      '<div class="pc-top">' +
        '<div><div class="pc-ulpin">' + p.ulpin + ' &middot; Survey No. ' + p.survey + '</div>' +
          '<h3 class="pc-title">' + p.village + ', ' + p.district + '</h3></div>' +
        '<span class="pc-status">' + p.status + '</span>' +
      '</div>' +
      '<p class="pc-breadcrumb"><b>India</b><span>&rsaquo;</span><b>' + p.state + '</b><span>&rsaquo;</span><b>' + p.district + '</b><span>&rsaquo;</span><b>' + p.village + '</b><span>&rsaquo;</span>Parcel ' + p.survey + '</p>' +
      '<dl class="pc-grid">' +
        field("State", p.state) + field("District", p.district) + field("Mandal / Taluk", p.mandal) +
        field("Village", p.village) + field("Area", p.area) + field("Land type", p.type) +
        field("Zoning", p.zoning) + field("Coordinates", p.coords, true) + field("Recorded holder", p.holder) +
        field("Ownership status", p.ownership) + field("Record of rights", p.ror) + field("Mutation status", p.mutation) +
        field("Encumbrance", p.encumbrance) + field("Property tax", p.tax) + field("Land valuation", p.valuation) +
      '</dl>' +
      '<div class="gis-strip">' +
        '<div class="gis-swatch">' + gisSwatch() + '</div>' +
        '<span class="gis-crumb">GIS view — <b>parcel ' + p.survey + '</b> highlighted within ' + p.village + '</span>' +
      '</div>';

    section.style.display = "block";
    section.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"});

    renderChecks(abbr);
    renderAssessment(abbr, flagged);
    renderPassport(p);
    window.__currentParcel = p;
    if(window.LandMap) window.LandMap.selectParcel(abbr);
  }

  function field(label, value, mono){
    return '<div class="pc-field' + (mono?' mono':'') + '"><dt>' + label + '</dt><dd>' + value + '</dd></div>';
  }

  function gisSwatch(){
    return '<svg viewBox="0 0 80 56">' +
      '<rect width="80" height="56" fill="#F2E6D0"/>' +
      '<g stroke="#D8C3A5" stroke-width="0.6" fill="none">' +
      '<line x1="0" y1="14" x2="80" y2="14"/><line x1="0" y1="28" x2="80" y2="28"/><line x1="0" y1="42" x2="80" y2="42"/>' +
      '<line x1="20" y1="0" x2="20" y2="56"/><line x1="40" y1="0" x2="40" y2="56"/><line x1="60" y1="0" x2="60" y2="56"/>' +
      '</g>' +
      '<rect x="40" y="14" width="20" height="14" fill="rgba(165,92,58,0.35)" stroke="#A55C3A" stroke-width="1"/>' +
      '</svg>';
  }

  /* ============================================================
     4. RENDER: verification stamps (single orchestrated reveal
        via IntersectionObserver — not scattered per-scroll effects)
  ============================================================ */
  function renderChecks(abbr){
    var grid = document.getElementById("stamp-grid");
    grid.innerHTML = "";
    CHECKS.forEach(function(chk){
      var state = chk.ok[abbr] || "ok";
      var div = document.createElement("div");
      div.className = "stamp-item";
      div.innerHTML = '<h4>' + chk.name + '</h4><p>' + chk.desc + '</p>' +
        '<span class="stamp-mark ' + state + '">' + STAMP_LABEL[state] +
        (state==="ok" ? " &#10003;" : state==="warn" ? " &#9888;" : " !") + '</span>';
      grid.appendChild(div);
    });
    observeStamps();
  }

  function observeStamps(){
    var items = document.querySelectorAll(".stamp-item");
    if(reduceMotion || !("IntersectionObserver" in window)){
      items.forEach(function(el){ el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry, i){
        if(entry.isIntersecting){
          var idx = Array.prototype.indexOf.call(items, entry.target);
          setTimeout(function(){ entry.target.classList.add("in"); }, idx * 70);
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.25});
    items.forEach(function(el){ io.observe(el); });
  }

  /* ============================================================
     5. RENDER: assessment tally (replaces a generic gauge with a
        ledger-style stamped score + itemised breakdown)
  ============================================================ */
  function renderAssessment(abbr, flagged){
    var score = flagged ? 78 : 96;
    document.getElementById("score-num").textContent = score;
    var list = document.getElementById("assessment-list");
    list.innerHTML = "";
    ASSESSMENT_ROWS.forEach(function(row){
      var val = "Clear";
      if(flagged && (row === "Mutation" || row === "Encumbrance")) val = "Review";
      var li = document.createElement("li");
      li.innerHTML = '<b>' + row + '</b><span>' + val + '</span>';
      list.appendChild(li);
    });
  }

  /* ============================================================
     6. RENDER: digital land passport timeline
  ============================================================ */
  function renderPassport(p){
    var book = document.getElementById("passport-book");
    var rows = p.history.map(function(h){
      return '<div class="tl-item"><div class="tl-date">' + h.date + '</div>' +
        '<div class="tl-title">' + h.title + '</div><p class="tl-desc">' + h.desc + '</p></div>';
    }).join("");
    book.innerHTML =
      '<div class="passport-id">' +
        '<div><h4>Digital Land Passport</h4><div class="pid-code">' + p.ulpin + '</div></div>' +
        '<span class="pid-seal">Status snapshot — not a title deed</span>' +
      '</div>' +
      '<div class="passport-timeline">' + rows + '</div>';
  }

  /* ============================================================
     7. REPORT GENERATION — printable sheet + placeholder QR
  ============================================================ */
  function openReport(){
    var p = window.__currentParcel;
    if(!p){
      alert("Search for a parcel first, then generate its report.");
      return;
    }
    var reportNo = "SR-" + p.ulpin.replace(/-/g,"").slice(-8) + "-" + new Date().getFullYear();
    var genDate = new Date().toISOString().slice(0,10);

    var sheet = document.getElementById("report-sheet");
    sheet.innerHTML =
      '<button class="report-close" id="report-close" aria-label="Close report">&times;</button>' +
      '<div class="report-head"><h3>Digital Parcel Status Report</h3>' +
        '<div class="report-meta">Report No. ' + reportNo + '<br>Generated ' + genDate + '</div></div>' +
      '<div class="report-body"><dl>' +
        rfield("ULPIN", p.ulpin) + rfield("Survey number", p.survey) +
        rfield("Location", p.village + ", " + p.district + ", " + p.state) + rfield("Area", p.area) +
        rfield("Recorded holder", p.holder) + rfield("Land use / zoning", p.zoning) +
        rfield("Encumbrance status", p.encumbrance) + rfield("Record vs. map", "Matched") +
        rfield("Detected issues", p.status.indexOf("Flagged")===0 ? "2 items pending review" : "None") +
        rfield("Overall status", p.status) +
      '</dl></div>' +
      '<div class="report-foot">' +
        '<p class="report-disclaimer">This is a status snapshot for the date shown above, not a legal certificate of ownership. Scan the code to view the latest available status for this parcel.</p>' +
        '<div class="qr-box"><canvas id="qr-canvas" width="88" height="88"></canvas></div>' +
      '</div>' +
      '<button class="print-btn" id="print-btn">Print / save as PDF</button>';

    document.getElementById("report-overlay").classList.add("show");
    drawPseudoQR(document.getElementById("qr-canvas"), "/verify/" + p.ulpin);
    document.getElementById("report-close").addEventListener("click", closeReport);
    document.getElementById("print-btn").addEventListener("click", function(){ window.print(); });
  }

  function rfield(label, value){
    return '<div><dt>' + label + '</dt><dd>' + value + '</dd></div>';
  }

  function closeReport(){
    document.getElementById("report-overlay").classList.remove("show");
  }

  // Deterministic pseudo-QR: a stylized, verification-coded grid —
  // illustrative only, not a scannable/standard QR symbol.
  function drawPseudoQR(canvas, text){
    var ctx = canvas.getContext("2d");
    var size = 11, px = canvas.width / size;
    var seed = 0;
    for(var i=0;i<text.length;i++){ seed = (seed * 31 + text.charCodeAt(i)) % 100000; }
    function rand(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

    ctx.fillStyle = "#FAF1E2"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#30271F";
    for(var r=0;r<size;r++){
      for(var c=0;c<size;c++){
        var isCorner = (r<3 && c<3) || (r<3 && c>size-4) || (r>size-4 && c<3);
        if(isCorner){
          if(r===0||r===2||c===0||c===2||(r<3&&c<3)) {
            if((r===0||r===2||c===0||c===2)) ctx.fillRect(c*px, r*px, px, px);
          }
          continue;
        }
        if(rand() > 0.55) ctx.fillRect(c*px, r*px, px, px);
      }
    }
  }

  /* ============================================================
     8. WIRING
  ============================================================ */
  document.addEventListener("DOMContentLoaded", function(){
    buildMosaic();

    document.getElementById("search-form").addEventListener("submit", function(e){
      e.preventDefault();
      doSearch(document.getElementById("ulpin-input").value.trim());
    });

    document.querySelectorAll(".try-btn").forEach(function(btn){
      btn.addEventListener("click", function(){
        document.getElementById("ulpin-input").value = btn.dataset.sample;
        doSearch(btn.dataset.sample);
      });
    });

    document.getElementById("report-btn").addEventListener("click", openReport);
    document.getElementById("report-overlay").addEventListener("click", function(e){
      if(e.target === this) closeReport();
    });
  });

  function doSearch(query){
    var key = Object.keys(PARCELS).find(function(k){
      return k.toLowerCase() === query.toLowerCase() ||
             PARCELS[k].survey.toLowerCase() === query.toLowerCase();
    });
    if(!key){
      // fall back to first sample so the demo always shows something meaningful
      key = Object.keys(PARCELS)[0];
    }
    renderParcel(PARCELS[key]);
  }

})();
