document.getElementById("save").addEventListener("click", () => {
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

//add event listener for any checkbox and check to see if the hideUnhighlighted checkbox should be enabled or disabled
document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const highlightArb = document.getElementById("highlightArb").checked;
    const highlightPreArb = document.getElementById("highlightPreArb").checked;
    const highlightLessThanOneYear = document.getElementById("highlightLessThanOneYear").checked;
    const highlightLastYearControl = document.getElementById("highlightLastYearControl").checked;

    //only allow the hideUnhighlighted checkbox if the user has enabled at least one of the other options
    const anyHighlightEnabled =
      highlightArb || highlightPreArb || highlightLessThanOneYear || highlightLastYearControl;
    if (!anyHighlightEnabled) {
      document.getElementById("hideUnhighlighted").disabled = true;
      document.getElementById("hideUnhighlighted").checked = false;
    }
  });
});

// document
//   .getElementById("yearsLeftSlider")
//   .addEventListener("input", function () {
//     const slider = document.getElementById("yearsLeftSlider");
//     const valueDisplay = document.getElementById("yearsLeftValue");
//     valueDisplay.textContent = slider.value;
//   });

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
    }
  );
});
