function renderRepairs(rows, container) {
    var startIdx = rows.findIndex(function(r) { return r && r.join && r.join("").includes("Tech Item"); });
    if (startIdx === -1) startIdx = 0;

    var i = startIdx + 1;
    while (i < rows.length) {
        var mainRow = rows[i];
        if (!mainRow) { i++; continue; }
        if (!mainRow[0] || mainRow[0].trim() === "") { i++; continue; }
        if (mainRow[0].indexOf("Workbench") !== -1) { i++; continue; }
        if (mainRow[0].indexOf("Tech Item") !== -1) { i++; continue; }

        var item = mainRow[0];
        var client = mainRow[1] || "N/A";
        var issue = mainRow[2] || "N/A";
        var status = mainRow[3] || "Pending";
        var earned = mainRow[4] || "0";

        var logDetails = "";
        var iLinks = [];
        var lookAhead = i + 1;

        while (lookAhead < rows.length) {
            var nextRow = rows[lookAhead];
            if (!nextRow) { lookAhead++; continue; }
            if (nextRow[0] && nextRow[0].trim() !== "") {
                if (nextRow[0].indexOf("Repair Details") === -1) {
                    if (nextRow[0].indexOf("Images") === -1) {
                        break;
                    }
                }
            }
            if (nextRow[0] && nextRow[0].trim() !== "") {
                if (nextRow[0].indexOf("Repair Details") === -1) {
                    if (nextRow[0].indexOf("Images") === -1) {
                        logDetails += nextRow[0] + "\n";
                    }
                }
            }
            for (var c = 7; c <= 8; c++) {
                var link = cleanUrl(nextRow[c]);
                if (link) iLinks.push(link);
            }
            lookAhead++;
        }

        if (item.toLowerCase() === "item") {
            i = lookAhead;
            continue;
        }

        var detailsCard = document.createElement("details");
        detailsCard.className = buildStyle(["group", "border", "border-gray-200", "rounded-xl", "bg-white", "shadow-xs", "overflow-hidden", "open:ring-1", "open:ring-indigo-500"]);
        
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
        h3.innerText = item;
        var pClient = document.createElement("p");
        pClient.className = "text-xs text-gray-500 mt-0.5";
        pClient.innerText = "Client: " + client;
        
        textDiv.appendChild(h3);
        textDiv.appendChild(pClient);
        flexLeft.appendChild(arrow);
        flexLeft.appendChild(textDiv);
        
        var flexRight = document.createElement("div");
        flexRight.className = buildStyle(["flex", "items-center", "gap-3", "shrink-0"]);
        
        var badge = document.createElement("span");
        var badgeBg = "bg-amber-100 text-amber-800";
        if (status.indexOf("Fixed") !== -1) badgeBg = "bg-green-100 text-green-800";
        badge.className = buildStyle(["px-2.5", "py-1", "text-xs", "font-semibold", "rounded-full", badgeBg]);
        badge.innerText = status;
        
        var priceSpan = document.createElement("span");
        priceSpan.className = "text-sm font-bold text-gray-900";
        priceSpan.innerText = earned;
        
        flexRight.appendChild(badge);
        flexRight.appendChild(priceSpan);
        summary.appendChild(flexLeft);
        summary.appendChild(flexRight);
        
        var contentDiv = document.createElement("div");
        contentDiv.className = "p-4 border-t border-gray-150 bg-white text-sm space-y-4";
        
        var issueBlock = document.createElement("div");
        var issueHeader = document.createElement("h4");
        issueHeader.className = "text-xs font-bold uppercase tracking-wider text-gray-400 mb-1";
        issueHeader.innerText = "Reported Issue";
        var issueContent = document.createElement("p");
        issueContent.className = "text-gray-700 whitespace-pre-wrap leading-relaxed bg-amber-50/40 p-3 rounded-lg border border-amber-100/60";
        issueContent.innerText = issue;
        issueBlock.appendChild(issueHeader);
        issueBlock.appendChild(issueContent);
        contentDiv.appendChild(issueBlock);
        
        if (logDetails) {
            var notesBlock = document.createElement("div");
            var notesHeader = document.createElement("h4");
            notesHeader.className = "text-xs font-bold uppercase tracking-wider text-gray-400 mb-1";
            notesHeader.innerText = "Repair Fix Logs";
            var notesContent = document.createElement("p");
            notesContent.className = "text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded-lg border";
            notesContent.innerText = logDetails.trim();
            notesBlock.appendChild(notesHeader);
            notesBlock.appendChild(notesContent);
            contentDiv.appendChild(notesBlock);
        }
        
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
                    fallback.innerText = "View Repair Image";
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
    if(container.children.length === 0) container.innerHTML = '<p class="text-center py-8 text-gray-400 text-sm">No active repairs found.</p>';
}
