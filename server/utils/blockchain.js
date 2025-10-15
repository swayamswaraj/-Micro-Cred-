import Web3 from "web3";

const web3 = new Web3(process.env.WEB3_PROVIDER);
const account = web3.eth.accounts.privateKeyToAccount(
  process.env.WALLET_PRIVATE_KEY
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

/**
 * Sends a simple transaction containing the hash as data.
 * Returns tx hash.
 */
export async function anchorHashOnBlockchain(fileHash) {
  const tx = {
    from: account.address,
    to: account.address, // self-transfer with hash embedded
    value: "0x0",
    gas: 21000,
    data: web3.utils.asciiToHex(fileHash.slice(0, 64)),
  };
  const signed = await web3.eth.accounts.signTransaction(
    tx,
    process.env.WALLET_PRIVATE_KEY
  );
  const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
  return receipt.transactionHash;
}
