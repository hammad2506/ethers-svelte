<script>
  import { ethers, createChainStore } from "../../../dist/index";
  const { useWeb3Provider, chainStore: metamask, signer, provider } = createChainStore();

  useWeb3Provider().then(init);

  async function init() {}

  let [etherBalance, chainId, networkName] = [0, "", "", 0];

  async function onAccountChange(account) {
    if (!account) return;
    if (!$signer) return console.warn("No Signer ");
    etherBalance = formatValue(await $signer.getBalance());
    chainId = $metamask.chainId;
    networkName = $metamask?.chainData?.name;
  }

  $: onAccountChange($metamask.account);

  let [addressForBalanceCheck, balanceForAddress] = ["", 0];

  async function checkAccountBalance() {
    try {
      const address = ethers.utils.getAddress(addressForBalanceCheck);
      const val = await $provider.getBalance(address);
      balanceForAddress = formatValue(val);
    } catch (e) {
      console.log(e);
      alert("Make sure a valid address is entered");
    }
  }

  let donationAmount = 0;
  const donationAddress = "0x02b6887b5FaEA13737B0dc32436caCfBee6f82Bf";

  async function donateAmount() {
    if (donationAmount <= 0) {
      console.error("Enter a valid amount");
      alert("Amount cannot be 0 or less");
      return;
    }

    if (donationAmount > 0.1) {
      alert("You just entered a value greater than 0.1 Ether. Thank you for the support but the max we can accept is 0.1 ETH");
      return;
    }

    const address = ethers.utils.getAddress(donationAddress);
    const amount = ethers.utils.parseEther(String(donationAmount));

    const tx = await $signer.sendTransaction({
      gasLimit: 21000,
      to: address,
      value: amount,
    });

    await tx.wait();
    alert("Wow!! Thanks for the donation");
  }

  function formatValue(bigNumber = 0) {
    return ethers.utils.formatUnits(bigNumber, 18);
  }
</script>

<main>
  {#if !$metamask.account}
    <button class="connectButton" on:click={() => useWeb3Provider()}>Connect To Wallet</button>
  {:else}
    <div class="header">
      <h1>Playground</h1>
    </div>
    <div class="container">
      <div class="actionItem">
        <p>
          Welecome to the Metamask example. After you are connected to your wallet, you can get some information about your account. You can also send a transaction and donate to
          us.
        </p>
        <h4>Your Account Balance: {etherBalance}</h4>
        <h4>You are connected to the {networkName} network</h4>
        <h4>The Chain Id is {chainId}</h4>
      </div>
      <hr />
      <div class="actionItem">
        <h5>Check the Eth balance for an address:</h5>
        <input type="text" bind:value={addressForBalanceCheck} placeholder="Address to check" />
        <button on:click={checkAccountBalance}>Check Balance</button>
        {#if balanceForAddress}
          <p>The balance for addreess {addressForBalanceCheck} is {balanceForAddress}</p>
        {/if}
      </div>
      <div class="actionItem">
        <h5>Donate/Tip an amount? In ether:</h5>
        <input type="number" min={0} max={0.1} step={0.01} bind:value={donationAmount} placeholder="Amount of tokens" />
        <button on:click={donateAmount}>Donate an amount</button>
      </div>
    </div>
  {/if}
</main>

<style lang="scss">
  .connectButton {
    height: 60px;
    padding-top: 8px;
    margin-top: 20%;
  }

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
