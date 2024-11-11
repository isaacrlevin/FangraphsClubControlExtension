let freeAgentData = {};
let qsUpdated = false;

function convertToMillions(value) {
  // Remove non-numeric characters except for the decimal point and comma
  let cleanedValue = value.replace(/[^0-9.]/g, "");

  // Convert the cleaned string to a number
  let numberValue = parseFloat(cleanedValue);

  // Divide by 1,000,000 to get the value in millions
  let millionValue = numberValue / 1000000;

  // Round to the nearest 10,000
  millionValue = Math.round(millionValue * 100) / 100;

  // Format the result to include the "M" suffix
  return `$${millionValue}M`;
}

function getFreeAgentYear(playerName) {
  var player = freeAgentData.data.find(function (element) {
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
          convertToMillions(
            player.contractYears[0].arbSalaryProjection.toLocaleString()
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

      if (player.contractYears[0].type.includes("ARB")) {
        //Player Currently in ARB Year
        var arbNum = player.contractYears[0].type.replace("ARB ", "");
        if (arbNum.includes("TBD")) {
          var tempArb = player.contractYears[1].type.replace("ARB ", "");
          arbNum = tempArb - 1;
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
        convertToMillions(totalSalary.toLocaleString())
      );
    }
  }
  return "NOT ON ANY ACTIVE PAYROLLS";
}

function removeFreeAgentYearColumn() {
  const table = document.querySelector(".table-scroll");
  if (!table) return;

  // Add the header for the new column
  const headerRow = table.querySelector("thead tr");
  var columnIndexToDelete = -1;
  if (headerRow) {
    for (var i = 0; i < headerRow.cells.length; i++) {
      if (
        headerRow.cells[i].attributes["data-col-id"] !== undefined &&
        headerRow.cells[i].attributes["data-col-id"].value.toLowerCase() ===
          "clubcontrol"
      ) {
        //headerRow.cells[i-1].remove();
        headerRow.cells[i].remove();
        break;
      }
    }
  }

  const rows = table.querySelectorAll("tbody tr");
  rows.forEach((row) => {
    const playerNameCell = row.querySelector("td a");
    if (playerNameCell) {
      for (var i = 0; i < row.cells.length; i++) {
        if (
          row.cells[i].attributes["data-col-id"] !== undefined &&
          row.cells[i].attributes["data-col-id"].value.toLowerCase() ===
            "clubcontrol"
        ) {
          row.cells[i].remove();
        }
      }
    }
  });
}

// Function to add the "Free Agent Year" column
function addFreeAgentYearColumn() {
  removeFreeAgentYearColumn();

  if (
    window.location.href.includes("team=,") ||
    window.location.href.includes("team=0%2")
  ) {
    return;
  }

  console.log(
    "Add Contract Data to Fangraphs Leaders Page Extension: Adding Free Agent Year Column"
  );
  const table = document.querySelector(".table-scroll");
  if (!table) return;

  // Add the header for the new column
  const headerRow = table.querySelector("thead tr");
  const lastHeader = headerRow.cells[headerRow.cells.length - 1];
  const dataCol = lastHeader.attributes["data-col"].value;

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
      attachEventListeners();
    }
  });
}

body = document.body;

