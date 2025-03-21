curl -X POST https://testnet.hl.rpc.kitsunesh.com/evm \
  -H "Content-Type: application/json" \
  --data '{
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [
      {
        "to": "0x0000000000000000000000000000000000000807",
        "data": "0x0000000000000000000000000000000000000000000000000000000000000003"
      },
      "latest"
    ],
    "id": 1
  }'
