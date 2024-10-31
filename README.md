# Add Contract Data to Fangraphs Leaders Page Browser Extension

Simple browser extension that adds a additional data to the leaderboards page of Fangraphs.com. The purpose of this extension is to provide easier access to when a baseball player becomes a free agent or in baseball terms "club control".


![alt text](/images/demo.gif)

Here is what the column means depending on status of player:

- If the player has a guaranteed contract, the column will show when the player is signed through (meaning they are a FA after that year) and how much of the money remains on the contract. For instance `SIGNED THRU 2031 | $280M` means the player is signed through the 2031 season and has $280M left on that deal. If a player is in the last year of a contract and is a pending free agent, the column will show something like `SIGNED THRU 2024`
- If the player is pre-arbitration or in their arbitration years, the column will show what their current arb status is (ARB1, ARB2, etc) and when their projected last year of arbitration is (this will change depending on Super II status). If a player is pre-arbitration, it will show the first year they go into arbitration. For instance `PREARB | ARB1 2027 | FINAL ARB 2029` means that the player is currently pre-arbitration, willl go into their first year of arbitration in 2027, and has a projected last year of arbitration in 2029.

If you hover over the column in a particular player row, a window will appear showing the current contract breakdown of that player, including any options they may have as part of that contract.

![alt text](/images/contract-breakdown.png)

## Installation

**Option 1 (recommended)** – Install it from the [Chrome Web Store](https://chromewebstore.google.com/detail/add-contract-data-to-fang/inacpeifhpojalcflhpomamailbofhob).

**Option 2** – Install it from source (see below).

### Development

**Initial setup:**

- Clone repo

**To install your local build to Chrome**

- Open Chrome and go to `chrome://extensions`
- Enable "Developer mode",
- Click "Load unpacked",
- Select the `src` folder you built above.