function createHoverTable() {
  const root = document.createElement("div");
  root.id = "root-roster-resource";

  const div = document.createElement("div");
  div.classList.add("roster-resource-payroll");

  const legend = document.createElement("div");
  legend.classList.add("contracts-header__page-legend");

  const legendTable = document.createElement("table");
  legendTable.innerHTML = `
    <tbody>
      <tr class="payroll-legend">
        <td data-contract-color="true">Legend:</td>
        <td data-contract-color="FREE AGENT">ARB</td>
        <td data-contract-color="team">Club Option</td>
      </tr>
      <tr class="payroll-legend">
        <td data-contract-color="player">Player Option</td>
        <td data-contract-color="mutual">Mutual Option</td>
        <td data-contract-color="vesting">Vesting Option</td>
      </tr>
      <tr class="payroll-legend">
        <td colspan="3" data-contract-color="arb" style="background-color: #cfc">Estimated ARB (MLBTR)</td>
      </tr>
</tbody>
  `;

  legendTable.style.width = "100%";
  legend.style.backgroundColor = "white";
  legend.appendChild(legendTable);

  const table = document.createElement("table");
  table.id = "hover-table";
  table.classList.add("hover-table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Header 1</th>
        <th>Header 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
      </tr>
      <tr>
        <td>Data 3</td>
        <td>Data 4</td>
      </tr>
    </tbody>
  `;
  root.style.position = "absolute";
  root.style.display = "none";
  root.style.border = "1px solid black";
  table.style.border = "1px solid black";
  table.style.backgroundColor = "white";

  div.appendChild(legend);
  div.appendChild(table);
  root.appendChild(div);
  document.body.appendChild(root);
  return root;
}

const hoverTable = createHoverTable();

// Function to show the hover table
function showHoverTable(event) {
  const cell = event.currentTarget;
  const row = cell.parentElement;

  const playerNameCell = row.querySelector("td a");
  if (playerNameCell) {
    const playerName = playerNameCell.innerText.trim();

    var playerData = freeAgentData.data.find(function (element) {
      return (
        element.contractSummary.playerName.toLowerCase() ==
        playerName.toLowerCase()
      );
    });

    var table = document.getElementById("hover-table");

    if (playerData) {
      // Clear existing content
      table.innerHTML = "";

      // Create thead
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const thYear = document.createElement("th");
      thYear.style.width = "40%";
      thYear.textContent = "Contract Year";
      const thStatus = document.createElement("th");
      thStatus.style.width = "60%";
      thStatus.textContent = "Status";
      headerRow.appendChild(thYear);
      headerRow.appendChild(thStatus);
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Create tbody
      const tbody = document.createElement("tbody");

      playerData.contractYears.forEach((contract, index) => {
        if (contract.season >= 2025) {
          const row = document.createElement("tr");

          const tdYear = document.createElement("td");
          tdYear.style.width = "40%";
          tdYear.textContent = contract.season;
          row.appendChild(tdYear);

          const tdStatus = document.createElement("td");
          tdStatus.style.width = "60%";
          tdStatus.setAttribute("data-stat", contract.season);
          tdStatus.classList.add("cell-painted");

          if (contract.arbSalaryProjection != null) {
            tdStatus.classList.add("is-estimate-arb");
            tdStatus.setAttribute("data-contract-color", "arb");
          } else {
            tdStatus.setAttribute("data-contract-color", contract.type);
          }

          if (contract.type.includes("ARB")) {
            var arb = contract.type.replace(" (TBD)", "").replace(" (PLACEHOLDER)","");

            if (arb.toLowerCase() == "pre-arb") {
              tdStatus.textContent = "PRE-ARB";
            } else if (arb != "PRE-ARB" && arb.includes("ARB")) {
              var arbNum = arb.trim().replace("ARB ", "").replace("ARB", "");
              if (arbNum.trim() != "") {
              } else {
                if (
                  arbNum.trim() == "" &&
                  playerData.contractYears.length > 1
                ) {
                  var tempArb = playerData.contractYears[
                    index + 1
                  ].type.replace("ARB ", "");

                  if (
                    tempArb.trim() == "" &&
                    playerData.contractYears.length > 2
                  ) {
                    tempArb = playerData.contractYears[index + 2].type.replace(
                      "ARB ",
                      ""
                    );
                    arbNum = tempArb - 2;
                  } else {
                    arbNum = tempArb - 1;
                  }
                } else {
                  arbNum = "";
                }
              }
              if (contract.arbSalaryProjection != null) {
                tdStatus.textContent =
                  "ARB " +
                  arbNum +
                  " - " +
                  convertToMillions(
                    contract.arbSalaryProjection.toLocaleString()
                  );
              } else {
                tdStatus.textContent = "ARB " + arbNum;
              }
            }
          } else {
            tdStatus.textContent = convertToMillions(
              contract.salary.toLocaleString()
            );
          }
          row.appendChild(tdStatus);

          tbody.appendChild(row);
        }
      });

      table.appendChild(tbody);

      hoverTable.style.left = `${event.pageX + 10}px`;
      hoverTable.style.top = `${event.pageY + 10}px`;
      hoverTable.style.display = "block";
    }
  }
}

// Function to hide the hover table
function hideHoverTable() {
  hoverTable.style.display = "none";
}

// Function to attach event listeners to the target <td> elements
function attachEventListeners() {
  const clubControlCells = document.querySelectorAll(
    'td[data-col-id="ClubControl"]'
  );
  clubControlCells.forEach((cell) => {
    cell.addEventListener("mouseover", showHoverTable);
    cell.addEventListener("mouseout", hideHoverTable);
  });
}

// Create an observer instance for the loading div
const loadingDivObserver = new MutationObserver((mutationsList) => {
  if (window.location.href.includes("leaders/major-league")) {
    for (let mutation of mutationsList) {
      if (mutation.target.localName == "tbody") {
        addFreeAgentYearColumn();
        qsUpdated = false;
        break;
      }

      for (let removedNode of mutation.removedNodes) {
        if (
          removedNode.nodeType === Node.ELEMENT_NODE &&
          removedNode.classList.contains("fgui-loading-screen")
        ) {
          addFreeAgentYearColumn();
          qsUpdated = false;
          break;
        }
      }
    }
    if (qsUpdated) {
      addFreeAgentYearColumn();
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
          addFreeAgentYearColumn();
          processed = true;
          initialObserver.disconnect();
        }
      }
    });
  }
});

function getPayrollData() {
  const localStorageKey = "fangraphsFreeAgentData";
  const apiEndpoint =
    "https://fangraphs.azurewebsites.net/api/GetPayrollsTest?"; // Replace with your API endpoint
  const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds

  // Retrieve data from localStorage
  freeAgentData = JSON.parse(localStorage.getItem(localStorageKey)) || {};

  // Check if data is older than 1 day
  if (
    freeAgentData.timestamp &&
    Date.now() - freeAgentData.timestamp < oneDay
  ) {
    // Data is valid (less than 1 day old)
    console.log("Using cached data:", freeAgentData.data);

    if (freeAgentData.data !== undefined) {
      initialObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Start observing the entire body for additions and removals of loading divs
      loadingDivObserver.observe(body, { childList: true, subtree: true });

      qsUpdated = false;
    }
  } else {
    // Data is older than 1 day or doesn't exist, fetch new data
    fetch(apiEndpoint)
      .then((response) => response.json())
      .then((newData) => {
        // Store new data along with the current timestamp
        freeAgentData = {
          data: newData,
          timestamp: Date.now(),
        };
        localStorage.setItem(localStorageKey, JSON.stringify(freeAgentData));

        if (freeAgentData.data !== undefined) {
          initialObserver.observe(document.body, {
            childList: true,
            subtree: true,
          });

          // Start observing the entire body for additions and removals of loading divs
          loadingDivObserver.observe(body, { childList: true, subtree: true });

          qsUpdated = false;
        }

        // Use the new data
        console.log("Fetched and updated data:", freeAgentData.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }
}

getPayrollData();
