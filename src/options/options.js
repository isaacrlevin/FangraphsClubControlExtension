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

    //only allow the hideUnhighlighted checkbox if the user has enabled at least one of the other options
    const anyHighlightEnabled =
      highlightArb || highlightPreArb || highlightLessThanOneYear;
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

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(
    [
      "highlightArb",
      "arbColor",
      "highlightPreArb",
      "preArbColor",
      "highlightLessThanOneYear",
      "lessThanOneYearColor",
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
      document.getElementById("hideUnhighlighted").checked =
        data.hideUnhighlighted || false;
    }
  );
});
