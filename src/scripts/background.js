// Background script for handling API requests

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchPayrollData") {
    console.log("Background script received fetch request");

    // Fetch data from API
    fetch("https://fangraphs.azurewebsites.net/api/GetPayrollsTest?", {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Background fetch succeeded");
      sendResponse({success: true, data: data});
    })
    .catch(error => {
      console.error("Background fetch failed:", error);
      sendResponse({success: false, error: error.message});
    });

    return true; // Required to use sendResponse asynchronously
  }
});