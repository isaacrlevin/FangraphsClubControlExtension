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
          if (contract.type.includes("GUARANTEED") && contract.salary == null) {
          } else {
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
              var arb = contract.type
                .replace(" (TBD)", "")
                .replace(" (PLACEHOLDER)", "");

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
                      tempArb = playerData.contractYears[
                        index + 2
                      ].type.replace("ARB ", "");
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
globalThis.attachEventListeners = () => {
  const clubControlCells = document.querySelectorAll(
    'td[data-col-id="ClubControl"]'
  );
  clubControlCells.forEach((cell) => {
    cell.addEventListener("mouseover", showHoverTable);
    cell.addEventListener("mouseout", hideHoverTable);
  });
};
