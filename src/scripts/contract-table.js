if (typeof contractData === "undefined" || contractData === null) {
  contractData = globalThis.payrollData();
}

function isPromise(p) {
  return typeof p === "object" && typeof p.then === "function";
}

// Create modal overlay and structure
function createContractModal() {
  if (document.getElementById("contract-modal-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "contract-modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-hidden", "true");

  const modal = document.createElement("div");
  modal.id = "contract-modal";

  const header = document.createElement("div");
  header.className = "contract-modal__header";
  const title = document.createElement("h2");
  title.textContent = "Contract Details";
  title.id = "contract-modal-title";
  title.style.fontSize = "20px";
  header.appendChild(title);

  const closeBtn = document.createElement("button");
  closeBtn.className = "contract-modal-close";
  closeBtn.setAttribute("aria-label", "Close Contract Details");
  closeBtn.innerText = "×";
  closeBtn.addEventListener("click", hideModal);
  header.appendChild(closeBtn);

  modal.appendChild(header);

  const content = document.createElement("div");
  content.className = "payroll_payroll-contract-insert__EsFNk";
  content.id = "contract-modal-content";

  modal.appendChild(content);
  overlay.appendChild(modal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hideModal();
  });

  document.body.appendChild(overlay);

  // keyboard
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideModal();
  });
}
function showModal() {
  const overlay = document.getElementById("contract-modal-overlay");
  if (!overlay) return;
  overlay.style.display = "flex";
  overlay.setAttribute("aria-hidden", "false");
  const modal = document.getElementById("contract-modal");
  if (modal) modal.focus();
}

function hideModal() {
  const overlay = document.getElementById("contract-modal-overlay");
  if (!overlay) return;
  overlay.style.display = "none";
  overlay.setAttribute("aria-hidden", "true");
}

// Modular content builders (each returns a div)
function buildPlayerNameDiv(playerData) {
  const d = document.createElement("div");
  d.className = "payroll_player-name__001 player-name";
  const strong = document.createElement("strong");
  strong.textContent =
    playerData.contractSummary.playerName || "Unknown Player";
  d.appendChild(strong);
  return d;
}

function buildFullContractInfoDiv(playerData) {
  const contractDetails = document.createElement("div");
  contractDetails.className = "payroll_player-contract__ZNKMv";
  contractDetails.style.display = "flex";
  contractDetails.style.justifyContent = "space-between";
  contractDetails.style.alignItems = "baseline";

  let totalEarned = 0;
  (playerData.contractYears || []).forEach((cy) => {
    const totalEarnedVal =
      cy.BaseSalary + cy.EarnedIncentives + cy.ProratedSigningBonus;
    totalEarned += totalEarnedVal || 0;
  });

  const contractInfo = document.createElement("strong");
  const startSeason = playerData.contractSummary.startSeason || "";
  const endSeasonAll = playerData.contractSummary.endSeasonAll || "";
  const yearsCount =
    typeof startSeason === "number" && typeof endSeasonAll === "number"
      ? endSeasonAll - startSeason + 1
      : "";

  // compute option years range: find first and last contractYears where Type contains "OPTION"
  const optionYears = (playerData.contractYears || [])
    .filter((cy) => cy && cy.Type && /OPTION/i.test(cy.Type))
    .map((cy) => cy.Season)
    .filter((s) => s != null)
    .sort((a, b) => a - b);

  let optionRangeStr = "";
  if (optionYears.length > 0) {
    const first = optionYears[0];
    const last = optionYears[optionYears.length - 1];
    if (first === last) {
      optionRangeStr = `${first} player option`;
    } else {
      const lastTwo = String(last).slice(-2);
      optionRangeStr = `${first}-${lastTwo} player options`;
    }
  }

  contractInfo.textContent = `${yearsCount} yr, ${convertToMillions(
    totalEarned.toLocaleString(),
  )} (${startSeason}-${String(endSeasonAll).slice(-2)})${optionRangeStr ? ", " + optionRangeStr : ""}`;
  contractDetails.appendChild(contractInfo);

  if (playerData.contractSummary.ContractDate) {
    const contractDate = document.createElement("span");
    contractDate.style.fontSize = "12px";
    contractDate.style.fontStyle = "italic";
    contractDate.style.whiteSpace = "nowrap";
    contractDate.style.marginLeft = "12px";
    // Format contract date as YYYY-MM-DD if possible
    let rawDate = playerData.contractSummary.ContractDate || "";
    let formattedDate = "Unknown Date";
    try {
      const d = new Date(rawDate);
      if (!Number.isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        formattedDate = `${yyyy}-${mm}-${dd}`;
      } else if (
        typeof rawDate === "string" &&
        rawDate.match(/\d{4}-\d{2}-\d{2}/)
      ) {
        formattedDate = rawDate.match(/\d{4}-\d{2}-\d{2}/)[0];
      }
    } catch (e) {
      formattedDate = rawDate || "Unknown Date";
    }

    contractDate.textContent = `Contract agreed to on ${formattedDate}`;
    contractDetails.appendChild(contractDate);
  }
  return contractDetails;
}

