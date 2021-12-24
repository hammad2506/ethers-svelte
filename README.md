___
# ethers-svelte

Use the [ethers js library](https://docs.ethers.io) library as a collection of [readable stores](https://svelte.dev/tutorial/readable-stores) for Svelte.

Inspired by the svelte-web3 library by clbrge.

## Installation

1. Add the `ethers-svelte` package:
   
   ```bash
   npm i ethers-svelte
   ```
   
2. Add the ethers js library to your main HTML (`public/index.html`) file in your Svelte app.

```html
<script src="https://cdn.ethers.io/lib/ethers-5.2.umd.min.js" type="application/javascript"></script>
```

## Usage

### There are 2 ways to use this library:

1. By connecting to any Web 3 Providers like `MetaMask`, `Web3Modal` with `WalletConnect` etc by using the `useWeb3Provider` function.
   
2. By connecting to any RPC provider like `Infura` or `Alchemy` directly or even to your local blockchain such as `Hardhat` or `Ganache` etc by using the `useJsonRpcProvider` function.
___

Firstly we have to create a chain store. To do that, import the `createChainStore` function:

```js
import { createChainStore } from 'ethers-svelte';
```

Invoking the `createChainStore` function gives us back multiple stores to read from and also other helpers that help intitate our connection to our providers.

```js
const { useWeb3Provider, useJsonRpcProvider, chainStore, signer, provider } = createChainStore();
```

The `useWeb3Provider` and `useJsonRpcProvider` returned above are functions that we will use to connect to our provider. The `chainstore` is a svelte store we can subscribe to for different values. All these values are also exported as derived stores such as the `signer` and `provider` shown above. 

All values are `null` by default until a connection to a provider is established.

### Basic example (with Metamask)
Metamask by default provides window.ethereum in the global namespace
```js
const { useWeb3Provider, useJsonRpcProvider, chainStore, signer, provider } = createChainStore();

useWeb3Provider(window.ethereum); //Activates Metamask popup
```

Once initialized we can use the `chainStore` to read multiple values:
```js
$chainStore.account //The current account connected
$chainStore.network //The current network connected
$chainStore.chainId //The current chainId you are connected to
$chainStore.chainData //CAIP-2 representation of chain data
$chainStore.allAccounts //Equivalent to provider.listAccounts()
$chainStore.provider //EthersJs Provider Instance
$chainStore.signer //EthersJs Signer Instance

//All the above values are also exported as standalone derived stores when invoking the createChainStore() function. Example:

$account //The current account connected
$provider //EthersJs Provider Instance
$signer //EthersJs Signer Instance
```

We can then use the Ethers JS Provider/Signer instance as we would:

```js
$provider.getBalance("0xsomeAddress");
$signer.sendTransaction({to, value, gasLimit});
```

&nbsp;
___
### **Ethers-Svelte provides a consistent interface. All values and usage is almost similar for whichever provider interface (web3/JsonRpc) you use.**
___
&nbsp;

### Web3Modal with Wallet Connect:
___
```js
import { createChainStore } from 'ethers-svelte';
const { useWeb3Provider, useJsonRpcProvider, chainStore, signer, provider } = createChainStore();

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

const web3Modal = new Web3Modal({
  providerOptions: {
    walletconnect: { package: WalletConnectProvider, options: { infuraId: 'infuraId' } } 
  }
});

web3Modal.connect().then((wcProvider) => {
  useWeb3Provider(wcProvider);
});

$: console.log($chainStore.account) //The current account connected
```
&nbsp;
### Connecting to our local blockchain (Hardhat or Ganache):
___
```js
import { createChainStore } from 'ethers-svelte';
const { useWeb3Provider, useJsonRpcProvider, chainStore, signer, provider } = createChainStore();

const hardhatNetwork = 'http://127.0.0.1:8545';

useJsonRpcProvider(hardhatNetwork);

$: console.log($chainStore.account);
$: console.log($signer);
```

By default, `ethers-svelte` will get the default signer at account #0. As a second argument, an `index`, `address` or `wallet` instance can be provided. This is useful when you don't just want to read from the blockchain but also write to it. 

The `useJsonRpcProvider` also returns an object with a `changeSigner` function to change the signer for this store. Continuing from the above example:

```js
useJsonRpcProvider(hardhatNetwork); // Selects the first account at account#0
useJsonRpcProvider(hardhatNetwork, 1); // Select the account at index 1
useJsonRpcProvider(hardhatNetwork, "0xsomeAddress"); // Select the account at address provided

//Any Ethersjs wallet instance can also be provided
const wallet = new ethers.Wallet('privateKeyForAWallet');
useJsonRpcProvider(hardhatNetwork, wallet);

//Finally we can also change the signer
useJsonRpcProvider(hardhatNetwork, 0).then({changeSigner} => {
  changeSigner(1);
  changeSigner("0xaddress");
  changeSigner(wallet);
});
```
___
___

## Create Contract Stores

You can use the `createContractStore` function from `ethers-svelte` to create a contract store.

```js
import { createContractStore, createChainStore, ethers } from "ethers-svelte";
const { useWeb3Provider, signer, provider } = createChainStore();

//A contract store that can read from blockchain
const contractP = createContractStore(contractAddress, abi, provider);

//A contract store that can read/write to blockchain
const contractS = createContractStore(contractAddress, abi, signer);

//Functions can be invoked on that address following the 'Ethers' interface
$contractP.balanceOf("0xAddress");

const amount = ethers.utils.parseUnits(200, 18);
$contractS.transfer("0xAddress", amount);
```

Make sure a `provider` or `signer` **store** is provided to the `createContractStore` function and not instances.

```js
createContractStore(contractAddress, abi, provider); //Correct
createContractStore(contractAddress, abi, signer); //Correct

createContractStore(contractAddress, abi, $provider); //Incorrect
createContractStore(contractAddress, abi, $chainStore.provider); //Incorrect
```

**Whenever the `provider` or `signer` will change, the `contractStore` will automatically update to use the updated values.**
___

You can also save your chain store to retreive it later. Simply pass in a key/name when using the `createCahinStore` function. If no value is provided, it wont be saved.

```js
import { createChainStore, getChainStore } from 'ethers-svelte';

const { useWeb3Provider, chainStore, signer, provider } = createChainStore('metamaskConnection');


const { useWeb3Provider, chainStore, signer, provider } = getChainStore('metamaskConnection'); //Can retreive it later
```

Finally `ethers-svelte` also exports the `ethers` library you imported via CDN and the `getChainData` function that returns a CAIP-2 formatted representation of the chain ID provided as an input.

```js
import { ethers, getChainData } from 'ethers-svelte';

const ethereumChain = getChainData("1"); //ChainId for ethereum mainnet is 1

console.log(ethereumChain)
```
```json
{
    "name": "Ethereum Mainnet",
    "chain": "ETH",
    "network": "mainnet",
    "icon": "ethereum",
    "rpc": ["https://mainnet.infura.io/v3/${INFURA_API_KEY}", "wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}", "https://api.mycryptoapi.com/eth", "https://cloudflare-eth.com"],
    "faucets": [],
    "nativeCurrency": { "name": "Ether", "symbol": "ETH", "decimals": 18 },
    "infoURL": "https://ethereum.org",
    "shortName": "eth",
    "chainId": 1,
    "networkId": 1,
    "slip44": 60,
    "ens": { "registry": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" },
    "explorers": [{ "name": "etherscan", "url": "https://etherscan.io", "standard": "EIP3091" }],
  }
```
___
## Examples

Let us know if you are using `ethers-svelte` to build an open source Dapp and want to be listed in this section.

Some basic examples can be found in the `examples` folder.


&nbsp;
## Happy BUIDLing !