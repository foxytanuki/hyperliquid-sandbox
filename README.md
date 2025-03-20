## Hyperliquid Sandbox

### Run callPrecompile with hardhat

```
pnpm hardhat run --no-compile scripts/callPrecompile.ts --network hltestnet
```

### Run Python scripts

```
python3 -m venv .venv && source .venv/bin/activate && pip install eth_abi web3 && python3 ./scripts/precompile.py
```

### Notations

| Abbreviation | Full name | Explanation |
|------|--------|------|
| Px | Price | |
| Sz | Size | In units of coin, i.e. base currency |
| Szi | Signed size | Positive for long, negative for short |
| Ntl | Notional | USD amount, Px * Sz |
| Side | Side of trade or book | B = Bid = Buy, A = Ask = Short. Side is aggressing side for trades. |
| Asset | Asset | An integer representing the asset being traded. See below for explanation |
| Tif | Time in force | GTC = good until canceled, ALO = add liquidity only (post only), IOC = immediate or cancel |
