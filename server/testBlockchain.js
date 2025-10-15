import dotenv from "dotenv";
dotenv.config();
import Web3 from "web3";

(async () => {
  try {
    const web3 = new Web3(process.env.SEPOLIA_RPC_URL);
    const pk = process.env.WALLET_PRIVATE_KEY;

    if (!pk || !pk.startsWith("0x")) {
      throw new Error("Invalid private key in .env (must start with 0x)");
    }

    const acct = web3.eth.accounts.privateKeyToAccount(pk);
    console.log("Address:", acct.address);

    const balance = await web3.eth.getBalance(acct.address);
    console.log("Sepolia balance (ETH):", web3.utils.fromWei(balance, "ether"));
  } catch (err) {
    console.error("Test failed:", err.message || err);
  }
})();
