chrome.webNavigation.onHistoryStateUpdated.addListener(
  function (details) {
    const url = new URL(details.url);

    // Only act on the specific URL
    if (
      url.hostname === "fangraphs.com" &&
      url.pathname.startsWith("/leaders/major-league")
    ) {
      const queryString = url.search;

      console.log("Query string changed on Fangraphs:", queryString);

      // Send a message to the content script to update the DOM
      chrome.tabs.sendMessage(details.tabId, {
        action: "updateDOM",
        queryString: queryString,
      });
    }
  },
  {
    url: [{ hostEquals: "fangraphs.com", pathPrefix: "/leaders/major-league" }],
  }
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.url &&
    changeInfo.url.includes("www.fangraphs.com/leaders/major-league")
  ) {
    const url = new URL(changeInfo.url);
    const queryString = url.search;

    console.log("Query string changed on Fangraphs:", queryString);

    // Send message to the content script to update the DOM
    chrome.tabs.sendMessage(tabId, {
      action: "updateDOM",
      queryString: queryString,
    });
  }
});