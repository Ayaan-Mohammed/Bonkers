(function(){
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     1. LAND BACKGROUND PARALLAX
     Very subtle, dampened mouse parallax for the full-screen
     decorative Indian agricultural land background.
  ============================================================ */
  function initLandBackground(){
    var bgImage = document.getElementById("land-bg-image");
    if(!bgImage) return;

    if(reduceMotion) return;

    var targetX = 0, targetY = 0;
    var currentX = 0, currentY = 0;
    var isTicking = false;

    // Movement is kept very subtle (±14px X, ±9px Y)
    var maxShiftX = 14;
    var maxShiftY = 9;

    function renderParallax(){
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      var moveX = (currentX * maxShiftX).toFixed(2);
      var moveY = (currentY * maxShiftY).toFixed(2);

      bgImage.style.transform = "translate3d(" + (-moveX) + "px, " + (-moveY) + "px, 0) scale(1.04)";

      if(Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001){
        requestAnimationFrame(renderParallax);
      } else {
        isTicking = false;
      }
    }

    function onPointerMove(e){
      targetX = ((e.clientX / window.innerWidth) - 0.5) * 2;
      targetY = ((e.clientY / window.innerHeight) - 0.5) * 2;

      if(targetX > 1) targetX = 1; else if(targetX < -1) targetX = -1;
      if(targetY > 1) targetY = 1; else if(targetY < -1) targetY = -1;

      if(!isTicking){
        isTicking = true;
        requestAnimationFrame(renderParallax);
      }
    }

    function onPointerLeave(){
      targetX = 0;
      targetY = 0;
      if(!isTicking){
        isTicking = true;
        requestAnimationFrame(renderParallax);
      }
    }

    window.addEventListener("pointermove", onPointerMove, {passive: true});
    document.addEventListener("mouseleave", onPointerLeave, {passive: true});
  }

  /* ============================================================
     2. 28 INDIAN STATES & 8 UNION TERRITORIES (Full Coverage)
  ============================================================ */
  var STATES_AND_UTS = [
    { name: "Andhra Pradesh", type: "State" },
    { name: "Arunachal Pradesh", type: "State" },
    { name: "Assam", type: "State" },
    { name: "Bihar", type: "State" },
    { name: "Chhattisgarh", type: "State" },
    { name: "Goa", type: "State" },
    { name: "Gujarat", type: "State" },
    { name: "Haryana", type: "State" },
    { name: "Himachal Pradesh", type: "State" },
    { name: "Jharkhand", type: "State" },
    { name: "Karnataka", type: "State" },
    { name: "Kerala", type: "State" },
    { name: "Madhya Pradesh", type: "State" },
    { name: "Maharashtra", type: "State" },
    { name: "Manipur", type: "State" },
    { name: "Meghalaya", type: "State" },
    { name: "Mizoram", type: "State" },
    { name: "Nagaland", type: "State" },
    { name: "Odisha", type: "State" },
    { name: "Punjab", type: "State" },
    { name: "Rajasthan", type: "State" },
    { name: "Sikkim", type: "State" },
    { name: "Tamil Nadu", type: "State" },
    { name: "Telangana", type: "State" },
    { name: "Tripura", type: "State" },
    { name: "Uttar Pradesh", type: "State" },
    { name: "Uttarakhand", type: "State" },
    { name: "West Bengal", type: "State" },
    { name: "Andaman and Nicobar Islands", type: "Union Territory" },
    { name: "Chandigarh", type: "Union Territory" },
    { name: "Dadra and Nagar Haveli and Daman and Diu", type: "Union Territory" },
    { name: "Delhi", type: "NCT" },
    { name: "Jammu and Kashmir", type: "Union Territory" },
    { name: "Ladakh", type: "Union Territory" },
    { name: "Lakshadweep", type: "Union Territory" },
    { name: "Puducherry", type: "Union Territory" }
  ];

  /* ============================================================
     3. PREDEFINED DEMO DATASET (Illustrative Prototype Data)
  ============================================================ */
  var PARCELS = {
    "UP": {
      ulpin: "UP-DEMO-412-001",
      survey: "412/1",
      state: "Uttar Pradesh",
      district: "Demo District (Lucknow)",
      mandal: "Bakshi Ka Talab",
      village: "Mahona",
      area: "2.48 Acres (1.00 ha)",
      type: "Agricultural — Irrigated",
      zoning: "Rural / Agricultural Zone",
      coords: "26.8467° N, 80.9462° E",
      holder: "Ramesh Chandra Verma",
      ownership: "Presumptive record of rights",
      ror: "Khatauni verified (1428–1433 Fasli)",
      mutation: "Mutation cleared (Order dated 2023-04-12)",
      encumbrance: "None recorded — Clean title",
      tax: "Paid to date (FY 2025–26)",
      valuation: "Guideline value ₹14.5L / acre",
      status: "✓ Verified — Consistent",
      history: [
        {date:"2025-01-15", title:"Annual land revenue tax paid", desc:"Electronic challan cleared via UP Bhulekh portal."},
        {date:"2023-04-12", title:"Inheritance mutation entered", desc:"Record of rights updated following succession order at taluk revenue court."},
        {date:"2018-11-20", title:"Digital cadastral boundary synced", desc:"Re-verified under DILRMP spatial cadastral digitisation initiative."}
      ]
    },
    "KA": {
      ulpin: "KA-DEMO-088-002",
      survey: "88/2",
      state: "Karnataka",
      district: "Bengaluru Rural",
      mandal: "Devanahalli Taluk",
      village: "Kundana",
      area: "1.85 Acres (0.75 ha)",
      type: "Agricultural — Dry crop",
      zoning: "Rural Agricultural Zone",
      coords: "13.2432° N, 77.7141° E",
      holder: "R. Prashanth Rao",
      ownership: "Presumptive record of rights",
      ror: "Bhoomi RTC updated (2024)",
      mutation: "Cleared — sale deed dated 2022-08-12",
      encumbrance: "None recorded (NOC issued by SBI)",
      tax: "Paid (FY 2024–25)",
      valuation: "Guideline value ₹32L / acre",
      status: "✓ Verified — Consistent",
      history: [
        {date:"2024-08-12", title:"RTC re-verification", desc:"Digital Bhoomi record cross-referenced with Kaveri registration database."},
        {date:"2022-08-12", title:"Sale deed registered", desc:"Registered transfer of rights completed at Devanahalli sub-registrar office."},
        {date:"2016-09-05", title:"RTC digitised", desc:"Record of rights, tenancy and crops entry digitised under DILRMP."}
      ]
    },
    "TN": {
      ulpin: "TN-DEMO-104-042",
      survey: "187/2A",
      state: "Tamil Nadu",
      district: "Coimbatore",
      mandal: "Sulur Taluk",
      village: "Vellalore",
      area: "2.13 Acres (0.86 ha)",
      type: "Agricultural — Irrigated",
      zoning: "Rural / Agricultural Zone",
      coords: "11.0021° N, 77.0432° E",
      holder: "K. Meenakshi Sundaram",
      ownership: "Presumptive record of rights",
      ror: "Anyam Patta No. 1042 issued",
      mutation: "No pending mutation",
      encumbrance: "None recorded",
      tax: "Paid to date (FY 2025–26)",
      valuation: "Guideline value ₹18.2L / acre",
      status: "✓ Verified — Consistent",
      history: [
        {date:"2024-11-02", title:"Property tax paid", desc:"Annual tax cleared for FY 2024–25 at the Sulur taluk office."},
        {date:"2022-06-14", title:"Boundary re-survey", desc:"Cadastral boundary re-verified against drone survey under SVAMITVA."},
        {date:"2011-03-30", title:"Patta issued", desc:"Record of rights formally issued to current recorded holder."}
      ]
    }
  };

  var CHECKS = [
    {name:"Boundary verification", desc:"Cadastral boundary matched against latest survey.", ok:{UP:"ok",TN:"ok",KA:"ok"}},
    {name:"Record vs. map", desc:"Record of rights area compared against mapped parcel area.", ok:{UP:"ok",TN:"ok",KA:"ok"}},
    {name:"Land-use consistency", desc:"Recorded land use checked against zoning classification.", ok:{UP:"ok",TN:"ok",KA:"ok"}},
    {name:"Ownership verification", desc:"Recorded holder cross-checked against registration filings.", ok:{UP:"ok",TN:"ok",KA:"ok"}},
    {name:"Duplicate record check", desc:"Parcel checked against neighbouring ULPINs for overlap.", ok:{UP:"ok",TN:"ok",KA:"ok"}},
    {name:"Land-change detection", desc:"Compared against the last two available survey cycles.", ok:{UP:"ok",TN:"ok",KA:"ok"}},
    {name:"Encumbrance check", desc:"Cross-checked against registered charges and mortgages.", ok:{UP:"ok",TN:"ok",KA:"ok"}}
  ];

  var STAMP_LABEL = {ok:"Verified", warn:"Attention", crit:"Critical"};
  var ASSESSMENT_ROWS = ["Ownership","GIS boundary","Registration","Tax","Encumbrance","Mutation","Record consistency"];

  /* ============================================================
     4. STATE SELECTOR DROPDOWN LOGIC
  ============================================================ */
  var selectedState = "Uttar Pradesh";

  function initStateDropdown(){
    var btn = document.getElementById("state-selector-btn");
    var dropdown = document.getElementById("state-dropdown");
    var searchInput = document.getElementById("state-search-input");
    var listContainer = document.getElementById("state-list");
    var stateNameEl = document.getElementById("selected-state-name");

    if(!btn || !dropdown || !listContainer) return;

    function renderList(filter){
      listContainer.innerHTML = "";
      var query = (filter || "").toLowerCase().trim();

      var filtered = STATES_AND_UTS.filter(function(item){
        return item.name.toLowerCase().indexOf(query) !== -1;
      });

      if(filtered.length === 0){
        listContainer.innerHTML = '<div style="padding:12px 16px; font-size:0.82rem; color:#8c8172;">No matching State or UT found</div>';
        return;
      }

      filtered.forEach(function(item){
        var row = document.createElement("div");
        row.className = "state-item" + (item.name === selectedState ? " selected" : "");
        row.innerHTML = '<span>' + item.name + '</span><span class="state-type-tag">' + item.type + '</span>';

        row.addEventListener("click", function(e){
          e.stopPropagation();
          selectState(item.name);
          closeDropdown();
        });

        listContainer.appendChild(row);
      });
    }

    function selectState(name){
      selectedState = name;
      if(stateNameEl) stateNameEl.textContent = name;
      renderList(searchInput ? searchInput.value : "");
    }

    function openDropdown(){
      dropdown.style.display = "block";
      btn.setAttribute("aria-expanded", "true");
      renderList("");
      if(searchInput){
        searchInput.value = "";
        setTimeout(function(){ searchInput.focus(); }, 50);
      }
    }

    function closeDropdown(){
      dropdown.style.display = "none";
      btn.setAttribute("aria-expanded", "false");
    }

    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var isOpen = dropdown.style.display === "block";
      if(isOpen) closeDropdown();
      else openDropdown();
    });

    if(searchInput){
      searchInput.addEventListener("input", function(){
        renderList(this.value);
      });
      searchInput.addEventListener("click", function(e){
        e.stopPropagation();
      });
    }

    document.addEventListener("click", function(e){
      if(!dropdown.contains(e.target) && e.target !== btn){
        closeDropdown();
      }
    });

    window.__selectState = selectState;
  }

  /* ============================================================
     5. SEARCH DISPATCH & PARCEL SELECTION
  ============================================================ */
  function findParcelKey(query, state){
    var q = (query || "").toLowerCase();
    var s = (state || selectedState || "").toLowerCase();

    // Direct ULPIN / Khasra matching
    if(q.indexOf("412") !== -1 || q.indexOf("up") !== -1 || s.indexOf("uttar") !== -1){
      return "UP";
    }
    if(q.indexOf("88") !== -1 || q.indexOf("ka") !== -1 || s.indexOf("karnataka") !== -1){
      return "KA";
    }
    if(q.indexOf("1042") !== -1 || q.indexOf("187") !== -1 || q.indexOf("tn") !== -1 || s.indexOf("tamil") !== -1){
      return "TN";
    }

    // Fallback: cycle gracefully between UP, KA, TN
    return "UP";
  }

  function doSearch(query){
    var key = findParcelKey(query, selectedState);
    var p = PARCELS[key] || PARCELS["UP"];

    // 1. Update PARCEL FOUND banner
    var bannerDesc = document.getElementById("pf-banner-text");
    if(bannerDesc){
      bannerDesc.innerHTML = "Showing surveyed boundary for <b>" + p.ulpin + "</b> (" + p.survey + ") in " + p.state;
    }

    // 2. Update Compact Parcel Info Card
    var picUlpin = document.getElementById("pic-ulpin");
    var picArea = document.getElementById("pic-area");
    var picState = document.getElementById("pic-state");
    var picDistrict = document.getElementById("pic-district");
    var picSurvey = document.getElementById("pic-survey");

    if(picUlpin) picUlpin.textContent = p.ulpin;
    if(picArea) picArea.textContent = p.area;
    if(picState) picState.textContent = p.state;
    if(picDistrict) picDistrict.textContent = p.district;
    if(picSurvey) picSurvey.textContent = p.survey;

    // 3. Trigger Map Zoom & Boundary Highlight
    if(window.LandMap && window.LandMap.selectParcel){
      window.LandMap.selectParcel(key);
    }

    // 4. Update the deep inspection card & passport below
    renderParcelCard(p);
    renderChecks(key);
    renderAssessment(key, false);
    renderPassport(p);
    window.__currentParcel = p;

    // 5. Smoothly transition / scroll down to the GIS Map
    var gisView = document.getElementById("gis-view");
    if(gisView){
      gisView.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"});
    }
  }

  /* ============================================================
     6. DETAILED RECORD CARDS & VERIFICATION
  ============================================================ */
  function renderParcelCard(p){
    var section = document.getElementById("search");
    var card = document.getElementById("parcel-card");
    if(!section || !card) return;

    card.innerHTML =
      '<div class="pc-top">' +
        '<div><div class="pc-ulpin">' + p.ulpin + ' &middot; Survey / Khasra ' + p.survey + '</div>' +
          '<h3 class="pc-title">' + p.village + ', ' + p.district + '</h3></div>' +
        '<span class="pc-status">' + p.status + '</span>' +
      '</div>' +
      '<p class="pc-breadcrumb"><b>India</b><span>&rsaquo;</span><b>' + p.state + '</b><span>&rsaquo;</span><b>' + p.district + '</b><span>&rsaquo;</span><b>' + p.village + '</b><span>&rsaquo;</span>Plot ' + p.survey + '</p>' +
      '<dl class="pc-grid">' +
        field("State", p.state) + field("District", p.district) + field("Mandal / Taluk", p.mandal) +
        field("Village", p.village) + field("Area", p.area) + field("Land type", p.type) +
        field("Zoning", p.zoning) + field("Coordinates", p.coords, true) + field("Recorded holder", p.holder) +
        field("Ownership status", p.ownership) + field("Record of rights", p.ror) + field("Mutation status", p.mutation) +
        field("Encumbrance", p.encumbrance) + field("Property tax", p.tax) + field("Land valuation", p.valuation) +
      '</dl>' +
      '<div class="gis-strip">' +
        '<div class="gis-swatch">' + gisSwatch() + '</div>' +
        '<span class="gis-crumb">Cadastral boundary view — <b>parcel ' + p.survey + '</b> highlighted in ' + p.village + '</span>' +
      '</div>';

    section.style.display = "block";
  }

  function field(label, value, mono){
    return '<div class="pc-field' + (mono?' mono':'') + '"><dt>' + label + '</dt><dd>' + value + '</dd></div>';
  }

  function gisSwatch(){
    return '<svg viewBox="0 0 80 56">' +
      '<rect width="80" height="56" fill="#F3F1FB"/>' +
      '<g stroke="#DCD6F5" stroke-width="0.6" fill="none">' +
      '<line x1="0" y1="14" x2="80" y2="14"/><line x1="0" y1="28" x2="80" y2="28"/><line x1="0" y1="42" x2="80" y2="42"/>' +
      '<line x1="20" y1="0" x2="20" y2="56"/><line x1="40" y1="0" x2="40" y2="56"/><line x1="60" y1="0" x2="60" y2="56"/>' +
      '</g>' +
      '<rect x="40" y="14" width="20" height="14" fill="rgba(231,174,89,0.38)" stroke="#e7ae59" stroke-width="1.5"/>' +
      '</svg>';
  }

  function renderChecks(abbr){
    var grid = document.getElementById("stamp-grid");
    if(!grid) return;
    grid.innerHTML = "";

    CHECKS.forEach(function(c, i){
      var verdict = c.ok[abbr] || "ok";
      var el = document.createElement("div");
      el.className = "stamp-item";
      el.innerHTML =
        '<div class="stamp-mark ' + verdict + '">' +
          '<span>●</span>' + STAMP_LABEL[verdict] +
        '</div>' +
        '<h4>' + c.name + '</h4>' +
        '<p>' + c.desc + '</p>';
      grid.appendChild(el);

      setTimeout(function(){ el.classList.add("in"); }, i * 45);
    });
  }

  function renderAssessment(abbr, flagged){
    var scoreNum = document.getElementById("score-num");
    var list = document.getElementById("assessment-list");
    var seal = document.querySelector(".seal-box");
    if(!scoreNum || !list) return;

    var score = flagged ? 78 : 96;
    scoreNum.textContent = score;
    if(seal) seal.style.setProperty("--pct", score);

    list.innerHTML = "";
    ASSESSMENT_ROWS.forEach(function(name){
      var li = document.createElement("li");
      li.innerHTML = "<b>" + name + "</b><span>Verified ✓</span>";
      list.appendChild(li);
    });
  }

  function renderPassport(p){
    var book = document.getElementById("passport-book");
    if(!book) return;

    var timelineHtml = "";
    (p.history || []).forEach(function(h){
      timelineHtml +=
        '<div class="tl-item">' +
          '<span class="tl-date">' + h.date + '</span>' +
          '<h5 class="tl-title">' + h.title + '</h5>' +
          '<p class="tl-desc">' + h.desc + '</p>' +
        '</div>';
    });

    book.innerHTML =
      '<div class="passport-id">' +
        '<div>' +
          '<h4>Digital Land Passport</h4>' +
          '<div class="pid-code">' + p.ulpin + '</div>' +
        '</div>' +
        '<div class="pid-seal">Presumptive Title Record</div>' +
      '</div>' +
      '<div class="passport-timeline">' +
        timelineHtml +
      '</div>';
  }

  /* ============================================================
     7. REPORT MODAL
  ============================================================ */
  function openReport(){
    var p = window.__currentParcel || PARCELS["UP"];
    var sheet = document.getElementById("report-sheet");
    var overlay = document.getElementById("report-overlay");
    if(!sheet || !overlay) return;

    var today = new Date().toISOString().slice(0,10);
    sheet.innerHTML =
      '<button type="button" class="report-close" id="report-close-btn" aria-label="Close report">&times;</button>' +
      '<div class="report-head">' +
        '<div><h3>Bhu-InterOp Verification Snapshot</h3><p style="margin:4px 0 0;font-size:0.82rem;color:#777;">Prototype Demonstration Record</p></div>' +
        '<div class="report-meta"><b>' + p.ulpin + '</b><br>Generated: ' + today + '</div>' +
      '</div>' +
      '<div class="report-body">' +
        '<dl>' +
          field("State", p.state) + field("District", p.district) +
          field("Survey / Khasra", p.survey) + field("Area", p.area) +
          field("Recorded Holder", p.holder) + field("Status", p.status) +
          field("Coordinates", p.coords) + field("Record of Rights", p.ror) +
        '</dl>' +
      '</div>' +
      '<div class="report-foot">' +
        '<div class="report-disclaimer">Presumptive record snapshot for demonstration purposes. Verified against state cadastral layers.</div>' +
        '<div class="qr-box"><canvas id="qr-canvas" width="64" height="64"></canvas></div>' +
      '</div>' +
      '<button type="button" class="print-btn" onclick="window.print()">Print / Save PDF</button>';

    overlay.classList.add("show");
    document.getElementById("report-close-btn").addEventListener("click", closeReport);
    drawQr("qr-canvas");
  }

  function closeReport(){
    var overlay = document.getElementById("report-overlay");
    if(overlay) overlay.classList.remove("show");
  }

  function drawQr(id){
    var canvas = document.getElementById(id);
    if(!canvas) return;
    var ctx = canvas.getContext("2d");
    var size = 16, px = 4;
    var seed = 42;
    function rand(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

    ctx.fillStyle = "#FBF8EF"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#232019";
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
     8. WIRING & INITIALIZATION
  ============================================================ */
  document.addEventListener("DOMContentLoaded", function(){
    initLandBackground();
    initStateDropdown();

    // Initial default render with UP demo parcel
    renderParcelCard(PARCELS["UP"]);
    renderChecks("UP");
    renderAssessment("UP", false);
    renderPassport(PARCELS["UP"]);
    window.__currentParcel = PARCELS["UP"];

    // Main search form submission
    var searchForm = document.getElementById("search-form");
    if(searchForm){
      searchForm.addEventListener("submit", function(e){
        e.preventDefault();
        var val = document.getElementById("ulpin-input").value.trim();
        doSearch(val);
      });
    }

    // Quick sample chips
    document.querySelectorAll(".sample-chip").forEach(function(chip){
      chip.addEventListener("click", function(){
        document.querySelectorAll(".sample-chip").forEach(function(c){ c.classList.remove("active"); });
        this.classList.add("active");

        var st = this.dataset.state;
        var q = this.dataset.query;

        if(st && window.__selectState){
          window.__selectState(st);
        }

        var input = document.getElementById("ulpin-input");
        if(input){
          input.value = q;
        }

        doSearch(q);
      });
    });

    // View Land Details button on Compact Parcel Card
    var detailsBtn = document.getElementById("pic-details-btn");
    if(detailsBtn){
      detailsBtn.addEventListener("click", function(){
        var targetSection = document.getElementById("search") || document.getElementById("passport");
        if(targetSection){
          targetSection.style.display = "block";
          targetSection.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"});
        }
      });
    }

    // Report modal trigger & backdrop close
    var reportBtn = document.getElementById("report-btn");
    if(reportBtn) reportBtn.addEventListener("click", openReport);

    var reportOverlay = document.getElementById("report-overlay");
    if(reportOverlay){
      reportOverlay.addEventListener("click", function(e){
        if(e.target === this) closeReport();
      });
    }
  });

})();
