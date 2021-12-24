<script>
  import { ethers, createChainStore, createContractStore } from "../../../dist/index";
  import { abi, contractAddress } from "./contract/BNB";

  const { useJsonRpcProvider, provider } = createChainStore();

  const InfuraRpcUrl = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
  useJsonRpcProvider(InfuraRpcUrl).then(init);

  const contractStore = createContractStore(contractAddress, abi, provider);

  let [totalSupply, name, symbol, owner] = [0, 0, "", "", ""];

  async function init() {
    //All these are functions on the BNB contract
    name = await $contractStore.name();
    totalSupply = await $contractStore.totalSupply();
    symbol = await $contractStore.symbol();
    owner = await $contractStore.owner();
  }

  let [addressForBalanceCheck, balanceForAddress] = ["", 0];

  async function checkAccountBalance() {
    try {
      const address = ethers.utils.getAddress(addressForBalanceCheck);
      const val = await $contractStore.balanceOf(address);
      balanceForAddress = formatValue(val);
    } catch (e) {
      console.log(e);
      alert("Make sure a valid address is entered");
    }
  }

  function formatValue(bigNumber = 0) {
    return ethers.utils.formatUnits(bigNumber, 18);
  }
</script>

<main>
  <div class="header">
    <h1>Playground</h1>
  </div>
  <div class="container">
    <div class="actionItem">
      <p>Welecome to the RPC example. This will show you how to connect to the BNB Contract and run functions on the contract.</p>
      <h4>You are connected to the {name} Contract</h4>
      <h4>The total supply for this token is {totalSupply}</h4>
      <h4>The symbol for this token is {symbol}</h4>
      <h4>The owner address is {owner}</h4>
    </div>
    <hr />
    <div class="actionItem">
      <h5>Check the BNB balance for an address:</h5>
      <input type="text" bind:value={addressForBalanceCheck} placeholder="Address to check" />
      <button on:click={checkAccountBalance}>Check Balance</button>
      {#if balanceForAddress}
        <p>The balance for addreess {addressForBalanceCheck} is {balanceForAddress}</p>
      {/if}
    </div>
  </div>
</main>

<style lang="scss">
  .header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    h1 {
      color: silver;
      font-size: 2em;
      font-weight: 600;
    }
  }

  .container {
    display: flex;
    flex-direction: column;
    width: 90%;
    justify-content: space-between;
    text-align: left;
    margin: auto;
    padding: 30px;
    border-bottom: 1px solid lightgray;

    .actionItem {
      input,
      button {
        margin-right: 12px;
        padding: 10px;
      }

      input {
        min-width: 400px;
        border-radius: 5px;
      }
    }

    hr {
      display: block;
      height: 1px;
      border: 0;
      border-top: 1px solid #ccc;
      margin: 1em 0;
      padding: 0;
    }
  }
</style>
