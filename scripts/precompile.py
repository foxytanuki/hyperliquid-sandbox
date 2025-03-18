from eth_abi import encode
from web3 import Web3

def call_precompile(value: int, rpc_url: str) -> bytes:
    # Create Web3 instance with provided RPC URL
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        raise ConnectionError("Failed to connect to RPC endpoint")

    # Precompile address
    precompile_address = "0x0000000000000000000000000000000000000807" # Perps Oracle Price

    # ABI encode the uint16 value
    calldata = encode(['uint16'], [value])

    # Create transaction dict
    tx = {
        'to': precompile_address,
        'data': calldata,
    }

    # Make the call
    try:
        result = w3.eth.call(tx)
        return result
    except Exception as e:
        raise Exception(f"Failed to call precompile: {str(e)}")

# Example usage
if __name__ == "__main__":
    test_value = 3 # BTC on testnet is index 3
    rpc_url = "https://rpc.hyperliquid-testnet.xyz/evm"
    

    try:
        result = call_precompile(test_value, rpc_url)
        # To convert to a float divide the returned price by 10^(6 - asset szDecimals) 
        # For spot prices the conversion is 10^(8 - base asset szDecimals) instead
        print(f"Precompile call successful. Result: {result.hex()}")
    except Exception as e:
        print(f"Error: {str(e)}")
