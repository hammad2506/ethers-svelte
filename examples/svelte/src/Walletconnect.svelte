<script>
  import { ethers, createChainStore } from "../../../dist/index";
  const { useWeb3Provider, chainStore, signer, provider, account } = createChainStore();

  const Web3Modal = window.Web3Modal.default;
  const WalletConnectProvider = window.WalletConnectProvider.default;

  const web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "27e484dcd9e3efcfd25a83a78777cdf1",
        },
      },
    },
  });

  function connect() {
    web3Modal.connect().then((provider) => {
      useWeb3Provider(provider).then(init);
    });
  }

  function init() {}
</script>

{#if !$account}
  <button class="connectButton" on:click={connect}>Connect To Wallet</button>
{:else}
  <main>
    <h3>Connected to {$account}</h3>
  </main>
{/if}

<style land="scss">
  .connectButton {
    height: 60px;
    padding-top: 8px;
    margin-top: 20%;
  }

  h3 {
    margin: auto;
    padding-top: 200px;
  }
</style>
