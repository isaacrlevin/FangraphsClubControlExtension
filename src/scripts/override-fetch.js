(function () {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        this._interceptedUrl = url; // Store the URL for use in send()
        return originalOpen.apply(this, arguments); // Call the original open method
    };

    XMLHttpRequest.prototype.send = function (body) {
        // Check if the URL matches the desired pattern
        if (this._interceptedUrl && this._interceptedUrl.includes("api/leaders/major-league/data")) {
            console.log("Intercepted XHR to:", this._interceptedUrl);

            this.addEventListener("load", function () {
                if (this.status >= 200 && this.status < 300) {
                    try {
                        const responseText = this.responseText; // Get the response as text
                        var data = JSON.parse(responseText); // Parse the JSON response

                        // check if data is array and if not, check if data.data is an array
                        if (!Array.isArray(data)) {
                            if (Array.isArray(data.data)) {
                                data = data.data;
                            } else {
                                console.warn("Response data is not an array:", data);
                                return;
                            }
                        }
                        const currentData = JSON.parse(localStorage.getItem("leadersMajorLeagueData")) || [];

                        data.forEach(newPlayer => {
                            const existingPlayerIndex = currentData.findIndex(player => player.PlayerName === newPlayer.PlayerName);
                            if (existingPlayerIndex !== -1) {
                                // Update the existing player data
                                currentData[existingPlayerIndex] = newPlayer;
                            } else {
                                // Append the new player data
                                currentData.push(newPlayer);
                            }
                        });
                        // Save the data to storage (using localStorage here as an example)
                        localStorage.setItem("leadersMajorLeagueData", JSON.stringify(currentData));
                        console.log("Response data saved to storage:", currentData);
                    } catch (error) {
                        console.error("Error parsing XHR response:", error);
                    }
                } else {
                    console.warn("XHR request failed with status:", this.status);
                }
            });
        }
        return originalSend.apply(this, arguments); // Call the original send method
    };
})();
