<script>
  import Metamask from "./Metamask.svelte";
  import WalletConnect from "./Walletconnect.svelte";
  import Rpc from "./Rpc.svelte";

  let HOME_CMP = "HOME";
  let cmp = HOME_CMP;

  function changeCmp(_cmp) {
    cmp = _cmp;
  }
</script>

<main>
  {#if cmp === HOME_CMP}
    <div class="container">
      <h1>Welcome to Ethers Svelte</h1>
      <h5>Choose the example types from below:</h5>
      <div class="appContainer">
        <div class="item">
          <button on:click={changeCmp.bind(null, Metamask)}>Metamask</button>
          <span>A simple connection with metamask that allows you to send a transaction. (donate an amount to me)</span>
        </div>
        <div class="item">
          <button on:click={changeCmp.bind(null, WalletConnect)}>Web3 Modal</button>
          <span>A web3 Modal connected with Wallet Connect</span>
        </div>
        <div class="item">
          <button on:click={changeCmp.bind(null, Rpc)}>Infura JSON RPC</button>
          <span>Connect to the Ethereum mainnet using Infure to read from the BNB contract</span>
        </div>
      </div>
    </div>
  {:else}
    <button id="homeBtn" on:click={changeCmp.bind(null, HOME_CMP)}>Back</button>
    <svelte:component this={cmp} />
  {/if}
</main>

<style lang="scss">
  * {
    box-sizing: content-box;
  }

  :global(button) {
    cursor: pointer;
    background: none;
    color: #333;
    border: 1px solid #333;
    border-radius: 6px;
    font-size: 16px;
    padding: 15px 30px;
    margin: 0;
    text-decoration: none;

    &:hover {
      background: lightgray;
    }
  }

  main {
    position: relative;
    text-align: center;
    padding: 0.3em;
    color: rgb(31, 27, 27);

    #homeBtn {
      position: fixed;
      top: 35px;
      left: 20px;
      z-index: 10;
    }
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  .appContainer {
    text-align: left;
    padding: 30px 80px;
    margin: auto;
    width: 90%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .item {
      display: flex;
      align-items: center;
      padding: 20px 10px;

      span {
        padding: 0px 20px;
        font-size: 18px;
        color: dimgray;
      }
    }
  }
</style>
