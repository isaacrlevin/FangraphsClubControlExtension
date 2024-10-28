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
    return element.Name.toLowerCase() == playerName.toLowerCase();
  });

  if (player) {
    if (player.SalaryList.length == 1) {
      // player is free agent after current year
      return "SIGNED THRU " + player.SalaryList[0].Year;
    }

    if (player.SalaryList.length > 1) {
      if (player.SalaryList[1].Value == "Pre-ARB") {
        // Player is PreArb, calculate when they become arb eligible
        var arb1Year = "";
        for (var i = 1; i < player.SalaryList.length; i++) {
          if (player.SalaryList[i].Value == "ARB 1") {
            arb1Year = player.SalaryList[i].Year;
            break;
          }
        }
        if (arb1Year != "") {
          return (
            "PREARB | ARB1 " +
            arb1Year +
            " | FINAL ARB " +
            player.SalaryList[player.SalaryList.length - 1].Year
          );
        }
      }

      if (player.SalaryList[1].Value.includes("ARB")) {
        //Player Currently in ARB Year
        var arbNum = player.SalaryList[1].Value.replace("ARB ", "");
        return (
          player.SalaryList[1].Value.replace("-", "") +
          " | FINAL ARB " +
          player.SalaryList[player.SalaryList.length - 1].Year
        );
      }
      //sum all the salary for the years in player.SalaryList
      var totalSalary = 0;
      for (var i = 1; i < player.SalaryList.length; i++) {
        var tempSal = player.SalaryList[i].Value.replace("$", "").replace(
          /,/g,
          ""
        );
        var sal = parseInt(tempSal);
        if (sal === sal) {
          totalSalary += sal;
        }
      }
      return (
        "SIGNED THRU " +
        player.SalaryList[player.SalaryList.length - 1].Year +
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
      return element.Name.toLowerCase() == playerName.toLowerCase();
    });

    var table = document.getElementById("hover-table");

    if (playerData) {
      table.innerHTML = `
      <thead>
        <tr>
          <th style='width: 40%'>Contract Year</th>
          <th style='width: 60%'>Status</th>
        </tr>
      </thead>
      <tbody>
        ${playerData.SalaryList.map(
          (contract) => `
          <tr>
            <td style='width: 40%'>${contract.Year}</td>
            <td style='width: 60%' data-stat="${
              contract.Year
            }" class="cell-painted   " data-contract-color="${
            contract.Attribute
          }">
            ${
              contract.Value.includes("ARB")
                ? contract.Value
                : convertToMillions(contract.Value)
            }
            </td>
          </tr>
        `
        ).join("")}
      </tbody>
    `;
    } else {
      table.innerHTML = `
      <thead>
        <tr>
          <th>No Data Available</th>
        </tr>
      </thead>
    `;
    }
  }

  hoverTable.style.left = `${event.pageX + 10}px`;
  hoverTable.style.top = `${event.pageY + 10}px`;
  hoverTable.style.display = "block";
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateDOM") {
    const queryString = message.queryString;
    qsUpdated = true;
    removeFreeAgentYearColumn();
  }
});

function getPayrollData() {
  const localStorageKey = "fangraphsFreeAgentData";
  const apiEndpoint = "https://fangraphs.azurewebsites.net/api/GetPayrolls?"; // Replace with your API endpoint
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
