## Hyperliquid Sandbox

### Run callPrecompile with hardhat

```
pnpm hardhat run --no-compile scripts/callPrecompile.ts --network hltestnet
```

### Run Python scripts

```
python3 -m venv .venv && source .venv/bin/activate && pip install eth_abi web3 && python3 ./scripts/precompile.py
```
