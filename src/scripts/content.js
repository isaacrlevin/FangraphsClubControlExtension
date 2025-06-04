if (typeof browser === "undefined") {
  var browser = chrome;
}

let contractData = {};
leadersMajorLeagueData = {};
let qsUpdated = false;
let columnAdded = false;
let highlightArb = false;
let arbColor = "#ff0000";
let highlightPreArb = false;
let preArbColor = "#ff0000";
let highlightLessThanOneYear = false;
let lessThanOneYearColor = "#ff0000";
let currentUrl = "";

async function initiate() {
  globalThis
    .payrollData()
    .then((data) => {
      contractData = data;
      getStats();
      updateUI();
    })
    .catch((error) => {
      console.error("Error getting payroll data:", error);
    });
}

function getStats() {
  leadersMajorLeagueData =
    JSON.parse(localStorage.getItem("leadersMajorLeagueData")) || {};
}

window.addEventListener("storage", (event) => {
  if (event.storageArea === localStorage) {
    // This means localStorage was modified
    contractData = globalThis.payrollData();
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync") {
    if (changes.highlightArb) {
      highlightArb = changes.highlightArb.newValue;
    }
    if (changes.arbColor) {
      arbColor = changes.arbColor.newValue;
    }
    if (changes.highlightPreArb) {
      highlightPreArb = changes.highlightPreArb.newValue;
    }
    if (changes.preArbColor) {
      preArbColor = changes.preArbColor.newValue;
    }
    if (changes.highlightLessThanOneYear) {
      highlightLessThanOneYear = changes.highlightLessThanOneYear.newValue;
    }
    if (changes.lessThanOneYearColor) {
      lessThanOneYearColor = changes.lessThanOneYearColor.newValue;
    }
    // Call a function to update the UI with the new settings
    initiate();
  }
});

chrome.storage.sync.get(
  [
    "highlightArb",
    "arbColor",
    "highlightPreArb",
    "preArbColor",
    "highlightLessThanOneYear",
    "lessThanOneYearColor",
  ],
  (data) => {
    if (data.highlightArb) {
      console.log(
        "Highlighting arbitration players with color:",
        data.arbColor
      );
      highlightArb = data.highlightArb;
      arbColor = data.arbColor;
    } else {
      console.log("Removing Highlighting arbitration players");
      highlightArb = false;
      arbColor = "#ff0000"; // Default color
    }

    if (data.highlightPreArb) {
      console.log(
        "Highlighting prearbitration players with color:",
        data.preArbColor
      );
      highlightPreArb = data.highlightPreArb;
      preArbColor = data.preArbColor;
    } else {
      console.log("Removing Highlighting arbitration players");
      highlightPreArb = false;
      preArbColor = "#ff0000"; // Default color
    }

    if (data.highlightLessThanOneYear) {
      console.log(
        "Highlighting one year remaining players with color:",
        data.lessThanOneYearColor
      );
      highlightLessThanOneYear = data.highlightLessThanOneYear;
      lessThanOneYearColor = data.lessThanOneYearColor;
    } else {
      console.log("Removing Highlighting one year remaining players");
      highlightLessThanOneYear = false;
      lessThanOneYearColor = "#ff0000"; // Default color
    }
    initiate();
  }
);

