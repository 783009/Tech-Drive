var DONATIONS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRdTZiFaDCSnV4D7_C1OvYZQuhM89ZTPOZ5OkEAg770NbBGa7F7Vl17ZkDjr6gUOlw97WwiquUaK5o2/pub?gid=1591322061&single=true&output=csv";
var REPAIRS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRdTZiFaDCSnV4D7_C1OvYZQuhM89ZTPOZ5OkEAg770NbBGa7F7Vl17ZkDjr6gUOlw97WwiquUaK5o2/pub?gid=2051051474&single=true&output=csv";

var activeTab = "donations";

function buildStyle(arr) {
    return arr.join(" ");
}

function parseCSV(text) {
    var lines = [];
    var row = [""];
    var inQuotes = false;

    for (var i = 0; i < text.length; i++) {
        var c = text[i];
        var next = text[i+1];
        if (c === '"') {
            if (inQuotes && next === '"') { row[row.length - 1] += '"'; i++; }
            else { inQuotes = !inQuotes; }
        } else if (c === ',' && !inQuotes) {
            row.push('');
        } else if ((c === '\r' || c === '\n') && !inQuotes) {
            if (c === '\r' && next === '\n') { i++; }
            lines.push(row);
            row = [''];
        } else {
            row[row.length - 1] += c;
        }
    }
    if (row.length > 1 || row !== '') lines.push(row);
    return lines;
}

function cleanUrl(str) {
    if (!str) return "";
    var cleaned = str.trim();
    if (cleaned.indexOf("http") === 0) return cleaned;
    return "";
}

async function loadTrackerData() {
    var container = document.getElementById("view-container");
    var loading = document.getElementById("loading");
    var errorBanner = document.getElementById("error-banner");

    loading.classList.remove("hidden");
    container.classList.add("hidden");
    errorBanner.classList.add("hidden");
    container.innerHTML = "";

    var currentUrl = activeTab === "donations" ? DONATIONS_CSV_URL : REPAIRS_CSV_URL;

    try {
        var response = await fetch(currentUrl + "&cachebust=" + new Date().getTime());
        if (!response.ok) throw new Error("Network row lookup sync failure");
        var csvData = await response.text();
        var rows = parseCSV(csvData);

        if (activeTab === "donations") {
            renderDonations(rows, container);
        } else {
            renderRepairs(rows, container);
        }
        
        loading.classList.add("hidden");
        container.classList.remove("hidden");
    } catch (err) {
        loading.classList.add("hidden");
        errorBanner.innerText = "Error parsing dataset: " + err.message;
        errorBanner.classList.remove("hidden");
    }
}

