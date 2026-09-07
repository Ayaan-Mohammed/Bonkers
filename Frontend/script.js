(function(){
  "use strict";

  var isSearchPage = !!document.getElementById("search-form");
  if(!isSearchPage) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     1. LAND BACKGROUND PARALLAX
  ============================================================ */
  function initLandBackground(){
    var bgImage = document.getElementById("land-bg-image");
    if(!bgImage || reduceMotion) return;

    var tX=0,tY=0,cX=0,cY=0,tick=false;

    function render(){
      cX+=(tX-cX)*0.04; cY+=(tY-cY)*0.04;
      bgImage.style.transform="translate3d("+(-(cX*12).toFixed(2))+"px,"+(-(cY*7).toFixed(2))+"px,0) scale(1.04)";
      if(Math.abs(tX-cX)>0.001||Math.abs(tY-cY)>0.001) requestAnimationFrame(render);
      else tick=false;
    }

    window.addEventListener("pointermove",function(e){
      tX=Math.max(-1,Math.min(1,((e.clientX/window.innerWidth)-0.5)*2));
      tY=Math.max(-1,Math.min(1,((e.clientY/window.innerHeight)-0.5)*2));
      if(!tick){tick=true;requestAnimationFrame(render);}
    },{passive:true});
    document.addEventListener("mouseleave",function(){
      tX=0;tY=0;if(!tick){tick=true;requestAnimationFrame(render);}
    },{passive:true});
  }

  /* ============================================================
     2. STATES & UTs
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
     3. DEMO DATASET
  ============================================================ */
  var PARCELS = {
    "UP": {
      ulpin: "UP-DEMO-412-001", survey: "412/1", state: "Uttar Pradesh",
      district: "Demo District (Lucknow)", mandal: "Bakshi Ka Talab", village: "Mahona",
      area: "2.48 Acres (1.00 ha)", type: "Agricultural — Irrigated",
      zoning: "Rural / Agricultural Zone", coords: "26.8467° N, 80.9462° E",
      holder: "Ramesh Chandra Verma", ownership: "Presumptive record of rights",
      ror: "Khatauni verified (1428–1433 Fasli)",
      mutation: "Mutation cleared (Order dated 2023-04-12)",
      encumbrance: "None recorded — Clean title", tax: "Paid to date (FY 2025–26)",
      valuation: "Guideline value ₹14.5L / acre", status: "✓ Verified — Consistent",
      history: [
        {date:"2025-01-15", title:"Annual land revenue tax paid", desc:"Electronic challan cleared via UP Bhulekh portal."},
        {date:"2023-04-12", title:"Inheritance mutation entered", desc:"Record of rights updated following succession order at taluk revenue court."},
        {date:"2018-11-20", title:"Digital cadastral boundary synced", desc:"Re-verified under DILRMP spatial cadastral digitisation initiative."}
      ]
    },
    "KA": {
      ulpin: "KA-DEMO-088-002", survey: "88/2", state: "Karnataka",
      district: "Bengaluru Rural", mandal: "Devanahalli Taluk", village: "Kundana",
      area: "1.85 Acres (0.75 ha)", type: "Agricultural — Dry crop",
      zoning: "Rural Agricultural Zone", coords: "13.2432° N, 77.7141° E",
      holder: "R. Prashanth Rao", ownership: "Presumptive record of rights",
      ror: "Bhoomi RTC updated (2024)",
      mutation: "Cleared — sale deed dated 2022-08-12",
      encumbrance: "None recorded (NOC issued by SBI)", tax: "Paid (FY 2024–25)",
      valuation: "Guideline value ₹32L / acre", status: "✓ Verified — Consistent",
      history: [
        {date:"2024-08-12", title:"RTC re-verification", desc:"Digital Bhoomi record cross-referenced with Kaveri registration database."},
        {date:"2022-08-12", title:"Sale deed registered", desc:"Registered transfer of rights completed at Devanahalli sub-registrar office."},
        {date:"2016-09-05", title:"RTC digitised", desc:"Record of rights, tenancy and crops entry digitised under DILRMP."}
      ]
    },
    "TN": {
      ulpin: "TN-DEMO-104-042", survey: "187/2A", state: "Tamil Nadu",
      district: "Coimbatore", mandal: "Sulur Taluk", village: "Vellalore",
      area: "2.13 Acres (0.86 ha)", type: "Agricultural — Irrigated",
      zoning: "Rural / Agricultural Zone", coords: "11.0021° N, 77.0432° E",
      holder: "K. Meenakshi Sundaram", ownership: "Presumptive record of rights",
      ror: "Anyam Patta No. 1042 issued", mutation: "No pending mutation",
      encumbrance: "None recorded", tax: "Paid to date (FY 2025–26)",
      valuation: "Guideline value ₹18.2L / acre", status: "✓ Verified — Consistent",
      history: [
        {date:"2024-11-02", title:"Property tax paid", desc:"Annual tax cleared for FY 2024–25 at the Sulur taluk office."},
        {date:"2022-06-14", title:"Boundary re-survey", desc:"Cadastral boundary re-verified against drone survey under SVAMITVA."},
        {date:"2011-03-30", title:"Patta issued", desc:"Record of rights formally issued to current recorded holder."}
      ]
    },
    "TS": {
      ulpin: "TS-DEMO-245-018", survey: "245/A", state: "Telangana",
      district: "Rangareddy", mandal: "Moinabad", village: "Kanakamamidi",
      area: "2.30 Acres (0.93 ha)", type: "Agricultural — Irrigated (Wet crop / Borewell)",
      zoning: "Rural / Agricultural Zone", coords: "17.3195° N, 78.2680° E",
      holder: "K. Venkat Reddy", ownership: "Pattadar (Presumptive record of rights)",
      ror: "Dharani e-Pattadar Passbook (Khata No. 1204)",
      mutation: "Cleared — Dharani digital registration & mutation (Order 2023-11-18)",
      encumbrance: "None recorded (Dharani EC verification cleared)", tax: "Paid to date (FY 2025–26)",
      valuation: "Guideline value ₹24.5L / acre", status: "✓ Verified — Consistent",
      score: 96,
      history: [
        {date:"2025-02-10", title:"Rythu Bandhu & revenue audit", desc:"Annual cadastral audit synced with Dharani integrated land portal."},
        {date:"2023-11-18", title:"Dharani digital mutation completed", desc:"Instant digital mutation executed post-registration at Moinabad sub-registrar office."},
        {date:"2019-06-25", title:"Pattadar passbook issued", desc:"Title deed & digital passbook generated under Telangana Land Records Updation Programme (LRUP)."}
      ]
    },
    "BR": {
      ulpin: "BR-DEMO-512-004", survey: "512/3", state: "Bihar",
      district: "Patna", mandal: "Phulwari Sharif", village: "Walmi",
      area: "1.82 Acres (0.74 ha)", type: "Agricultural — Irrigated (Riverine)",
      zoning: "Rural / Peri-Urban Zone", coords: "25.5682° N, 85.0741° E",
      holder: "Ramashish Prasad & Co-Sharers", ownership: "Presumptive title (Partition suit active)",
      ror: "Jamabandi No. 418 (Bhu-Abhilekh Bihar)",
      mutation: "⚠️ Objection filed (Dakhil-Kharij Case 142/2024)",
      encumbrance: "⚠️ Undivided ancestral claim noted", tax: "Lagann paid (FY 2024–25)",
      valuation: "Guideline value ₹19.5L / acre", status: "⚠️ Attention Required — Score: 74/100",
      statusText: "Attention — Area Variance 4.6%",
      score: 74,
      history: [
        {date:"2024-10-18", title:"Mutation objection registered", desc:"Co-sharer objection filed under Bihar Land Disputes Resolution Act at Anchal revenue office."},
        {date:"2022-04-12", title:"Special Survey DILRMP drone scan", desc:"Spatial boundary overlay measured 1.74 Acres vs. 1.82 Acres in Jamabandi (4.6% variance flagged)."},
        {date:"2015-08-04", title:"Jamabandi digitised", desc:"Legacy record entered on Bihar Bhu-Abhilekh portal under legacy khatauni."}
      ]
    },
    "MH": {
      ulpin: "MH-DEMO-712-088", survey: "88/1A", state: "Maharashtra",
      district: "Pune", mandal: "Haveli Taluka", village: "Wagholi",
      area: "2.10 Acres (0.85 ha)", type: "Agricultural — Dry crop (Gunthewari belt)",
      zoning: "Semi-Urban Agricultural Zone", coords: "18.5793° N, 73.9812° E",
      holder: "Suresh Dattatraya Patil", ownership: "Pattadar (7/12 Saat-Baara verified)",
      ror: "e-Mahabhulekh 7/12 Extract (Gat 88/1A)",
      mutation: "Ferfar No. 1204 sanctioned",
      encumbrance: "⚠️ Active Bank Bojha — SBI Loan ₹6.2L", tax: "Panchayat tax paid (FY 2024–25)",
      valuation: "Guideline value ₹42.0L / acre", status: "⚠️ Active Encumbrance — Score: 82/100",
      statusText: "Active Bank Bojha (₹6.2L)",
      score: 82,
      history: [
        {date:"2024-05-19", title:"Encumbrance registered (Bojha)", desc:"Institutional agricultural charge of ₹6,20,000 endorsed on 7/12 by State Bank of India."},
        {date:"2021-12-08", title:"Mutation (Ferfar) cleared", desc:"Partition succession updated under Haveli revenue circle."},
        {date:"2017-03-14", title:"Digital 7/12 issued", desc:"Record digitally signed under Mahabhumi modernisation program."}
      ]
    }
  };

  var TS_DISTRICTS = {
    "rangareddy": { district: "Rangareddy", mandal: "Moinabad", village: "Kanakamamidi", survey: "245/A", ulpin: "TS-DEMO-245-018", area: "2.30 Acres (0.93 ha)", coords: "17.3195° N, 78.2680° E", holder: "K. Venkat Reddy", passbook: "T2819004128" },
    "siddipet": { district: "Siddipet", mandal: "Gajwel", village: "Pragnapur", survey: "108/AA", ulpin: "TS-DEMO-108-032", area: "3.15 Acres (1.27 ha)", coords: "17.8512° N, 78.6820° E", holder: "G. Srinivas Rao", passbook: "T2822019481" },
    "medchal": { district: "Medchal-Malkajgiri", mandal: "Ghatkesar", village: "Ankushapur", survey: "312/1", ulpin: "TS-DEMO-312-009", area: "1.75 Acres (0.71 ha)", coords: "17.4470° N, 78.6835° E", holder: "B. Anjaneyulu", passbook: "T2818006742" },
    "warangal": { district: "Warangal", mandal: "Khazipet", village: "Madikonda", survey: "520/B", ulpin: "TS-DEMO-520-044", area: "2.60 Acres (1.05 ha)", coords: "17.9780° N, 79.5240° E", holder: "P. Ramachandra Murthy", passbook: "T2815003920" },
    "sangareddy": { district: "Sangareddy", mandal: "Kandi", village: "Erdnoor", survey: "174/2", ulpin: "TS-DEMO-174-015", area: "2.05 Acres (0.83 ha)", coords: "17.5820° N, 78.1180° E", holder: "M. Mallikarjun Goud", passbook: "T2824005819" },
    "nalgonda": { district: "Nalgonda", mandal: "Miryalaguda", village: "Alagadapa", survey: "402/1", ulpin: "TS-DEMO-402-027", area: "3.40 Acres (1.38 ha)", coords: "16.8710° N, 79.5620° E", holder: "V. Narsimha Rao", passbook: "T2820008432" },
    "khammam": { district: "Khammam", mandal: "Nelakondapalli", village: "Bodulabanda", survey: "89/A", ulpin: "TS-DEMO-089-011", area: "2.80 Acres (1.13 ha)", coords: "17.1850° N, 80.1240° E", holder: "T. Venkataramana", passbook: "T2817004391" },
    "karimnagar": { district: "Karimnagar", mandal: "Thimmapur", village: "Nustulapur", survey: "221/3", ulpin: "TS-DEMO-221-019", area: "2.25 Acres (0.91 ha)", coords: "18.3240° N, 79.1670° E", holder: "Ch. Raji Reddy", passbook: "T2816005120" },
    "nizamabad": { district: "Nizamabad", mandal: "Armoor", village: "Perkit", survey: "165/A", ulpin: "TS-DEMO-165-007", area: "2.90 Acres (1.17 ha)", coords: "18.7910° N, 78.2830° E", holder: "K. Satyanarayana", passbook: "T2814002984" },
    "mahabubnagar": { district: "Mahabubnagar", mandal: "Jadcherla", village: "Badepally", survey: "340/2", ulpin: "TS-DEMO-340-022", area: "3.10 Acres (1.25 ha)", coords: "16.7640° N, 78.1420° E", holder: "A. Balakrishnama Chary", passbook: "T2821006540" },
    "yadadri": { district: "Yadadri Bhuvanagiri", mandal: "Bhongir", village: "Raigiri", survey: "198/B", ulpin: "TS-DEMO-198-012", area: "2.15 Acres (0.87 ha)", coords: "17.5180° N, 78.8920° E", holder: "S. Narsing Rao", passbook: "T2823007194" },
    "suryapet": { district: "Suryapet", mandal: "Kodad", village: "Komarabanda", survey: "277/1", ulpin: "TS-DEMO-277-016", area: "2.50 Acres (1.01 ha)", coords: "16.9980° N, 79.9670° E", holder: "K. Mohan Reddy", passbook: "T2819003856" }
  };

  var CHECKS = [
    {name:"Boundary verification", desc:"Cadastral boundary matched against latest survey.", ok:{UP:"ok",TN:"ok",KA:"ok",TS:"ok",BR:"warn",MH:"ok"}},
    {name:"Record vs. map", desc:"Record of rights area compared against mapped parcel area.", ok:{UP:"ok",TN:"ok",KA:"ok",TS:"ok",BR:"warn",MH:"ok"}},
    {name:"Land-use consistency", desc:"Recorded land use checked against zoning classification.", ok:{UP:"ok",TN:"ok",KA:"ok",TS:"ok",BR:"ok",MH:"warn"}},
    {name:"Ownership verification", desc:"Recorded holder cross-checked against registration filings.", ok:{UP:"ok",TN:"ok",KA:"ok",TS:"ok",BR:"warn",MH:"ok"}},
    {name:"Duplicate record check", desc:"Parcel checked against neighbouring ULPINs for overlap.", ok:{UP:"ok",TN:"ok",KA:"ok",TS:"ok",BR:"ok",MH:"ok"}},
    {name:"Land-change detection", desc:"Compared against the last two available survey cycles.", ok:{UP:"ok",TN:"ok",KA:"ok",TS:"ok",BR:"warn",MH:"ok"}},
    {name:"Encumbrance check", desc:"Cross-checked against registered charges and mortgages.", ok:{UP:"ok",TN:"ok",KA:"ok",TS:"ok",BR:"warn",MH:"warn"}}
  ];

  var DEFAULT_ASSESSMENTS = {
    "BR": {
      "Ownership": { label: "Disputed ⚠️", status: "warn" },
      "GIS boundary": { label: "Variance (4.6%) ⚠️", status: "warn" },
      "Registration": { label: "Verified ✓", status: "ok" },
      "Tax": { label: "Verified ✓", status: "ok" },
      "Encumbrance": { label: "Claim Recorded ⚠️", status: "warn" },
      "Mutation": { label: "Objection Pending ⚠️", status: "warn" },
      "Record consistency": { label: "Area Mismatch ⚠️", status: "warn" }
    },
    "MH": {
      "Ownership": { label: "Verified ✓", status: "ok" },
      "GIS boundary": { label: "Verified ✓", status: "ok" },
      "Registration": { label: "Verified ✓", status: "ok" },
      "Tax": { label: "Verified ✓", status: "ok" },
      "Encumbrance": { label: "Active Bojha ₹6.2L ⚠️", status: "warn" },
      "Mutation": { label: "Verified ✓", status: "ok" },
      "Record consistency": { label: "NA Review ⚠️", status: "warn" }
    }
  };

  var STAMP_LABEL = {ok:"Verified", warn:"Attention", crit:"Critical"};
  var ASSESSMENT_ROWS = ["Ownership","GIS boundary","Registration","Tax","Encumbrance","Mutation","Record consistency"];

  /* ============================================================
     4. STATE SELECTOR DROPDOWN
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
        listContainer.innerHTML = '<div style="padding:12px 16px;font-size:0.82rem;color:#8c8172;">No matching State or UT found</div>';
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
      if(searchInput){ searchInput.value = ""; setTimeout(function(){ searchInput.focus(); }, 50); }
    }

    function closeDropdown(){
      dropdown.style.display = "none";
      btn.setAttribute("aria-expanded", "false");
    }

    btn.addEventListener("click", function(e){
      e.stopPropagation();
      if(dropdown.style.display === "block") closeDropdown(); else openDropdown();
    });
    if(searchInput){
      searchInput.addEventListener("input", function(){ renderList(this.value); });
      searchInput.addEventListener("click", function(e){ e.stopPropagation(); });
    }
    document.addEventListener("click", function(e){
      if(!dropdown.contains(e.target) && e.target !== btn) closeDropdown();
    });

    window.__selectState = selectState;
  }

  /* ============================================================
     5. SEARCH FEEDBACK UI
  ============================================================ */
  var feedbackEl = null;
  var feedbackInner = null;

  function showFeedback(text, type){
    if(!feedbackEl) return;
    feedbackEl.style.display = "block";
    feedbackInner.className = "search-feedback-inner" + (type ? " search-feedback--" + type : "");
    feedbackInner.innerHTML = (type === "loading" ? '<span class="search-spinner"></span>' : '') +
      '<span class="search-feedback-text">' + text + '</span>';
  }

  function hideFeedback(){
    if(feedbackEl) feedbackEl.style.display = "none";
  }

  /* ============================================================
     6. SEARCH DISPATCH
  ============================================================ */
  function findParcelKey(query, state){
    var q = (query || "").toLowerCase();
    var s = (state || selectedState || "").toLowerCase();

    // Check Bihar (Score 74 - Discrepancy demo)
    if(s.indexOf("bihar") !== -1 || q.indexOf("bihar") !== -1 || q.indexOf("br-demo") !== -1 || q.indexOf("jamabandi") !== -1 || q.indexOf("512") !== -1 || q.indexOf("patna") !== -1 || q.indexOf("walmi") !== -1){
      return "BR";
    }

    // Check Maharashtra (Score 82 - Encumbrance demo)
    if(s.indexOf("maharashtra") !== -1 || q.indexOf("maharashtra") !== -1 || q.indexOf("mh-demo") !== -1 || q.indexOf("7/12") !== -1 || q.indexOf("saat-baara") !== -1 || q.indexOf("pune") !== -1 || q.indexOf("wagholi") !== -1 || q.indexOf("haveli") !== -1){
      return "MH";
    }

    // Check Telangana first if state or query contains TS keywords or any TS district
    if(s.indexOf("telangana") !== -1 || q.indexOf("ts-demo") !== -1 || q.indexOf("tg-demo") !== -1 || q.indexOf("dharani") !== -1 || q.indexOf("245") !== -1){
      return "TS";
    }
    for(var dist in TS_DISTRICTS){
      if(q.indexOf(dist) !== -1 || s.indexOf(dist) !== -1) return "TS";
    }

    if(q.indexOf("412") !== -1 || q.indexOf("up-demo") !== -1 || (s.indexOf("uttar") !== -1 && q)) return "UP";
    if(q.indexOf("88") !== -1 || q.indexOf("ka-demo") !== -1 || (s.indexOf("karnataka") !== -1 && q)) return "KA";
    if(q.indexOf("1042") !== -1 || q.indexOf("187") !== -1 || q.indexOf("tn-demo") !== -1 || (s.indexOf("tamil") !== -1 && q)) return "TN";
    return "UP";
  }

  function showResultSections(){
    ["dashboard","gis-view","passport","intelligence","history","integration","report"].forEach(function(id){
      var el = document.getElementById(id);
      if(el){
        el.style.display = "block";
        el.classList.add("section-reveal");
      }
    });
  }

  function doSearch(query, targetSectionId){
    var key = findParcelKey(query, selectedState);
    var p = PARCELS[key] || PARCELS["UP"];

    // If TS, check for specific district in query
    if(key === "TS"){
      var q = (query || "").toLowerCase();
      var matchedDist = null;
      for(var d in TS_DISTRICTS){
        if(q.indexOf(d) !== -1){ matchedDist = TS_DISTRICTS[d]; break; }
      }
      if(!matchedDist && (selectedState || "").toLowerCase().indexOf("telangana") !== -1){
        matchedDist = TS_DISTRICTS["rangareddy"];
      }
      if(matchedDist){
        p = JSON.parse(JSON.stringify(PARCELS["TS"]));
        p.district = matchedDist.district;
        p.mandal = matchedDist.mandal;
        p.village = matchedDist.village;
        p.survey = matchedDist.survey;
        p.ulpin = matchedDist.ulpin;
        p.area = matchedDist.area;
        p.coords = matchedDist.coords;
        p.holder = matchedDist.holder;
        p.ror = "Dharani e-Pattadar Passbook (Passbook No. " + matchedDist.passbook + ")";
      }
    }

    var isWarn = (p.score && p.score < 90);

    // Show loading
    showFeedback("Searching for your parcel...", "loading");

    // Simulate brief network delay for polish
    setTimeout(function(){
      // Show success
      showFeedback((isWarn ? "⚠️ Parcel Located with Flags — " : "✓ Parcel Found — ") + p.ulpin, isWarn ? "warn" : "success");

      // Reveal result sections
      showResultSections();

      // Update banner
      var banner = document.getElementById("parcel-found-banner");
      var bannerDesc = document.getElementById("pf-banner-text");
      if(banner){
        if(isWarn) banner.classList.add("banner--warn");
        else banner.classList.remove("banner--warn");
      }
      if(bannerDesc){
        var flagNotice = isWarn ? " <span style=\"color:#f59e0b;font-weight:700;\">— ⚠️ Assessment Score: " + p.score + "/100 (Attention Required)</span>" : "";
        bannerDesc.innerHTML = "Showing boundary for <b>" + p.ulpin + "</b> (" + p.survey + ") in " + p.district + ", " + p.state + flagNotice;
      }

      // Update compact card
      setText("pic-ulpin", p.ulpin);
      setText("pic-area", p.area);
      setText("pic-state", p.state);
      setText("pic-district", p.district);
      setText("pic-survey", p.survey);

      var statusPill = document.getElementById("pic-status");
      var verifiedTag = document.querySelector(".pic-verified-tag");
      if(statusPill){
        statusPill.textContent = isWarn ? "⚠️ " + (p.statusText || "Discrepancy Flagged") : "✓ Presumptive Title Clear";
        statusPill.className = "pic-status-pill" + (isWarn ? " warn" : "");
      }
      if(verifiedTag){
        verifiedTag.textContent = isWarn ? "⚠️ Score: " + p.score + "/100" : "✓ Verified";
        verifiedTag.className = "pic-verified-tag" + (isWarn ? " warn" : "");
      }

      // Map
      if(window.LandMap && window.LandMap.selectParcel){
        var mapLabel = null;
        if(p.state === "Telangana") mapLabel = "Survey " + p.survey + " — " + p.village + ", " + p.district + ", Telangana";
        else if(p.state === "Bihar") mapLabel = "Khasra " + p.survey + " — Walmi, Patna, Bihar (⚠️ Score: 74/100)";
        else if(p.state === "Maharashtra") mapLabel = "7/12 Gat " + p.survey + " — Wagholi, Pune, Maharashtra (⚠️ Score: 82/100)";
        window.LandMap.selectParcel(key, mapLabel);
      }

      // Render SIH Modules
      renderDashboard(p);
      renderPassport(p);
      renderLandIntelligence(p, key);
      renderLandHistory(p);
      window.__currentParcel = p;

      // Scroll to target section or Dashboard after a beat
      setTimeout(function(){
        var targetSection = targetSectionId ? document.getElementById(targetSectionId) : null;
        var viewToScroll = targetSection || document.getElementById("dashboard") || document.getElementById("gis-view");
        if(viewToScroll) viewToScroll.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"});
        setTimeout(updateActiveNavOnScroll, 350);
      }, 200);

      // Hide feedback after scroll
      setTimeout(hideFeedback, 2000);
    }, 600);
  }

  function setText(id, val){
    var el = document.getElementById(id);
    if(el) el.textContent = val;
  }

  /* ============================================================
     1. DASHBOARD
  ============================================================ */
  function renderDashboard(p){
    var pillState = document.getElementById("dash-p-state");
    var pillStatus = document.getElementById("dash-p-status");
    var pillUlpin = document.getElementById("dash-p-ulpin");
    var pillLoc = document.getElementById("dash-p-loc");

    var isWarn = (p.score && p.score < 90);
    if(pillState) pillState.textContent = p.state || "State / UT";
    if(pillStatus){
      pillStatus.textContent = isWarn ? "⚠️ " + (p.statusText || "Attention Required") : "✓ Verified Title";
      pillStatus.className = "dpp-status-tag" + (isWarn ? " warn" : "");
    }
    if(pillUlpin) pillUlpin.textContent = p.ulpin || "ULPIN not assigned";
    if(pillLoc) pillLoc.textContent = (p.village || "") + ", " + (p.district || "") + " · Plot " + (p.survey || "—");
  }

  /* ============================================================
     2. DIGITAL LAND PASSPORT
  ============================================================ */
  function renderPassport(p){
    var sheet = document.getElementById("passport-sheet");
    if(!sheet) return;

    var isWarn = (p.score && p.score < 90);
    var ulpin = p.ulpin || "Data not available";
    var survey = p.survey || "Data not available";
    var area = p.area || "Data not available";
    var state = p.state || "Data not available";
    var district = p.district || "Data not available";
    var location = (p.village ? (p.village + ", " + (p.mandal || "") + (p.coords ? " (" + p.coords + ")" : "")) : "Data not available");
    var status = p.status || "Data not available";
    var holder = p.holder || "Data not available";
    var ror = p.ror || "Data not available";

    sheet.innerHTML =
      '<div class="passport-sheet-head">' +
        '<div class="ps-brand">' +
          '<div class="ps-emblem">🏛️</div>' +
          '<div class="ps-title">' +
            '<h3>National Land Intelligence Platform</h3>' +
            '<p>Digital Land Certificate &middot; Government of India / ' + state + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="ps-qr-meta">' +
          '<div>' +
            '<div class="ps-ulpin-box">' + ulpin + '</div>' +
            '<div style="font-size:0.7rem;color:#a89b88;margin-top:3px;">Unique Land Parcel Identifier</div>' +
          '</div>' +
          '<canvas id="passport-qr-canvas" width="56" height="56"></canvas>' +
        '</div>' +
      '</div>' +

      '<div class="passport-fields-grid">' +
        '<div class="pf-item mono"><dt>1. ULPIN / Parcel ID</dt><dd>' + ulpin + '</dd></div>' +
        '<div class="pf-item"><dt>2. Survey / Khasra / Patta</dt><dd>' + survey + '</dd></div>' +
        '<div class="pf-item"><dt>3. Area</dt><dd>' + area + '</dd></div>' +
        '<div class="pf-item"><dt>4. State</dt><dd>' + state + '</dd></div>' +
        '<div class="pf-item"><dt>5. District</dt><dd>' + district + '</dd></div>' +
        '<div class="pf-item"><dt>6. Location</dt><dd>' + location + '</dd></div>' +
        '<div class="pf-item"><dt>7. Status</dt><dd>' + status + '</dd></div>' +
        '<div class="pf-item"><dt>Recorded Holder</dt><dd>' + holder + '</dd></div>' +
        '<div class="pf-item"><dt>Record of Rights (RoR)</dt><dd>' + ror + '</dd></div>' +
      '</div>' +

      '<div class="passport-sheet-foot">' +
        '<div class="ps-seal-mark' + (isWarn ? ' warn' : '') + '">' +
          '<span>' + (isWarn ? '⚠️ ATTENTION FLAGGED' : '✓ OFFICIAL DIGITAL RECORD') + '</span>' +
          '<span>&middot;</span>' +
          '<span>Presumptive Title Standard</span>' +
        '</div>' +
        '<div class="ps-legal-note">' +
          'Consolidated digital certificate issued for administrative reference under National Land Intelligence Platform standard.' +
        '</div>' +
      '</div>';

    window.__currentParcel = p;
    drawQr("passport-qr-canvas");
  }

  // Dedicated Print Passport function: opens ONLY the verifiable Digital Land Passport certificate
  window.printPassport = function(){
    var p = window.__currentParcel;
    var sheet = document.getElementById("passport-sheet");
    if(!sheet){
      window.print();
      return;
    }

    var ulpin = (p && p.ulpin) || "TS-DEMO-245-018";
    var survey = (p && p.survey) || "245/A";
    var area = (p && p.area) || "2.30 Acres";
    var state = (p && p.state) || "Telangana";
    var district = (p && p.district) || "Rangareddy";
    var location = (p && (p.village ? (p.village + ", " + (p.mandal || "") + (p.coords ? " (" + p.coords + ")" : "")) : p.location)) || "Kanakamamidi, Moinabad";
    var status = (p && p.status) || "✓ Verified — Consistent";
    var holder = (p && p.holder) || "K. Venkat Reddy";
    var ror = (p && p.ror) || "Dharani e-Pattadar Passbook";
    var isWarn = (p && p.score && p.score < 90);

    var qrCanvas = document.getElementById("passport-qr-canvas");
    var qrDataUrl = qrCanvas ? qrCanvas.toDataURL("image/png") : "";

    var printFrame = document.getElementById("passport-print-frame");
    if(printFrame) printFrame.remove();

    printFrame = document.createElement("iframe");
    printFrame.id = "passport-print-frame";
    printFrame.style.position = "fixed";
    printFrame.style.right = "-9999px";
    printFrame.style.bottom = "-9999px";
    printFrame.style.width = "1024px";
    printFrame.style.height = "768px";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<title>Digital Land Passport — ' + ulpin + '</title>' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">' +
      '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">' +
      '<style>' +
      '@page { size: A4 portrait; margin: 12mm 15mm; }' +
      '* { box-sizing: border-box; }' +
      'body { margin: 0; padding: 12px; font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif; background: #fff; color: #1a1207; -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
      '.cert-card { border: 2.5px solid #1a1207; border-radius: 12px; padding: 28px 32px; background: #fff; position: relative; }' +
      '.cert-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a1207; padding-bottom: 18px; margin-bottom: 22px; gap: 16px; }' +
      '.cert-brand { display: flex; align-items: center; gap: 14px; }' +
      '.cert-emblem { font-size: 2.4rem; line-height: 1; }' +
      '.cert-title h1 { margin: 0; font-size: 1.35rem; font-weight: 800; color: #1a1207; letter-spacing: -0.02em; }' +
      '.cert-title p { margin: 4px 0 0; font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.08em; color: #6b5a45; font-weight: 700; }' +
      '.cert-meta { text-align: right; display: flex; align-items: center; gap: 14px; }' +
      '.ulpin-pill { font-family: "JetBrains Mono", monospace; font-size: 0.92rem; font-weight: 700; background: #fdfaf3; color: #1a1207; padding: 7px 14px; border-radius: 6px; border: 1.5px solid #c29e69; }' +
      '.ulpin-sub { font-size: 0.68rem; color: #6b5a45; font-weight: 600; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }' +
      '.qr-box { width: 56px; height: 56px; border-radius: 6px; border: 1px solid #d4c5b0; display: block; }' +
      '.fields-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }' +
      '.field-box { background: #faf8f5; border: 1px solid #ddd2c4; border-radius: 8px; padding: 11px 13px; }' +
      '.field-box dt { font-size: 0.64rem; text-transform: uppercase; letter-spacing: 0.06em; color: #7a6a55; font-weight: 700; margin-bottom: 4px; }' +
      '.field-box dd { margin: 0; font-size: 0.92rem; font-weight: 700; color: #1a1207; }' +
      '.field-box.mono dd { font-family: "JetBrains Mono", monospace; color: #92510b; }' +
      '.cert-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1.5px solid #ddd2c4; padding-top: 16px; gap: 16px; }' +
      '.cert-seal { display: inline-flex; align-items: center; gap: 8px; font-family: "JetBrains Mono", monospace; font-size: 0.72rem; font-weight: 700; padding: 6px 14px; border-radius: 999px; background: #eafaf1; color: #1e8449; border: 1.5px solid #27ae60; }' +
      '.cert-seal.warn { background: #fef5e7; color: #ba4a00; border-color: #d35400; }' +
      '.cert-legal { font-size: 0.70rem; color: #6b5a45; line-height: 1.4; max-width: 480px; text-align: right; }' +
      '</style></head><body>' +
      '<div class="cert-card">' +
        '<div class="cert-header">' +
          '<div class="cert-brand">' +
            '<div class="cert-emblem">🏛️</div>' +
            '<div class="cert-title">' +
              '<h1>National Land Intelligence Platform</h1>' +
              '<p>Digital Land Certificate &middot; Government of India / ' + state + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="cert-meta">' +
            '<div>' +
              '<div class="ulpin-pill">' + ulpin + '</div>' +
              '<div class="ulpin-sub">Unique Land Parcel Identifier</div>' +
            '</div>' +
            (qrDataUrl ? '<img class="qr-box" src="' + qrDataUrl + '" alt="QR Code">' : '') +
          '</div>' +
        '</div>' +
        '<div class="fields-grid">' +
          '<div class="field-box mono"><dt>1. ULPIN / Parcel ID</dt><dd>' + ulpin + '</dd></div>' +
          '<div class="field-box"><dt>2. Survey / Khasra / Patta</dt><dd>' + survey + '</dd></div>' +
          '<div class="field-box"><dt>3. Area</dt><dd>' + area + '</dd></div>' +
          '<div class="field-box"><dt>4. State</dt><dd>' + state + '</dd></div>' +
          '<div class="field-box"><dt>5. District</dt><dd>' + district + '</dd></div>' +
          '<div class="field-box"><dt>6. Location</dt><dd>' + location + '</dd></div>' +
          '<div class="field-box"><dt>7. Status</dt><dd>' + status + '</dd></div>' +
          '<div class="field-box"><dt>Recorded Holder</dt><dd>' + holder + '</dd></div>' +
          '<div class="field-box"><dt>Record of Rights (RoR)</dt><dd>' + ror + '</dd></div>' +
        '</div>' +
        '<div class="cert-footer">' +
          '<div class="cert-seal' + (isWarn ? ' warn' : '') + '">' +
            '<span>' + (isWarn ? '⚠️ ATTENTION FLAGGED' : '✓ OFFICIAL DIGITAL RECORD') + '</span>' +
            '<span>&middot;</span>' +
            '<span>Presumptive Title Standard</span>' +
          '</div>' +
          '<div class="cert-legal">' +
            'Consolidated digital certificate issued for administrative reference under National Land Intelligence Platform standard.' +
          '</div>' +
        '</div>' +
      '</div>' +
      '</body></html>';

    var doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(function(){
      try {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      } catch(e) {
        console.warn("Print frame fallback:", e);
        window.print();
      }
    }, 200);
  };

  /* ============================================================
     3. LAND INTELLIGENCE
  ============================================================ */
  function renderLandIntelligence(p, key){
    // 1. Parcel Overview
    var overviewList = document.getElementById("intel-overview-list");
    if(overviewList){
      overviewList.innerHTML =
        '<div class="ic-row"><span class="ic-k">ULPIN ID</span><span class="ic-v mono">' + (p.ulpin || "Data not available") + '</span></div>' +
        '<div class="ic-row"><span class="ic-k">Recorded Holder</span><span class="ic-v">' + (p.holder || "Data not available") + '</span></div>' +
        '<div class="ic-row"><span class="ic-k">Land Classification</span><span class="ic-v">' + (p.type || "Data not available") + '</span></div>' +
        '<div class="ic-row"><span class="ic-k">Zoning</span><span class="ic-v">' + (p.zoning || "Data not available") + '</span></div>' +
        '<div class="ic-row"><span class="ic-k">Presumptive Title</span><span class="ic-v">' + (p.ownership || "Data not available") + '</span></div>';
    }

    // 2. Spatial Information
    var spatialList = document.getElementById("intel-spatial-list");
    if(spatialList){
      spatialList.innerHTML =
        '<div class="ic-row"><span class="ic-k">Centroid Coords</span><span class="ic-v mono">' + (p.coords || "Data not available") + '</span></div>' +
        '<div class="ic-row"><span class="ic-k">Cadastral Area</span><span class="ic-v">' + (p.area || "Data not available") + '</span></div>' +
        '<div class="ic-row"><span class="ic-k">Survey / Plot No.</span><span class="ic-v mono">' + (p.survey || "Data not available") + '</span></div>' +
        '<div class="ic-row"><span class="ic-k">Village & Taluk</span><span class="ic-v">' + (p.village || "") + ", " + (p.mandal || "") + '</span></div>' +
        '<div class="ic-row"><span class="ic-k">Boundary Type</span><span class="ic-v">Polygon Layered Cadastral Map</span></div>';
    }

    // 3. Land Records
    var recordsList = document.getElementById("intel-records-list");
    if(recordsList){
      recordsList.innerHTML =
        '<div class="ic-row"><span class="ic-k">Record of Rights</span><span class="ic-v">' + (p.ror || "Data not available") + '</span></div>' +
        '<div class="ic-row"><span class="ic-k">Mutation Status</span><span class="ic-v">' + (p.mutation || "Data not available") + '</span></div>' +
        '<div class="ic-row"><span class="ic-k">Encumbrance / Bojha</span><span class="ic-v">' + (p.encumbrance || "Clean Title") + '</span></div>' +
        '<div class="ic-row"><span class="ic-k">Revenue Tax Status</span><span class="ic-v">' + (p.tax || "Paid to date") + '</span></div>' +
        '<div class="ic-row"><span class="ic-k">Guideline Valuation</span><span class="ic-v">' + (p.valuation || "Data not available") + '</span></div>';
    }

    // 4. Available Alerts
    var alertsBody = document.getElementById("intel-alerts-body");
    if(alertsBody){
      var isWarn = (p.score && p.score < 90);
      if(isWarn){
        if(key === "BR"){
          alertsBody.innerHTML =
            '<div class="alert-banner warn"><span>⚠️</span><div><b>Spatial Discrepancy:</b> Mapped GIS polygon measures 1.74 Acres vs. 1.82 Acres recorded in Jamabandi (4.6% variance).</div></div>' +
            '<div class="alert-banner warn"><span>⚠️</span><div><b>Pending Hearing:</b> Succession partition dispute Case No. 142/2024 active at Phulwari Anchal office.</div></div>';
        } else if(key === "MH"){
          alertsBody.innerHTML =
            '<div class="alert-banner warn"><span>⚠️</span><div><b>Active Encumbrance (Bojha):</b> State Bank of India agricultural charge of ₹6,20,000 registered on 7/12 other rights.</div></div>' +
            '<div class="alert-banner warn"><span>⚠️</span><div><b>Land Use Conversion:</b> Application for non-agricultural (NA) regularization pending scrutiny.</div></div>';
        } else {
          alertsBody.innerHTML =
            '<div class="alert-banner warn"><span>⚠️</span><div><b>Review Note:</b> ' + (p.statusText || "Parcel flagged for manual revenue review.") + '</div></div>';
        }
      } else {
        alertsBody.innerHTML =
          '<div class="alert-banner ok"><span>✓</span><div><b>Clean Cadastral Title:</b> No boundary disputes, overlap claims or encumbrance charges on file.</div></div>' +
          '<div class="alert-banner ok"><span>✓</span><div><b>Revenue Clearance:</b> Annual land revenue cleared. Mutation cleared with zero pending objections.</div></div>';
      }
    }

    // 5. Verification
    renderChecks(key);
    renderAssessment(key, p);
  }

  /* ============================================================
     4. LAND HISTORY
  ============================================================ */
  function renderLandHistory(p){
    var metaEl = document.getElementById("history-parcel-meta");
    var timelineEl = document.getElementById("history-timeline");
    if(!timelineEl) return;

    if(metaEl){
      metaEl.innerHTML =
        '<span class="hpm-tag">' + (p.ulpin || "Parcel Record") + ' &middot; Plot ' + (p.survey || "—") + '</span>' +
        '<span class="hpm-loc">' + (p.village || "") + ', ' + (p.district || "") + ', ' + (p.state || "") + '</span>';
    }

    var items = (p.history && p.history.length > 0) ? p.history : [
      { date: "2024-06-15", title: "Annual Revenue Tax Cleared", desc: "Demo Data: Electronic challan cleared via state treasury portal." },
      { date: "2021-09-10", title: "Cadastral Digital Resurvey", desc: "Demo Data: Spatial boundary verified under DILRMP GIS modernisation." },
      { date: "2016-04-20", title: "Record Digitisation", desc: "Demo Data: Legacy paper revenue record migrated to central portal." }
    ];

    var html = "";
    items.forEach(function(h){
      html +=
        '<div class="ht-item">' +
          '<div class="ht-date">' + h.date + '</div>' +
          '<h5 class="ht-title">' + h.title + '</h5>' +
          '<p class="ht-desc">' + h.desc + '</p>' +
        '</div>';
    });
    timelineEl.innerHTML = html;
  }

  function renderChecks(abbr){
    var grid = document.getElementById("stamp-grid");
    if(!grid) return;
    grid.innerHTML = "";
    CHECKS.forEach(function(c,i){
      var verdict = c.ok[abbr] || "ok";
      var el = document.createElement("div");
      el.className = "stamp-item";
      el.innerHTML = '<div class="stamp-mark '+verdict+'"><span>●</span>'+STAMP_LABEL[verdict]+'</div><h4>'+c.name+'</h4><p>'+c.desc+'</p>';
      grid.appendChild(el);
      setTimeout(function(){ el.classList.add("in"); }, i * 60);
    });
  }

  function renderAssessment(abbr, p){
    var scoreNum = document.getElementById("score-num");
    var list = document.getElementById("assessment-list");
    var seal = document.querySelector(".seal-box");
    if(!scoreNum || !list) return;

    var score = (p && p.score) ? p.score : (abbr === "BR" ? 74 : (abbr === "MH" ? 82 : 96));
    scoreNum.textContent = score;

    if(seal){
      seal.style.setProperty("--pct", score);
      var ringColor = score < 80 ? "#f59e0b" : (score < 90 ? "#eab308" : "#48d28a");
      seal.style.setProperty("--ring-color", ringColor);
    }

    list.innerHTML = "";
    var customAssessments = DEFAULT_ASSESSMENTS[abbr] || {};
    ASSESSMENT_ROWS.forEach(function(name){
      var item = customAssessments[name] || { label: "Verified ✓", status: "ok" };
      var li = document.createElement("li");
      li.innerHTML = "<b>" + name + "</b><span class=\"" + item.status + "\">" + item.label + "</span>";
      list.appendChild(li);
    });
  }

  /* ============================================================
     8. REPORT MODAL
  ============================================================ */
  function openReport(){
    var p = window.__currentParcel || PARCELS["UP"];
    var sheet = document.getElementById("report-sheet");
    var overlay = document.getElementById("report-overlay");
    if(!sheet || !overlay) return;
    var today = new Date().toISOString().slice(0,10);
    sheet.innerHTML =
      '<button type="button" class="report-close" id="report-close-btn" aria-label="Close">&times;</button>' +
      '<div class="report-head"><div><h3>NLIP Verification Snapshot</h3><p style="margin:4px 0 0;font-size:0.82rem;color:#777;">Prototype Demonstration Record</p></div>' +
        '<div class="report-meta"><b>'+p.ulpin+'</b><br>'+today+'</div></div>' +
      '<div class="report-body"><dl>'+
        field("State",p.state)+field("District",p.district)+field("Survey / Khasra",p.survey)+field("Area",p.area)+
        field("Recorded Holder",p.holder)+field("Status",p.status)+field("Coordinates",p.coords)+field("Record of Rights",p.ror)+
      '</dl></div>' +
      '<div class="report-foot"><div class="report-disclaimer">Presumptive record snapshot for demonstration purposes.</div>' +
        '<div class="qr-box"><canvas id="qr-canvas" width="64" height="64"></canvas></div></div>' +
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
    var ctx = canvas.getContext("2d"), size=16, px=4, seed=42;
    function rand(){ seed=(seed*9301+49297)%233280; return seed/233280; }
    ctx.fillStyle="#1c1813"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#f3cf8c";
    for(var r=0;r<size;r++) for(var c=0;c<size;c++){
      var corner=(r<3&&c<3)||(r<3&&c>size-4)||(r>size-4&&c<3);
      if(corner){ if(r===0||r===2||c===0||c===2) ctx.fillRect(c*px,r*px,px,px); continue; }
      if(rand()>0.55) ctx.fillRect(c*px,r*px,px,px);
    }
  }

  /* ============================================================
     9. URL PARAMS
  ============================================================ */
  function handleUrlParams(){
    var params = new URLSearchParams(window.location.search);
    var stateParam = params.get("state");
    var queryParam = params.get("query");
    if(stateParam && window.__selectState) window.__selectState(stateParam);
    if(queryParam){
      var input = document.getElementById("ulpin-input");
      if(input) input.value = queryParam;
      setTimeout(function(){ doSearch(queryParam); }, 300);
    } else {
      var hash = window.location.hash;
      if(hash && hash.length > 1 && hash !== "#search-top"){
        var targetId = hash.substring(1);
        setTimeout(function(){
          if(!window.__currentParcel) doSearch("Khasra 412/1");
          var targetEl = document.getElementById(targetId);
          if(targetEl){
            targetEl.style.display = "block";
            targetEl.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"});
          }
        }, 300);
      }
    }
  }

  /* ============================================================
     10. INIT
  ============================================================ */
  document.addEventListener("DOMContentLoaded", function(){
    initLandBackground();
    initStateDropdown();

    feedbackEl = document.getElementById("search-feedback");
    feedbackInner = document.getElementById("search-feedback-inner");

    // Search form
    var searchForm = document.getElementById("search-form");
    if(searchForm){
      searchForm.addEventListener("submit", function(e){
        e.preventDefault();
        var val = document.getElementById("ulpin-input").value.trim();
        if(!val){ document.getElementById("ulpin-input").focus(); return; }
        doSearch(val);
      });
    }

    // Sample chips
    document.querySelectorAll(".sample-chip").forEach(function(chip){
      chip.addEventListener("click", function(){
        document.querySelectorAll(".sample-chip").forEach(function(c){ c.classList.remove("active"); });
        this.classList.add("active");
        var st = this.dataset.state, q = this.dataset.query;
        if(st && window.__selectState) window.__selectState(st);
        var input = document.getElementById("ulpin-input");
        if(input) input.value = q;
        doSearch(q);
      });
    });

    // View details / Next: Land Passport
    var detailsBtn = document.getElementById("pic-details-btn");
    if(detailsBtn){
      detailsBtn.addEventListener("click", function(){
        var t = document.getElementById("passport") || document.getElementById("dashboard");
        if(t){ t.style.display = "block"; t.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"}); }
      });
    }

    // Report & Export Actions
    var reportBtn = document.getElementById("report-btn");
    if(reportBtn) reportBtn.addEventListener("click", openReport);
    var reportOverlay = document.getElementById("report-overlay");
    if(reportOverlay) reportOverlay.addEventListener("click", function(e){ if(e.target === this) closeReport(); });

    // Export Cadastral GeoJSON
    var exportBtn = document.getElementById("export-geojson-btn");
    if(exportBtn){
      exportBtn.addEventListener("click", function(){
        var p = window.__currentParcel || PARCELS["UP"];
        var coordsStr = p.coords || "26.85,80.94";
        var parts = coordsStr.split(",");
        var lat = parseFloat(parts[0]) || 26.85;
        var lng = parseFloat(parts[1]) || 80.94;
        var d = 0.0015;
        var polygon = [
          [+(lng - d).toFixed(6), +(lat - d).toFixed(6)],
          [+(lng + d).toFixed(6), +(lat - d).toFixed(6)],
          [+(lng + d).toFixed(6), +(lat + d).toFixed(6)],
          [+(lng - d).toFixed(6), +(lat + d).toFixed(6)],
          [+(lng - d).toFixed(6), +(lat - d).toFixed(6)]
        ];
        var geojson = {
          type: "FeatureCollection",
          name: "NLIP_Cadastral_" + (p.ulpin || "Parcel"),
          crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
          features: [
            {
              type: "Feature",
              properties: {
                ULPIN: p.ulpin,
                State: p.state,
                District: p.district,
                Survey_Khasra: p.survey,
                Area: p.area,
                Recorded_Holder: p.holder,
                Assessment_Score: p.score,
                Status: p.statusText || p.status,
                Generated_By: "NLIP - National Land Intelligence Platform",
                Timestamp: new Date().toISOString()
              },
              geometry: {
                type: "Polygon",
                coordinates: [polygon]
              }
            }
          ]
        };
        var blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
        var blobUrl = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = blobUrl;
        a.download = "NLIP-" + (p.ulpin || "cadastral-parcel") + ".geojson";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      });
    }

    // Copy Deep Share Link
    var copyBtn = document.getElementById("copy-link-btn");
    if(copyBtn){
      copyBtn.addEventListener("click", function(){
        var p = window.__currentParcel || PARCELS["UP"];
        var shareUrl = window.location.origin + window.location.pathname + "?state=" + encodeURIComponent(p.state || selectedState) + "&query=" + encodeURIComponent(p.ulpin || p.survey);
        var btnText = document.getElementById("copy-btn-text");
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(shareUrl).then(function(){
            if(btnText){
              var prev = btnText.textContent;
              btnText.textContent = "✓ Link Copied!";
              setTimeout(function(){ btnText.textContent = prev; }, 2400);
            }
          });
        } else {
          prompt("Copy direct parcel link:", shareUrl);
        }
      });
    }

    // Search Another Land (scrolls back to search input)
    var newSearchBtn = document.getElementById("new-search-btn");
    if(newSearchBtn){
      newSearchBtn.addEventListener("click", function(){
        var searchTop = document.getElementById("search-top");
        if(searchTop){
          searchTop.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"});
          var inp = document.getElementById("ulpin-input");
          if(inp){ setTimeout(function(){ inp.focus(); inp.select(); }, 400); }
        }
      });
    }

    // Back to Top button in footer
    var backToTop = document.getElementById("back-to-top-btn");
    if(backToTop){
      backToTop.addEventListener("click", function(){
        window.scrollTo({top: 0, behavior: reduceMotion ? "auto" : "smooth"});
      });
    }

    // Top Navigation Links (Dashboard, GIS Map, Passport, Intelligence, History, Integration)
    var isClickScrolling = false;
    var clickScrollTimer = null;

    function resetClickScrolling(){
      isClickScrolling = false;
      if(clickScrollTimer) clearTimeout(clickScrollTimer);
    }

    window.addEventListener("wheel", resetClickScrolling, { passive: true });
    window.addEventListener("touchmove", resetClickScrolling, { passive: true });

    function updateActiveNavOnScroll(){
      if(isClickScrolling) return;

      var navLinks = Array.from(document.querySelectorAll(".head-nav a")).filter(function(a){
        var href = a.getAttribute("href");
        return href && href.startsWith("#");
      });
      if(!navLinks.length) return;

      var visibleSections = [];
      navLinks.forEach(function(link){
        var id = link.getAttribute("href").substring(1);
        var el = document.getElementById(id);
        if(el && (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0) && getComputedStyle(el).display !== "none"){
          visibleSections.push({ id: id, el: el, link: link });
        }
      });

      if(!visibleSections.length) return;

      var scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      var windowHeight = window.innerHeight;
      var docHeight = document.documentElement.scrollHeight;

      var searchSec = document.getElementById("search-top");
      var searchBottom = searchSec ? searchSec.getBoundingClientRect().bottom : 0;

      var activeSection = null;

      // When on the search page or viewing the search section, Search is always active
      if(scrollPos < 100 || searchBottom > 220){
        activeSection = visibleSections[0];
      } else if(scrollPos + windowHeight >= docHeight - 40){
        activeSection = visibleSections[visibleSections.length - 1];
      } else {
        var headerOffset = 110;
        for(var i = 0; i < visibleSections.length; i++){
          var rect = visibleSections[i].el.getBoundingClientRect();
          if(rect.top <= headerOffset && rect.bottom > headerOffset){
            activeSection = visibleSections[i];
            break;
          }
        }
        if(!activeSection){
          for(var j = visibleSections.length - 1; j >= 0; j--){
            if(visibleSections[j].el.getBoundingClientRect().top <= headerOffset){
              activeSection = visibleSections[j];
              break;
            }
          }
        }
      }

      if(!activeSection) activeSection = visibleSections[0];

      navLinks.forEach(function(a){ a.classList.remove("active"); });
      activeSection.link.classList.add("active");

      // Update Crazy Cadastral Scroll HUD, Laser Bar, Telemetry & Scanline
      updateCadastralScrollHud(scrollPos, docHeight, windowHeight, activeSection);
    }

    var scrollStopTimer = null;
    function updateCadastralScrollHud(scrollPos, docHeight, windowHeight, activeSection){
      var maxScroll = docHeight - windowHeight;
      var scrollPct = maxScroll > 0 ? Math.min(100, Math.max(0, Math.round((scrollPos / maxScroll) * 100))) : 0;

      // 1. Top Laser Scanner Bar
      var laserBar = document.getElementById("scroll-laser-bar");
      if(laserBar){
        laserBar.style.width = scrollPct + "%";
      }

      // 2. Dynamic scroll glow on body & scrollbar
      document.body.classList.add("is-scrolling");
      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(function(){
        document.body.classList.remove("is-scrolling");
        var teleHud = document.getElementById("scroll-telemetry-hud");
        if(teleHud) teleHud.classList.remove("active");
      }, 700);

      // 4. Floating Cadastral Telemetry Pill
      var teleHud = document.getElementById("scroll-telemetry-hud");
      var teleText = document.getElementById("tele-readout");
      var elev = Math.round(120 + scrollPct * 14.8);
      if(teleHud && teleText){
        teleHud.classList.add("active");
        var parcelTag = (window.__currentParcel && window.__currentParcel.survey) ? ("PARCEL " + window.__currentParcel.survey) : "CADASTRE SCAN";
        teleText.textContent = parcelTag + " · " + scrollPct + "% · ELEV " + elev + "m";
      }
      var chnAlt = document.getElementById("chn-altitude");
      if(chnAlt) chnAlt.textContent = "ELEV " + elev + "m";

      // 5. Waypoint Radar HUD Navigation
      var hudNodes = document.querySelectorAll(".chn-node");
      if(hudNodes.length && activeSection){
        hudNodes.forEach(function(node){
          var targetId = node.getAttribute("data-target");
          if(targetId === activeSection.id){
            node.classList.add("active");
          } else {
            node.classList.remove("active");
          }
        });
      }
    }

    var scrollTicking = false;
    window.addEventListener("scroll", function(){
      if(!scrollTicking){
        requestAnimationFrame(function(){
          updateActiveNavOnScroll();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    document.querySelectorAll(".head-nav a").forEach(function(link){
      link.addEventListener("click", function(e){
        var href = this.getAttribute("href");
        if(!href || !href.startsWith("#")) return;
        var targetId = href.substring(1);
        var targetEl = document.getElementById(targetId);

        e.preventDefault();

        // If clicking search, scroll to search top immediately
        if(targetId === "search-top"){
          document.querySelectorAll(".head-nav a").forEach(function(a){ a.classList.remove("active"); });
          this.classList.add("active");
          if(targetEl){
            targetEl.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"});
          }
          return;
        }

        // If touching a module before searching, initialize default demo parcel immediately
        var isHidden = !targetEl || targetEl.style.display === "none" || getComputedStyle(targetEl).display === "none";
        if(!window.__currentParcel || isHidden){
          var inputVal = document.getElementById("ulpin-input") ? document.getElementById("ulpin-input").value.trim() : "";
          var query = inputVal || (selectedState === "Telangana" ? "Rangareddy: Survey 245/A" : (selectedState === "Bihar" ? "Patna: Jamabandi 418" : (selectedState === "Maharashtra" ? "Pune: 7/12 Gat 88/1A" : "Khasra 412/1")));
          doSearch(query, targetId);
          return;
        }

        // Target section is already visible
        document.querySelectorAll(".head-nav a").forEach(function(a){ a.classList.remove("active"); });
        this.classList.add("active");

        isClickScrolling = true;
        clearTimeout(clickScrollTimer);
        clickScrollTimer = setTimeout(function(){
          isClickScrolling = false;
          updateActiveNavOnScroll();
        }, 900);

        if(targetEl){
          targetEl.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"});
        }
      });
    });

    // Cadastral Waypoint HUD click handler
    document.querySelectorAll(".chn-node").forEach(function(node){
      node.addEventListener("click", function(e){
        var targetId = this.getAttribute("data-target");
        if(!targetId) return;
        var targetEl = document.getElementById(targetId);
        e.preventDefault();

        if(targetId === "search-top"){
          document.querySelectorAll(".chn-node").forEach(function(n){ n.classList.remove("active"); });
          this.classList.add("active");
          if(targetEl){
            targetEl.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"});
          }
          return;
        }

        var isHidden = !targetEl || targetEl.style.display === "none" || getComputedStyle(targetEl).display === "none";
        if(!window.__currentParcel || isHidden){
          var inputVal = document.getElementById("ulpin-input") ? document.getElementById("ulpin-input").value.trim() : "";
          var query = inputVal || (selectedState === "Telangana" ? "Rangareddy: Survey 245/A" : (selectedState === "Bihar" ? "Patna: Jamabandi 418" : (selectedState === "Maharashtra" ? "Pune: 7/12 Gat 88/1A" : "Khasra 412/1")));
          doSearch(query, targetId);
          return;
        }

        document.querySelectorAll(".chn-node").forEach(function(n){ n.classList.remove("active"); });
        this.classList.add("active");

        isClickScrolling = true;
        clearTimeout(clickScrollTimer);
        clickScrollTimer = setTimeout(function(){
          isClickScrolling = false;
          updateActiveNavOnScroll();
        }, 900);

        if(targetEl){
          targetEl.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"});
        }
      });
    });

    // Dashboard navigation cards click handler
    document.querySelectorAll(".dash-nav-card").forEach(function(card){
      card.addEventListener("click", function(e){
        var href = this.getAttribute("href");
        if(!href || !href.startsWith("#")) return;
        var targetEl = document.getElementById(href.substring(1));
        if(targetEl){
          e.preventDefault();
          targetEl.style.display = "block";

          isClickScrolling = true;
          clearTimeout(clickScrollTimer);
          clickScrollTimer = setTimeout(function(){
            isClickScrolling = false;
            updateActiveNavOnScroll();
          }, 900);

          targetEl.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"});
          // Sync header nav active link
          document.querySelectorAll(".head-nav a").forEach(function(a){
            if(a.getAttribute("href") === href) a.classList.add("active");
            else a.classList.remove("active");
          });
        }
      });
    });

    // Run initial check
    setTimeout(updateActiveNavOnScroll, 300);

    // URL params & hash handling
    handleUrlParams();
  });

})();
