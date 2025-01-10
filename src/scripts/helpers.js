globalThis.convertToMillions = (value) => {
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

// Function to calculate luminance
globalThis.getLuminance = (hex) => {
  const rgb = parseInt(hex.slice(1), 16); // Convert hex to RGB
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  // Calculate luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance;
}

// Function to update the UI with the highlight color
globalThis.updateHighlightColor = (element, color) => {
  element.style.setProperty("background-color", color, "important");
  const textColor = globalThis.getLuminance(color) < 128 ? "white" : "black";
  element.style.setProperty("color", textColor, "important");

  // Update the color of any anchor tags within the element
  const anchorTags = element.getElementsByTagName("a");
  for (let anchor of anchorTags) {
    anchor.style.setProperty("color", textColor, "important");
  }
}