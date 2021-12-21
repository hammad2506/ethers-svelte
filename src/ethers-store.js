import { derived, writable } from "svelte/store";

import allChains from "./all-chains";

let ethers = {};

function loadEthers() {
  if (ethers.version) return;
  try {
    ethers = getGlobalObject().ethers || {};
  } catch (err) {
    console.error("No global ethers object found. Please import the ethers library.");
  }
}

function getWindowEthereum() {
  try {
    if (getGlobalObject().ethereum) return getGlobalObject().ethereum;
  } catch (err) {
    console.error("No global Ethereum object.");
  }
}

function initEthers() {
  loadEthers();
  if (!ethers.version) throw new Error("Cannot find ethers. Please make sure you import the ethers library");
}

const allStores = {};

const DEFAULT_STATE = { provider: null, signer: null, account: null, allAccounts: [], network: null, chainId: null, chainData: {} };

function createChainStore(key = "") {
  const chainStore = writable(DEFAULT_STATE);
  const { update } = chainStore;

  async function useWeb3Provider(web3Provider) {
    initEthers();

    if (!web3Provider) {
      if (!getWindowEthereum()) throw new Error("Web 3 Proivder (Metamask or similar) not found. Please install it.");
      web3Provider = getWindowEthereum(); //Use window.ethereum if no web3Provider is provided
    }

    if (!web3Provider.on) {
      throw new Error("A valid Web 3 proivder must be provided. Valid web3 provider's have the 'on' method as defined in EIP-1193");
    }

    if (web3Provider && typeof web3Provider.request === "function") {
      await web3Provider.request({ method: "eth_requestAccounts" });
    }

    //Prevent memory leaks if function is accidently called multiple times
    if (typeof web3Provider.removeAllListeners === "function") {
      web3Provider.removeAllListeners();
    }

    web3Provider.on("accountsChanged", setupWeb3Provider);
    web3Provider.on("chainChanged", setupWeb3Provider);
    web3Provider.on("disconnect", setupWeb3Provider);

    let { provider, signer, account, allAccounts, network, chainId, chainData } = DEFAULT_STATE;
    await setupWeb3Provider();

    async function setupWeb3Provider() {
      try {
        provider = new ethers.providers.Web3Provider(web3Provider) || {};
        signer = await _getSigner(provider);
        account = await _getAddress(signer);
        allAccounts = (await provider.listAccounts()) || [];
        network = (await provider.getNetwork()) || {};
        chainId = network.chainId;
        chainData = getChainData(chainId);
        update(() => ({ provider, signer, account, allAccounts, network, chainId, chainData }));
      } catch (e) {
        console.error("An error occured when setting up Ethers: ", e);
        ({ provider, signer, account, allAccounts, network, chainId, chainData } = DEFAULT_STATE);
        update(() => DEFAULT_STATE);
      }
    }
  }

  async function useJsonRpcProvider(url = "", addressOrIndexOrWallet) {
    initEthers();

    let { provider, signer, account, allAccounts, network, chainId, chainData } = DEFAULT_STATE;
    await setupJsonRpcProvider();

    async function setupJsonRpcProvider() {
      try {
        provider = new ethers.providers.JsonRpcProvider(url) || {};
        allAccounts = (await provider.listAccounts()) || [];
        network = (await provider.getNetwork()) || {};
        chainId = network.chainId;
        chainData = getChainData(chainId);
        await addSigner(addressOrIndexOrWallet);
      } catch (e) {
        console.log("An error occured when setting up Ethers: ", e);
        ({ provider, signer, account, allAccounts, network, chainId, chainData } = DEFAULT_STATE);
        update(() => DEFAULT_STATE);
      }
    }

    async function addSigner(addressOrIndexOrWallet) {
      if (!provider) throw "There is no provider for this signer";

      if (_isWallet(addressOrIndexOrWallet)) signer = addressOrIndexOrWallet.connect(provider) || null;
      else signer = await _getSigner(provider, addressOrIndexOrWallet);
      account = await _getAddress(signer);

      update(() => ({ provider, signer, account, allAccounts, network, chainId, chainData }));
    }

    return { changeSigner: addSigner };
  }

  const derivedStores = {};
  derivedStores.provider = derived(chainStore, ($chainStore) => $chainStore.provider);
  derivedStores.signer = derived(chainStore, ($chainStore) => $chainStore.signer);
  derivedStores.account = derived(chainStore, ($chainStore) => $chainStore.account);
  derivedStores.allAccounts = derived(chainStore, ($chainStore) => $chainStore.allAccounts);
  derivedStores.network = derived(chainStore, ($chainStore) => $chainStore.network);
  derivedStores.chainId = derived(chainStore, ($chainStore) => $chainStore.chainId);
  derivedStores.chainData = derived(chainStore, ($chainStore) => $chainStore.chainData);

  const store = {
    ...derivedStores,
    chainStore,
    useWeb3Provider,
    useJsonRpcProvider,
  };

  saveChainStore(key, store);
  return store;
}

function getChainData(chainId = "") {
  return allChains[chainId] || {};
}

function getChainStore(key) {
  if (!allStores[key]) throw new Error(`Chain Store ${key} does not exist`);
  return allStores[name];
}

function createContractStore(address, abi, signerOrProviderStore) {
  initEthers();
  if (!address || !abi) throw new Error("address or abi cannot be empty");
  if (!signerOrProviderStore.subscribe) throw new Error("Provider or Signer provided must be a store");

  return derived(signerOrProviderStore, ($signerOrProviderStore) => {
    if (_isSigner($signerOrProviderStore) || _isProvider($signerOrProviderStore)) {
      return new ethers.Contract(address, abi, $signerOrProviderStore);
    }
    return null;
  });
}

loadEthers();

export { allChains, ethers };
export { createChainStore, getChainData, createContractStore, getChainStore };

/*************************************************************************************/
/************************************** Helpers **************************************/
/*************************************************************************************/

function saveChainStore(key, store) {
  if (!key) return;
  if (allChains[key]) console.warn("Name already exists, will be overwriting");
  allChains[key] = store;
}

async function _getSigner(provider, addressOrIndex) {
  try {
    const signer = await provider.getSigner(addressOrIndex);
    return _isSigner(signer) ? signer : null;
  } catch (e) {
    return null;
  }
}

async function _getAddress(signer) {
  try {
    return (_isSigner(signer) && (await signer.getAddress())) || null;
  } catch (e) {
    return null;
  }
}

function _isSigner(signer) {
  return !!(signer && signer._isSigner);
}

function _isProvider(provider) {
  return !!(provider && provider._isProvider);
}

function _isWallet(wallet) {
  initEthers();
  if (_isSigner(wallet) && wallet instanceof ethers.Wallet) return true;
  return false;
}

function getGlobalObject() {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw new Error("cannot find the global object");
}
