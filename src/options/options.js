document.getElementById("save").addEventListener("click", () => {
  const turnOffExtension = document.getElementById("turnOffExtension").checked;
  const highlightArb = document.getElementById("highlightArb").checked;
  const arbColor = document.getElementById("arbColor").value;
  const highlightPreArb = document.getElementById("highlightPreArb").checked;
  const preArbColor = document.getElementById("preArbColor").value;
  const highlightLessThanOneYear = document.getElementById(
    "highlightLessThanOneYear"
  ).checked;
  const lessThanOneYearColor = document.getElementById(
    "lessThanOneYearColor"
  ).value;
  const highlightLastYearControl = document.getElementById("highlightLastYearControl").checked;
  const lastYearControl = document.getElementById("lastYearControl").value;
  const lastYearControlColor = document.getElementById("lastYearControlColor").value;
  const hideUnhighlighted =
    document.getElementById("hideUnhighlighted").checked;

  chrome.storage.sync.set(
    {
      turnOffExtension,
      highlightArb,
      arbColor,
      highlightPreArb,
      preArbColor,
      highlightLessThanOneYear,
      lessThanOneYearColor,
      highlightLastYearControl,
      lastYearControl,
      lastYearControlColor,
      hideUnhighlighted,
    },
    () => {
      document.getElementById("status").textContent = "Settings saved";
      setTimeout(() => {
        document.getElementById("status").textContent = "";
      }, 1000);
    }
  );
});

function refreshOptionAvailability() {
  const turnOffExtension = document.getElementById("turnOffExtension").checked;
  const highlightArb = document.getElementById("highlightArb").checked;
  const highlightPreArb = document.getElementById("highlightPreArb").checked;
  const highlightLessThanOneYear = document.getElementById("highlightLessThanOneYear").checked;
  const highlightLastYearControl = document.getElementById("highlightLastYearControl").checked;
  const hideUnhighlightedCheckbox = document.getElementById("hideUnhighlighted");

  const dependentInputs = document.querySelectorAll("input, select");
  dependentInputs.forEach((input) => {
    if (input.id !== "turnOffExtension") {
      input.disabled = turnOffExtension;
    }
  });

  if (turnOffExtension) {
    hideUnhighlightedCheckbox.checked = false;
    return;
  }

  // Only allow hideUnhighlighted when at least one highlight option is enabled.
  const anyHighlightEnabled =
    highlightArb ||
    highlightPreArb ||
    highlightLessThanOneYear ||
    highlightLastYearControl;

  hideUnhighlightedCheckbox.disabled = !anyHighlightEnabled;
  if (!anyHighlightEnabled) {
    hideUnhighlightedCheckbox.checked = false;
  }
}

["turnOffExtension", "highlightArb", "highlightPreArb", "highlightLessThanOneYear", "highlightLastYearControl"].forEach(
  (id) => {
    document.getElementById(id).addEventListener("change", refreshOptionAvailability);
  },
);

// Initialize the year dropdown
function initializeYearDropdown() {
  const select = document.getElementById("lastYearControl");
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year <= currentYear + 10; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    select.appendChild(option);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeYearDropdown();

  chrome.storage.sync.get(
    [
      "turnOffExtension",
      "highlightArb",
      "arbColor",
      "highlightPreArb",
      "preArbColor",
      "highlightLessThanOneYear",
      "lessThanOneYearColor",
      "highlightLastYearControl",
      "lastYearControl",
      "lastYearControlColor",
      "hideUnhighlighted",
    ],
    (data) => {
      document.getElementById("turnOffExtension").checked =
        data.turnOffExtension || false;
      document.getElementById("highlightArb").checked =
        data.highlightArb || false;
      document.getElementById("arbColor").value = data.arbColor || "#ff0000";
      document.getElementById("highlightPreArb").checked =
        data.highlightPreArb || false;
      document.getElementById("preArbColor").value =
        data.preArbColor || "#00ff00";
      document.getElementById("highlightLessThanOneYear").checked =
        data.highlightLessThanOneYear || false;
      document.getElementById("lessThanOneYearColor").value =
        data.lessThanOneYearColor || "#0000ff";
      document.getElementById("highlightLastYearControl").checked =
        data.highlightLastYearControl || false;
      document.getElementById("lastYearControl").value =
        data.lastYearControl || new Date().getFullYear();
      document.getElementById("lastYearControlColor").value =
        data.lastYearControlColor || "#ffa500";
      document.getElementById("hideUnhighlighted").checked =
        data.hideUnhighlighted || false;

      refreshOptionAvailability();
    }
  );
});