function renderDonations(rows, container) {
    var dataIndex = rows.findIndex(function(r) { return r && r && r.trim() === "Tech Description"; });
    if (dataIndex === -1) dataIndex = 0;

    var i = dataIndex + 1;
    while (i < rows.length) {
        var mainRow = rows[i];
        if (!mainRow || !mainRow || mainRow.trim() === "" || mainRow.indexOf("Tracker") !== -1 || mainRow.indexOf("Images") !== -1) {
            i++;
            continue;
        }

        var title = mainRow;
        var donor = mainRow || "N/A";
        var status = mainRow || "Unknown";
        var value = mainRow || "N/A";

        var logDetails = "";
        var iLinks = [];
        var lookAhead = i + 1;

        while (lookAhead < rows.length) {
            var nextRow = rows[lookAhead];
            if (!nextRow) { lookAhead++; continue; }
            if (nextRow && nextRow.trim() !== "" && nextRow.indexOf("Images") === -1 && nextRow !== "Repair Details") {
                break;
            }
            if (nextRow && nextRow.trim() !== "" && nextRow.indexOf("Images") === -1) {
                logDetails += nextRow + "\n";
            }
            for (var c = 4; c <= 6; c++) {
                var link = cleanUrl(nextRow[c]);
                if (link) iLinks.push(link);
            }
            lookAhead++;
        }

        if (title.toLowerCase() === "item") { i = lookAhead; continue; }

        var detailsCard = document.createElement("details");
        detailsCard.className = buildStyle(["group", "border", "border-gray-200", "rounded-xl", "bg-white", "shadow-xs", "overflow-hidden", "open:ring-1", "open:ring-blue-500"]);
        
        var summary = document.createElement("summary");
        summary.className = buildStyle(["flex", "items-center", "justify-between", "p-4", "cursor-pointer", "bg-gray-50/50", "hover:bg-gray-50"]);
        
        var flexLeft = document.createElement("div");
        flexLeft.className = buildStyle(["flex", "items-center", "gap-4", "min-w-0", "pr-4"]);
        
        var arrow = document.createElement("span");
        arrow.className = "text-lg text-gray-400 transition-transform group-open:rotate-90";
        arrow.innerText = "▶";
        
        var textDiv = document.createElement("div");
        textDiv.className = "min-w-0";
        var h3 = document.createElement("h3");
        h3.className = "font-semibold text-gray-900 truncate";
        h3.innerText = title;
        var pDonor = document.createElement("p");
        pDonor.className = "text-xs text-gray-500 mt-0.5";
        pDonor.innerText = "Donor: " + donor;
        
        textDiv.appendChild(h3);
        textDiv.appendChild(pDonor);
        flexLeft.appendChild(arrow);
        flexLeft.appendChild(textDiv);
        
        var flexRight = document.createElement("div");
        flexRight.className = "flex items-center gap-3 shrink-0";
        
        var badge = document.createElement("span");
        var badgeBg = "bg-amber-100 text-amber-800";
        if (status.indexOf("Sold") !== -1) badgeBg = "bg-green-100 text-green-800";
        if (status.indexOf("E-Waste") !== -1) badgeBg = "bg-red-100 text-red-800";
        badge.className = buildStyle(["px-2.5", "py-1", "text-xs", "font-semibold", "rounded-full", badgeBg]);
        badge.innerText = status;
        flexRight.appendChild(badge);
        
        if (value !== "N/A" && value.trim() !== "") {
            var priceSpan = document.createElement("span");
            priceSpan.className = "text-sm font-bold text-gray-900";
            priceSpan.innerText = value;
            flexRight.appendChild(priceSpan);
        }
        
        summary.appendChild(flexLeft);
        summary.appendChild(flexRight);
        
        var contentDiv = document.createElement("div");
        contentDiv.className = "p-4 border-t border-gray-150 bg-white text-sm space-y-4";
        
        var notesBlock = document.createElement("div");
        if (logDetails) {
            var notesHeader = document.createElement("h4");
            notesHeader.className = "text-xs font-bold uppercase tracking-wider text-gray-400 mb-1";
            notesHeader.innerText = "Details / Notes";
            var notesContent = document.createElement("p");
            notesContent.className = "text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded-lg border";
            notesContent.innerText = logDetails.trim();
            notesBlock.appendChild(notesHeader);
            notesBlock.appendChild(notesContent);
        } else {
            var noNotes = document.createElement("p");
            noNotes.className = "text-gray-400 italic text-xs";
            noNotes.innerText = "No extra tracking notes specified.";
            notesBlock.appendChild(noNotes);
        }
        contentDiv.appendChild(notesBlock);
        
        if (iLinks.length > 0) {
            var imgBlock = document.createElement("div");
            var imgHeader = document.createElement("h4");
            imgHeader.className = "text-xs font-bold uppercase tracking-wider text-gray-400 mb-2";
            imgHeader.innerText = "Attached Images";
            imgBlock.appendChild(imgHeader);
            
            var grid = document.createElement("div");
            grid.className = "grid grid-cols-2 sm:grid-cols-3 gap-3";
            
            for (var k = 0; k < iLinks.length; k++) {
                var aImg = document.createElement("a");
                aImg.href = iLinks[k];
                aImg.target = "_blank";
                aImg.className = "block border rounded-lg overflow-hidden hover:opacity-90";
                
                var imgObj = document.createElement("img");
                imgObj.src = iLinks[k];
                imgObj.className = "w-full h-32 object-cover bg-gray-50";
                imgObj.onerror = function() {
                    this.style.display = "none";
                    var fallback = document.createElement("div");
                    fallback.className = "h-32 flex items-center justify-center text-xs text-gray-400 p-2 text-center bg-gray-50";
                    fallback.innerText = "View Asset Image";
                    this.parentElement.appendChild(fallback);
                };
                aImg.appendChild(imgObj);
                grid.appendChild(aImg);
            }
            imgBlock.appendChild(grid);
            contentDiv.appendChild(imgBlock);
        }
        
        detailsCard.appendChild(summary);
        detailsCard.appendChild(contentDiv);
        container.appendChild(detailsCard);
        i = lookAhead;
    }
    if(container.children.length === 0) container.innerHTML = '<p class="text-center py-8 text-gray-400 text-sm">No donations logged yet.</p>';
}

function switchTab(tab) {
    activeTab = tab;
    var btnDonations = document.getElementById("tab-donations");
    var btnRepairs = document.getElementById("tab-repairs");

    if (tab === "donations") {
        btnDonations.className = "flex-1 py-4 px-6 text-center font-medium border-b-2 border-blue-600 text-blue-600 bg-gray-50/50 transition-all cursor-pointer focus:outline-hidden";
        btnRepairs.className = "flex-1 py-4 px-6 text-center font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50 transition-all cursor-pointer focus:outline-hidden";
    } else {
        btnRepairs.className = "flex-1 py-4 px-6 text-center font-medium border-b-2 border-indigo-600 text-indigo-600 bg-gray-50/50 transition-all cursor-pointer focus:outline-hidden";
        btnDonations.className = "flex-1 py-4 px-6 text-center font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50 transition-all cursor-pointer focus:outline-hidden";
    }
    loadTrackerData();
}

document.addEventListener("DOMContentLoaded", loadTrackerData);
