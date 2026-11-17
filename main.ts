// Buy CBBTC after a one-hour dip; exit on a rebound, a loss limit, or age.
// This strategy was verified on this race's dev window.
// Dev grade (btc-race-24h-20261117-0603-dev): net PnL +17.024779 USDC, 2 trades, max drawdown 0.0062, guardrails met, action log 00ae0fc7b512b9d096f05d1465619a13f5c5050f05d5b41744e8e60a9cd7a342.
// Grade locally from /home/hatch/workspace/makefun/btc-race-24h-20261117-0603-kit:
// node cli/makefun.mjs grade-local --kit . --bot /home/hatch/workspace/makefun/btc-race-24h-20261117-0603-entry --driver process
import { runBars, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const closes: number[] = [];
let entryClose: number | undefined;
let entryBar: number | undefined;
let saleBar: number | undefined;

await runBars({
  onBatch(state: BarsState, batch): (BuyInput | SellInput)[] {
    if (state.warmingUp) return [];
    const bar = batch.bars.find((candidate) => candidate.symbol === 'CBBTC');
    if (!bar) return [];

    const close = Number(bar.c);
    closes.push(close);
    if (closes.length > 600) closes.shift();

    const qty = state.positions.get('CBBTC')?.qty ?? 0n;
    if (qty > 0n) {
      if (entryClose === undefined || entryBar === undefined) {
        entryClose = close;
        entryBar = state.seq;
      }
      const pnlBps = (close / entryClose - 1) * 10000;
      const age = state.seq - entryBar;
      if (pnlBps >= 200 || pnlBps <= -100 || age >= 720) {
        saleBar = state.seq;
        entryClose = undefined;
        entryBar = undefined;
        return [{ side: 'sell', symbol: 'CBBTC', qty, max_slippage_bps: 100 }];
      }
      return [];
    }

    entryClose = undefined;
    entryBar = undefined;
    if (closes.length < 61 || state.cash < 1_000_000n) return [];
    if (saleBar !== undefined && state.seq - saleBar < 240) return [];

    const rocBps = (close / closes[closes.length - 61] - 1) * 10000;
    if (rocBps <= -120) {
      entryClose = close;
      entryBar = state.seq;
      return [{
        side: 'buy',
        symbol: 'CBBTC',
        notional_quote_units: state.cash,
        max_slippage_bps: 100,
      }];
    }
    return [];
  },
});