function getFreeAgentYear(playerName) {
  if (contractData.data === undefined) {
    console.log("No free agent data available");
    return;
  }
  var player = contractData.data.find(function (element) {
    return (
      element.contractSummary.playerName.toLowerCase() ==
      playerName.toLowerCase()
    );
  });

  if (player) {
    //remove items from player.ContractYears that are older than 2024
    player.contractYears = player.contractYears.filter(function (element) {
      return element.season >= 2025 && element.type != "FREE AGENT";
    });

    if (player.contractYears.length == 1) {
      // player is free agent after current year
      var val = "SIGNED THRU " + player.contractYears[0].season;
      if (player.contractYears[0].arbSalaryProjection != null) {
        val =
          val +
          " | " +
          globalThis.convertToMillions(
            player.contractYears[0].arbSalaryProjection.toLocaleString()
          );
      } else {
        val =
          val +
          " | " +
          globalThis.convertToMillions(
            player.contractYears[0].salary.toLocaleString()
          );
      }
      return val;
    }

    if (player.contractYears.length > 1) {
      if (player.contractYears[0].type.includes("PRE-ARB")) {
        // Player is PreArb, calculate when they become arb eligible
        var arb1Year = "";
        for (var i = 1; i < player.contractYears.length; i++) {
          if (player.contractYears[i].type == "ARB 1") {
            arb1Year = player.contractYears[i].season;
            break;
          }
        }
        if (arb1Year != "") {
          return (
            "PREARB | ARB1 " +
            arb1Year +
            " | FINAL ARB " +
            player.contractYears[player.contractYears.length - 1].season
          );
        }
      }

      if (
        player.contractSummary.contractType == "Arbitration" ||
        player.contractYears[0].type.includes("ARB") ||
        player.contractYears[0].arbYear != 0
      ) {
        //Player Currently in ARB Year
        var arbNum = player.contractYears[0].type.replace("ARB ", "");
        if (arbNum.includes("TBD") || arbNum.includes("GUARANTEE")) {
          var tempArb = player.contractYears[1].type.replace("ARB ", "");
          arbNum = tempArb - 1;
        } else if (player.contractYears[0].arbYear != 0) {
          arbNum = player.contractYears[0].arbYear;
        }
        return (
          "ARB" +
          arbNum +
          " | FINAL ARB " +
          player.contractYears[player.contractYears.length - 1].season
        );
      }
      //sum all the salary for the years in player.contractYears
      var totalSalary = 0;
      for (var i = 1; i < player.contractYears.length; i++) {
        var tempSal = player.contractYears[i].salary;
        var sal = parseInt(tempSal);
        if (sal === sal) {
          totalSalary += sal;
        }
      }
      return (
        "SIGNED THRU " +
        player.contractSummary.endSeason +
        " | " +
        globalThis.convertToMillions(totalSalary.toLocaleString())
      );
    }
  }
  return "NOT ON ANY ACTIVE PAYROLLS";
}

function removeFreeAgentYearColumn(dataColId) {
  const table = document.querySelector(".table-scroll");
  if (!table) return;

  // Add the header for the new column
  const headerRow = table.querySelector("thead tr");
  var columnIndexToDelete = -1;
  if (headerRow) {
    for (var i = 0; i < headerRow.cells.length; i++) {
      var rowCell = headerRow.cells[i];
      if (
        rowCell.attributes["data-col-id"] !== undefined &&
        rowCell.attributes["data-col-id"].value.toLowerCase() === dataColId
      ) {
        //headerRow.cells[i-1].remove();
        rowCell.remove();
        break;
      }
    }
  }

  const rows = table.querySelectorAll("tbody tr");
  rows.forEach((row) => {
    const playerNameCell = row.querySelector("td a");
    if (playerNameCell) {
      for (var i = 0; i < row.cells.length; i++) {
        var rowCell = row.cells[i];
        if (
          rowCell.attributes["data-col-id"] !== undefined &&
          rowCell.attributes["data-col-id"].value.toLowerCase() === dataColId
        ) {
          rowCell.remove();
        }
      }
    }
  });
}

