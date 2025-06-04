globalThis.payrollData = () => {
  const localStorageKey = "fangraphsFreeAgentData";
  const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds

  // For debugging - check if function is called
  console.log("payrollData function called");

  // Create a promise for the async data retrieval
  return new Promise((resolve) => {
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

      resolve(freeAgentData); // Return cached data
      return;
    }

    // Data is older than 1 day or doesn't exist, fetch new data
    console.log("Requesting fresh data from background script...");

    // Send message to background script
    chrome.runtime.sendMessage({action: "fetchPayrollData"}, (response) => {
      console.log("Response received from background script:", response);

      if (response && response.success) {
        // Store new data along with the current timestamp
        freeAgentData = {
          data: JSON.parse(response.data),
          timestamp: Date.now(),
        };

        if (freeAgentData.data !== undefined) {
          qsUpdated = false;
        }

        // Store the new data in localStorage
        localStorage.setItem(localStorageKey, JSON.stringify(freeAgentData));
        console.log("Updated contract data:", freeAgentData.data);
      } else {
        console.error("Error fetching data:", response ? response.error : "No response");
      }

      resolve(freeAgentData);
    });
  });
};