const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
  const provier = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const encrypedJson = fs.readFileSync("./.encryptedKey.json", "utf-8");
  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    encrypedJson,
    process.env.PRIVATE_KEY_PASSWORD
  );

  wallet = await wallet.connect(provier);
  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf-8");
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf-8"
  );

  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("Deploying...");
  const contract = await contractFactory.deploy();
  const transactionReceipt = await contract.deployTransaction.wait(1);
  console.log("Deployed!!!");

  let currentFavoriteNumber = await contract.retrieve();
  console.log(`Current favorite number: ${currentFavoriteNumber.toString()}`);

  const txResponse = await contract.store("7");
  const txReceipt = await txResponse.wait(1);
  // console.log(txReceipt);

  currentFavoriteNumber = await contract.retrieve();
  console.log(`Current favorite number: ${currentFavoriteNumber.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
