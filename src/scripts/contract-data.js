globalThis.payrollData = () => {
  const localStorageKey = "fangraphsFreeAgentData";
  const apiEndpoint =
    "https://fangraphs.azurewebsites.net/api/GetPayrollsTest?"; // Replace with your API endpoint
  const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds

  // Retrieve data from localStorage
  let freeAgentData = JSON.parse(localStorage.getItem(localStorageKey)) || {};

  // Check if data is older than 1 day
  if (
    freeAgentData.timestamp &&
    Date.now() - freeAgentData.timestamp < oneDay
  ) {
    // Data is valid (less than 1 day old)
    console.log("Using cached contract data:", freeAgentData.data);

    if (freeAgentData.data !== undefined) {
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
          qsUpdated = false;
        }

        // Use the new data
        console.log("Fetched and updated data:", freeAgentData.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  return freeAgentData;
};