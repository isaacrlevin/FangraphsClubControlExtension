# Add Contract Data to Fangraphs Leaders Page Browser Extension

Simple Chromium-based browser extension that adds a additional data to the leaderboards page of Fangraphs.com. The purpose of this extension is to provide easier access to when a baseball player becomes a free agent or in baseball terms "club control".

## Install

| Chrome                                                                 | Firefox                                                                 |
|-----------------------------------------------------------------------|------------------------------------------------------------------------|
| [![Chrome Web Store](https://fonts.gstatic.com/s/i/productlogos/chrome_store/v7/192px.svg){:width="100px"}](https://chromewebstore.google.com/detail/add-contract-data-to-fang/oacghehmhnpfklelddmbllnnbklcjcap){:target="_blank" rel="noopener"} | [![Firefox Addon](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Firefox_logo%2C_2019.svg/1920px-Firefox_logo%2C_2019.svg.png){:width="100px"}](https://addons.mozilla.org/en-US/firefox/addon/contracts-on-fangraphs-leaders/){:target="_blank" rel="noopener"} |

## Demo

![alt text](/images/demo.gif)

Here is what the column means depending on status of player:

- If the player has a guaranteed contract, the column will show when the player is signed through (meaning they are a FA after that year) and how much of the money remains on the contract. For instance `SIGNED THRU 2031 | $280M` means the player is signed through the 2031 season and has $280M left on that deal. If a player is in the last year of a contract and is a pending free agent, the column will show something like `SIGNED THRU 2024`
- If the player is pre-arbitration or in their arbitration years, the column will show what their current arb status is (ARB1, ARB2, etc) and when their projected last year of arbitration is (this will change depending on Super II status). If a player is pre-arbitration, it will show the first year they go into arbitration. For instance `PREARB | ARB1 2027 | FINAL ARB 2029` means that the player is currently pre-arbitration, willl go into their first year of arbitration in 2027, and has a projected last year of arbitration in 2029.

If you hover over the column in a particular player row, a window will appear showing the current contract breakdown of that player, including any options they may have as part of that contract.

![alt text](/images/contract-breakdown.png)

### Development

**Initial setup:**

- Clone repo

**To install your local build to Chrome/Edge**

- Open Chrome and go to `chrome://extensions`
- Enable "Developer mode",
- Click "Load unpacked",
- Select the `src` folder you built above.

## Buy me a Coffee
If you like this extension, feel free to [buy me a coffee!](https://buymeacoffee.com/isaacrlevin)