function buildContractSummaryPayrollNoteDiv(playerData) {
  const d = document.createElement("div");
  if (!playerData.contractSummary.ContractSummaryPayrollNote) return d;
  d.className = "payroll_payroll-note__Xmnbp";
  let note =
    playerData.contractSummary.ContractSummaryPayrollNote ||
    "No contract notes.";
  if (typeof note === "string" && note.length > 0) {
    note = note.charAt(0).toUpperCase() + note.slice(1);
  }
  d.textContent = note;
  return d;
}

function buildLongContractSummaryPayrollNoteDiv(playerData) {
  const d = document.createElement("div");
  if (!playerData.contractSummary.LongContractSummaryPayrollNote) return d;
  d.className = "payroll_payroll-note__Xmnbp";
  d.textContent =
    playerData.contractSummary.LongContractSummaryPayrollNote ||
    "No contract notes.";
  return d;
}

function buildNoTradeNotesDiv(playerData) {
  const d = document.createElement("div");
  if (!playerData.contractSummary.NoTradeNotes) return d;
  d.className = "payroll_payroll-note__Xmnbp";
  d.textContent = playerData.contractSummary.NoTradeNotes || "";
  return d;
}

function buildBreakdownTableDiv(playerData) {
  const d = document.createElement("div");
  d.className = "fg-data-grid";

  const table = document.createElement("table");
  table.className = "contract-table";
  const thead = document.createElement("thead");
  thead.innerHTML = `
      <tr>
        <th>Season</th>
        <th>Base Salary</th>
        <th>Prorated Signing Bonus</th>
        <th>AAV</th>
        <th>Potential Buyout</th>
        <th>Earned Incentives</th>
        <th>Total Earned</th>
      </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  let totals = {
    base: 0,
    signing: 0,
    aav: 0,
    buyout: 0,
    incentives: 0,
    totalEarned: 0,
    cbt: 0,
  };

  const years = playerData.contractYears || [];
  const hasOptions = years.some(
    (cy) => cy && cy.Type && /OPTION/i.test(cy.Type),
  );

  for (let i = 0; i < years.length; i++) {
    const cy = years[i];
    if (!cy) continue;

    // Handle ARB / Pre-ARB as a centered bold colspan row
    if (cy.Type.includes("ARB")) {
      const trARB = document.createElement("tr");
      const season = document.createElement("td");
      season.textContent = cy.Season || "";
      trARB.appendChild(season);

      const baseSpan = document.createElement("td");
      baseSpan.setAttribute("colspan", "6");
      baseSpan.style.textAlign = "center";
      baseSpan.style.fontWeight = "bold";
      baseSpan.textContent = (cy.Type.replace("(TBD)", "") || "ARB").trim();
      baseSpan.setAttribute("data-contract-color", "arb");
      trARB.appendChild(baseSpan);
      tbody.appendChild(trARB);
      continue;
    }

    if (cy.Type.includes("FREE AGENT")) {
      if (!hasOptions && i === years.length - 1) {
        const trFA = document.createElement("tr");
        const season = document.createElement("td");
        season.textContent = cy.Season || "";
        trFA.appendChild(season);

        const baseSpan = document.createElement("td");
        baseSpan.setAttribute("colspan", "6");
        baseSpan.style.textAlign = "center";
        baseSpan.style.fontWeight = "bold";
        baseSpan.textContent = "FREE AGENT";
        baseSpan.setAttribute("data-contract-color", "FREE AGENT");
        trFA.appendChild(baseSpan);
        tbody.appendChild(trFA);
      }
      continue;
    }

    const tr = document.createElement("tr");
    const season = document.createElement("td");
    season.textContent = cy.Season || "";
    if (cy.ArbSalaryProjection != null && cy.Salary == null) {
      season.classList.add("is-estimate-arb");
      season.setAttribute("data-contract-color", "arb");
    } else {
      season.setAttribute("data-contract-color", cy.Type);
    }
    tr.appendChild(season);

    const base = document.createElement("td");
    const baseVal = cy.BaseSalary || 0;
    const baseRounded = Math.round(baseVal || 0);
    base.textContent = baseRounded ? `$${baseRounded.toLocaleString()}` : "";
    base.setAttribute("data-stat", cy.Season);
    base.classList.add("cell-painted");
    if (cy.ArbSalaryProjection != null && cy.Salary == null) {
      base.classList.add("is-estimate-arb");
      base.setAttribute("data-contract-color", "arb");
    } else {
      base.setAttribute("data-contract-color", cy.Type);
    }
    tr.appendChild(base);
    totals.base += baseRounded || 0;

    const signing = document.createElement("td");
    const signingVal = cy.ProratedSigningBonus || 0;
    const signingRounded = Math.round(signingVal || 0);
    signing.textContent = signingRounded
      ? `$${signingRounded.toLocaleString()}`
      : "$0";
    if (cy.ArbSalaryProjection != null && cy.Salary == null) {
      signing.classList.add("is-estimate-arb");
      signing.setAttribute("data-contract-color", "arb");
    } else {
      signing.setAttribute("data-contract-color", cy.Type);
    }
    tr.appendChild(signing);
    totals.signing += signingRounded || 0;

    const aav = document.createElement("td");
    const aavVal = cy.AAV || 0;
    const aavRounded = Math.round(aavVal || 0);
    aav.textContent = aavRounded ? `$${aavRounded.toLocaleString()}` : "";
    if (cy.ArbSalaryProjection != null && cy.Salary == null) {
      aav.classList.add("is-estimate-arb");
      aav.setAttribute("data-contract-color", "arb");
    } else {
      aav.setAttribute("data-contract-color", cy.Type);
    }
    tr.appendChild(aav);
    totals.aav += aavRounded || 0;

    const buyout = document.createElement("td");
    const buyoutVal = cy.OptionBuyout || 0;
    const buyoutRounded = Math.round(buyoutVal || 0);
    buyout.textContent = buyoutRounded
      ? `$${buyoutRounded.toLocaleString()}`
      : "$0";
    if (cy.ArbSalaryProjection != null && cy.Salary == null) {
      buyout.classList.add("is-estimate-arb");
      buyout.setAttribute("data-contract-color", "arb");
    } else {
      buyout.setAttribute("data-contract-color", cy.Type);
    }
    tr.appendChild(buyout);
    totals.buyout += buyoutRounded || 0;

    const earnedIncentives = document.createElement("td");
    const incentivesVal = cy.EarnedIncentives || 0;
    const incentivesRounded = Math.round(incentivesVal || 0);
    earnedIncentives.textContent = incentivesRounded
      ? `$${incentivesRounded.toLocaleString()}`
      : "$0";
    if (cy.ArbSalaryProjection != null && cy.Salary == null) {
      earnedIncentives.classList.add("is-estimate-arb");
      earnedIncentives.setAttribute("data-contract-color", "arb");
    } else {
      earnedIncentives.setAttribute("data-contract-color", cy.Type);
    }
    tr.appendChild(earnedIncentives);
    totals.incentives += incentivesRounded || 0;

    const totalEarned = document.createElement("td");
    const totalEarnedVal =
      (cy.BaseSalary || 0) +
      (cy.EarnedIncentives || 0) +
      (cy.ProratedSigningBonus || 0);
    const totalEarnedRounded = Math.round(totalEarnedVal || 0);
    totalEarned.textContent = totalEarnedRounded
      ? `$${totalEarnedRounded.toLocaleString()}`
      : "$0";
    if (cy.ArbSalaryProjection != null && cy.Salary == null) {
      totalEarned.classList.add("is-estimate-arb");
      totalEarned.setAttribute("data-contract-color", "arb");
    } else {
      totalEarned.setAttribute("data-contract-color", cy.Type);
    }
    tr.appendChild(totalEarned);
    totals.totalEarned += totalEarnedRounded || 0;

    tbody.appendChild(tr);
  }

  // totals row
  const trTotal = document.createElement("tr");
  trTotal.className = "row-total";
  const tLabel = document.createElement("td");
  const tLabelStrong = document.createElement("strong");
  tLabelStrong.textContent = "Total";
  tLabel.appendChild(tLabelStrong);
  trTotal.appendChild(tLabel);
  const makeTotalCell = (val) => {
    const td = document.createElement("td");
    const s = document.createElement("strong");
    // display totals rounded to the nearest thousand
    const roundedThousands = Math.round((val || 0) / 1000) * 1000;
    s.textContent = roundedThousands
      ? `$${roundedThousands.toLocaleString()}`
      : "";
    td.appendChild(s);
    return td;
  };
  trTotal.appendChild(makeTotalCell(totals.base));
  trTotal.appendChild(makeTotalCell(totals.signing));
  trTotal.appendChild(makeTotalCell(totals.aav));
  trTotal.appendChild(makeTotalCell(totals.buyout));
  trTotal.appendChild(makeTotalCell(totals.incentives));
  trTotal.appendChild(makeTotalCell(totals.totalEarned));
  trTotal.appendChild(makeTotalCell(totals.cbt));

  table.appendChild(tbody);
  table.appendChild(trTotal);
  d.appendChild(table);
  return d;
}

function buildLegendDiv(playerData) {
  const d = document.createElement("div");
  d.className = "payroll_incentives-legend__D_Z6G";
  d.innerHTML = `<div class="payroll_option-legend__hK2eS"><span data-contract-color="player">Player Option</span><span data-contract-color="team">Club Option</span><span data-contract-color="vesting">Vesting Option</span><span data-contract-color="mutual">Mutual Option</span><span data-contract-color="FREE AGENT">Free Agent</span><span style="font-style: italic;">Estimated Value</span></div>`;
  return d;
}

function buildIncentivesByYearDiv(playerData) {
  const d = document.createElement("div");
  // Expecting playerData.incentivesAll to be an array with one incentives object
  if (!playerData.incentivesAll || playerData.incentivesAll.length !== 1)
    return d;

  d.className = "payroll_contract-incentives__fgBDt";
  const table = document.createElement("table");
  table.className = "payroll_incentives-table__aBwlL";
  const thead = document.createElement("thead");
  thead.innerHTML = `<tr><th>Year</th><th>Incentives</th></tr>`;
  table.appendChild(thead);
  const tbody = document.createElement("tbody");

  const data = playerData.incentivesAll[0].data || [];
  // Group by season
  const bySeason = data.reduce((acc, inc) => {
    const s = inc.season || "";
    if (!acc[s]) acc[s] = [];
    acc[s].push(inc);
    return acc;
  }, {});

  // Sort seasons numerically
  const seasons = Object.keys(bySeason)
    .map((k) => parseInt(k))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);

  seasons.forEach((season) => {
    const entries = bySeason[season] || [];
      const tr = document.createElement("tr");
      const yearTd = document.createElement("td");
      yearTd.textContent = season;
      const incTd = document.createElement("td");

      // Build formatted incentive parts with reached status styling
      entries.forEach((e, idx) => {
        const val = e.value || 0;
        const rounded = Math.round(val || 0);
        const money = `$${rounded.toLocaleString()}`;
        const desc = e.desc || "";
        const text = `${money} if ${desc}`;

        let partNode;
        const reached = (e.reached || "").toString().toUpperCase();
        if (reached === "YES") {
          const strong = document.createElement("strong");
          strong.textContent = text;
          partNode = strong;
        } else if (reached === "NO") {
          const strike = document.createElement("s");
          strike.textContent = text;
          partNode = strike;
        } else {
          partNode = document.createElement("span");
          partNode.textContent = text;
        }

        incTd.appendChild(partNode);
        if (idx < entries.length - 1) incTd.appendChild(document.createTextNode(", "));
      });

      tr.appendChild(yearTd);
      tr.appendChild(incTd);
      tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  d.appendChild(table);

  const legend = document.createElement("div");
  legend.className = "payroll_incentives-legend__D_Z6G";
  legend.innerHTML = `<span><strong>Bold</strong> = Earned</span><span><s>Strikethrough</s> = Not Earned</span><span>Plain = Pending</span><span><em>Italics</em> = Buyout Escalator</span>`;
  d.appendChild(legend);

  return d;
}

function buildStaticPlaceholderDiv() {
  const d = document.createElement("div");
  d.className = "payroll_static-placeholder__x";
  d.innerHTML = `<div style="border: 3px solid rgb(0, 0, 0); font-size: 14px; margin-top: 12px;"><h4 style="text-align: center; margin: 10px 0px;">CONTRACT INFORMATION NOTES</h4><ol style="list-style: decimal; padding-right: 10px;"><li style="list-style: decimal; padding: 5px 0px; line-height: 1.5;"> Total Earned is calculated as the sum of Base Salary, Prorated Signing Bonus, and Earned Incentives for each season.</li><li style="list-style: decimal; padding: 5px 0px; line-height: 1.5;"> Total CBT Hit is calculated as the sum of AAV and Earned Incentives for each season.</li><li style="list-style: decimal; padding: 5px 0px; line-height: 1.5;"> Signing bonuses are always allocated pro rata across guaranteed years, regardless of when the signing bonus is actually paid out.</li><li style="list-style: decimal; padding: 5px 0px; line-height: 1.5;">Signing bonuses, even if a portion of the signing bonus is due after a player is traded, are always paid by the signing team.</li><li style="list-style: decimal; padding: 5px 0px; line-height: 1.5;">When a player is traded, the AAV is recalculated based as the remaining base salary owed to the player divided by the remaining years on the contract. Since signing bonuses are always paid by the original team, they're not included in the recalculation.</li><li style="list-style: decimal; padding: 5px 0px; line-height: 1.5;">When an option is exercised, the player doesn't receive the Potential Buyout, so that value is struckthrough and not included in the totals row. However, buyout is still included in the AAV of the original contract years in the above table, even if not paid. The team(s) the player played for receive a CBT credit to account for the difference, on the Other Payments (Luxury Tax) table of the main payroll page.</li></ol></div>`;
  return d;
}

function populateModalWithPlayerData(playerData, trigger) {
  const content = document.getElementById("contract-modal-content");
  if (!content) return;
  content.innerHTML = "";

  // create nine divs via functions
  const v1 = buildPlayerNameDiv(playerData);
  const v2 = buildFullContractInfoDiv(playerData);
  const v3 = buildContractSummaryPayrollNoteDiv(playerData);
  const v4 = buildLongContractSummaryPayrollNoteDiv(playerData);
  const v5 = buildNoTradeNotesDiv(playerData);
  const v6 = buildBreakdownTableDiv(playerData);
  const v7 = buildLegendDiv(playerData);
  const v8 = buildIncentivesByYearDiv(playerData);
  const v9 = buildStaticPlaceholderDiv(playerData);

  [v1, v2, v3, v4, v5, v6, v7, v8, v9].forEach((el) => content.appendChild(el));
  showModal();
}

// Attach click handlers to Club Control cells and make them accessible links
globalThis.attachEventListeners = () => {
  createContractModal();
  const clubControlCells = document.querySelectorAll(
    'td[data-col-id="ClubControl"]',
  );
  clubControlCells.forEach((cell) => {
    cell.setAttribute("role", "button");
    cell.setAttribute("tabindex", "0");
    cell.setAttribute("aria-haspopup", "dialog");
    cell.addEventListener("click", (e) => {
      const target = e.currentTarget;
      const row = target.parentElement;
      const playerNameCell = row.querySelector("td a");
      if (!playerNameCell) return;
      const playerName = playerNameCell.innerText.trim();

      const handleData = (dataObj) => {
        const list = (dataObj.data || []).filter(
          (el) =>
            el.contractSummary.playerName.toLowerCase() ===
            playerName.toLowerCase(),
        );
        if (list.length === 0) return;
        let playerData = {};
        if (list.length === 1) playerData = list[0];
        else {
          playerData.contractSummary = list[list.length - 1].contractSummary;
          playerData.contractYears = [];
          list.forEach((it) => {
            (it.contractYears || []).forEach((cy) =>
              playerData.contractYears.push(cy),
            );
          });
        }
        populateModalWithPlayerData(playerData, target);
      };

      if (isPromise(contractData)) {
        contractData.then((d) => {
          contractData = d;
          handleData(d);
        });
      } else {
        handleData(contractData);
      }
    });

    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        cell.click();
      }
    });
  });
};
