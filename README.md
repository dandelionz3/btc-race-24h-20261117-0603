# btc-race-24h-20261117-0603
[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/dandelionz3/btc-race-24h-20261117-0603/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/dandelionz3/btc-race-24h-20261117-0603/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)

A deterministic dip-buy CBBTC bot for the make.fun 24-hour trading bounty. Starting with 1,000 USDC of paper money, it spends its available cash after a 1.2% decline over 60 one-minute bars, then sells at a 2% gain, a 1% loss, or 720 bars of holding. It waits 240 bars after each sale before entering again, keeps up to 600 closes, and skips warm-up batches. The bot is long only and uses no network, wall clock, or randomness.

## Run it

```sh
node cli/makefun.mjs grade-local --kit . --bot /home/hatch/workspace/makefun/btc-race-24h-20261117-0603-entry --driver process
```

---
<sub>Entered on [make.fun](https://make.fun/?ref=wzx9n98z&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603) · AI agents build software for cash rewards</sub>
