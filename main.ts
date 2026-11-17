// Buy CBBTC after a one-hour dip; exit on a rebound, a loss limit, or age.
// This strategy was verified on this race's dev window.
// Dev grade (btc-race-24h-20261117-0603-dev): net PnL +17.024779 USDC, 2 trades, max drawdown 0.0062, guardrails met, action log 00ae0fc7b512b9d096f05d1465619a13f5c5050f05d5b41744e8e60a9cd7a342.
// Grade locally from /home/hatch/workspace/makefun/btc-race-24h-20261117-0603-kit:
// node cli/makefun.mjs grade-local --kit . --bot /home/hatch/workspace/makefun/btc-race-24h-20261117-0603-entry --driver process
import { runBars, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const MAX_CLOSES = 600;
const LOOKBACK_BARS = 61;
const ENTRY_DIP_BPS = -120;
const TAKE_PROFIT_BPS = 200;
const STOP_LOSS_BPS = -100;
const TIME_STOP_BARS = 720;
const COOLDOWN_BARS = 240;
const MIN_CASH_UNITS = 1000000n;
const MAX_SLIPPAGE_BPS = 100;
const ZERO_QUANTITY = 0n;
const UNCHANGED_PRICE_RATIO = 1;
const BASIS_POINTS_PER_UNIT = 10000;

const recentCloses: number[] = [];
let entryClose: number | undefined;
let entryBar: number | undefined;
let saleBar: number | undefined;

await runBars({
  onBatch(state: BarsState, batch): (BuyInput | SellInput)[] {
    if (state.warmingUp) return [];
    const bar = batch.bars.find((candidate) => candidate.symbol === 'CBBTC');
    if (!bar) return [];

    const close = Number(bar.c);
    recentCloses.push(close);
    if (recentCloses.length > MAX_CLOSES) recentCloses.shift();

    const qty = state.positions.get('CBBTC')?.qty ?? ZERO_QUANTITY;
    if (qty > ZERO_QUANTITY) {
      if (entryClose === undefined || entryBar === undefined) {
        entryClose = close;
        entryBar = state.seq;
      }
      const pnlBps = (close / entryClose - UNCHANGED_PRICE_RATIO) * BASIS_POINTS_PER_UNIT;
      const age = state.seq - entryBar;
      if (pnlBps >= TAKE_PROFIT_BPS || pnlBps <= STOP_LOSS_BPS || age >= TIME_STOP_BARS) {
        saleBar = state.seq;
        entryClose = undefined;
        entryBar = undefined;
        return [{ side: 'sell', symbol: 'CBBTC', qty, max_slippage_bps: MAX_SLIPPAGE_BPS }];
      }
      return [];
    }

    entryClose = undefined;
    entryBar = undefined;
    if (!(recentCloses.length >= LOOKBACK_BARS) || state.cash < MIN_CASH_UNITS) return [];
    if (saleBar !== undefined && state.seq - saleBar < COOLDOWN_BARS) return [];

    const rocBps = (close / recentCloses[recentCloses.length - LOOKBACK_BARS] - UNCHANGED_PRICE_RATIO) * BASIS_POINTS_PER_UNIT;
    if (rocBps <= ENTRY_DIP_BPS) {
      entryClose = close;
      entryBar = state.seq;
      return [{
        side: 'buy',
        symbol: 'CBBTC',
        notional_quote_units: state.cash,
        max_slippage_bps: MAX_SLIPPAGE_BPS,
      }];
    }
    return [];
  },
});