// Function to add the "Free Agent Year" column
function addFreeAgentYearColumn() {
  removeFreeAgentYearColumn("baseballsavantlink");
  removeFreeAgentYearColumn("clubcontrol");

  if (
    window.location.href.includes("team=,") ||
    window.location.href.includes("team=0%2")
  ) {
    return;
  }

  console.log("Adding Free Agent Year Column");
  const table = document.querySelector(".table-scroll");
  if (!table) return;

  // Add the header for the new column
  const headerRow = table.querySelector("thead tr");
  const lastHeader = headerRow.cells[headerRow.cells.length - 1];
  const dataCol = lastHeader.attributes["data-col"].value;

  if (
    window.location.href.includes("type=24") &&
    leadersMajorLeagueData.length != undefined
  ) {
    const savantLinkTH = document.createElement("th");
    savantLinkTH.setAttribute("data-col-id", "BaseballSavantLink");
    savantLinkTH.setAttribute("data-stat", "BaseballSavantLink");
    savantLinkTH.classList.add("align-left");
    savantLinkTH.innerText = "Baseball Savant";
    headerRow.appendChild(savantLinkTH);
  }

  const dividerTH = document.createElement("th");
  dividerTH.setAttribute("data-col", parseInt(dataCol) + 1);
  dividerTH.setAttribute("data-col-id", "divider");
  dividerTH.setAttribute("data-stat", "-- Line Break --");
  dividerTH.classList.add("align-right");
  dividerTH.innerText = "-- Line Break --";
  headerRow.appendChild(dividerTH);

  const newHeader = document.createElement("th");
  newHeader.setAttribute("data-col", parseInt(dataCol) + 2);
  newHeader.setAttribute("data-col-id", "ClubControl");
  newHeader.setAttribute("data-stat", "ClubControl");
  newHeader.classList.add("align-right");
  newHeader.innerText = "Club Control Through";
  headerRow.appendChild(newHeader);

  // Add the free agent year data for each player
  const rows = table.querySelectorAll("tbody tr");
  rows.forEach((row) => {
    const playerNameCell = row.querySelector("td a");
    if (playerNameCell) {
      const playerName = playerNameCell.innerText.trim();
      const freeAgentYear = getFreeAgentYear(playerName);

      if (
        window.location.href.includes("type=24") &&
        leadersMajorLeagueData.length != undefined
      ) {
        var playerData = leadersMajorLeagueData.find(function (element) {
          return element.PlayerName.toLowerCase() == playerName.toLowerCase();
        });

        const savantLink = document.createElement("td");
        savantLink.setAttribute("data-col-id", "BaseballSavantLink");
        savantLink.setAttribute("data-stat", "BaseballSavantLink");
        savantLink.classList.add("align-left");

        if (playerData !== undefined) {
          var savantUrl = `https://baseballsavant.mlb.com/savant-player/${playerData.PlayerNameRoute.toLowerCase().replace(
            " ",
            "-"
          )}-${playerData.xMLBAMID}`;
          var aTag = document.createElement("a");
          aTag.setAttribute("href", savantUrl);
          aTag.innerText = "Link";
          aTag.setAttribute("style", "color:blue !important");
          aTag.setAttribute("target", "_blank");
          savantLink.appendChild(aTag);
        }
        row.appendChild(savantLink);
      }

      const divider = document.createElement("td");
      divider.setAttribute("data-col-id", "divider");
      divider.setAttribute("data-stat", "-- Line Break --");
      divider.classList.add("align-right");
      row.appendChild(divider);

      const newCell = document.createElement("td");
      newCell.setAttribute("data-col-id", "ClubControl");
      newCell.setAttribute("data-stat", "ClubControl");
      newCell.classList.add("align-right");
      newCell.innerText = freeAgentYear;
      row.appendChild(newCell);

      globalThis.updateHighlightColor(row, "#ffffff");

      if (freeAgentYear.includes("PREARB") && highlightPreArb) {
        globalThis.updateHighlightColor(row, preArbColor);
      } else if (freeAgentYear.includes("ARB") && highlightArb) {
        globalThis.updateHighlightColor(row, arbColor);
      } else if (freeAgentYear.includes("2025") && highlightLessThanOneYear) {
        globalThis.updateHighlightColor(row, lessThanOneYearColor);
      }

      if (globalThis.attachEventListeners != undefined) {
        globalThis.attachEventListeners();
      }
    }
  });
}

body = document.body;

// Create an observer instance for the loading div
const loadingDivObserver = new MutationObserver((mutationsList) => {
  if (window.location.href.includes("leaders/major-league")) {
    var url = window.location.href;

    if (currentUrl != url) {
      qsUpdated = true;
      columnAdded = false;
      currentUrl = url;
    }

    if (!qsUpdated) {
      for (let mutation of mutationsList) {
        if (mutation.target.localName == "tbody") {
          addFreeAgentYearColumn();
          qsUpdated = false;
          columnAdded = true;
          break;
        }
        if (columnAdded) {
          return;
        }
        for (let removedNode of mutation.removedNodes) {
          if (
            removedNode.nodeType === Node.ELEMENT_NODE &&
            removedNode.classList.contains("fgui-loading-screen")
          ) {
            addFreeAgentYearColumn();
            columnAdded = true;
            qsUpdated = false;
            break;
          }
        }
      }
    }
    if (qsUpdated) {
      initiate();
      qsUpdated = false;
    }
  }
});

const initialObserver = new MutationObserver((mutations) => {
  var processed = false;
  if (window.location.href.includes("leaders/major-league")) {
    mutations.forEach(() => {
      if (document.querySelector(".table-scroll")) {
        const table = document.querySelector(".table-scroll");
        if (
          table.querySelectorAll("tbody tr").length > 1 &&
          processed == false
        ) {
          initiate();
          processed = true;
          initialObserver.disconnect();
        }
      }
    });
    currentUrl = window.location.href;
  }
});

initialObserver.observe(body, {
  childList: true,
  subtree: true,
});

// Start observing the entire body for additions and removals of loading divs
loadingDivObserver.observe(body, { childList: true, subtree: true });

function updateUI() {
  console.log("Updating UI with new settings...");
  addFreeAgentYearColumn();
}

const script = document.createElement("script");
script.src = chrome.runtime.getURL("scripts/override-fetch.js"); // Load from extension files
script.onload = () => script.remove(); // Remove after loading to clean up

// Append the script to the document
document.documentElement.appendChild(script);
