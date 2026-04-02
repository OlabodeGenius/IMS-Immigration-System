import { readFileSync, writeFileSync, mkdirSync } from "fs";
import ganache from "ganache";
import { ethers } from "ethers";
import solc from "solc";

const source = readFileSync("./contracts/StudentLedger.sol", "utf8");

const input = {
    language: "Solidity",
    sources: { "StudentLedger.sol": { content: source } },
    settings: {
        outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
    },
};

console.log("🔨 Compiling StudentLedger.sol ...");
const compiled = JSON.parse(solc.compile(JSON.stringify(input)));

if (compiled.errors?.some((e) => e.severity === "error")) {
    console.error(compiled.errors);
    process.exit(1);
}

const contract = compiled.contracts["StudentLedger.sol"]["StudentLedger"];
const abi = contract.abi;
const bytecode = "0x" + contract.evm.bytecode.object;
console.log("✅ Compilation successful.");

const PORT = 8545;

try {
    const { execSync } = await import("child_process");
    execSync(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true`, { stdio: "ignore" });
    console.log(`🔧 Cleared port ${PORT}`);
} catch { }

const server = ganache.server({ wallet: { totalAccounts: 2 }, logging: { quiet: true } });
await server.listen(PORT);
console.log(`\n🌐 Ganache node live at http://127.0.0.1:${PORT}`);

const ganacheProvider = server.provider;
const accountsRaw = await ganacheProvider.request({ method: "eth_accounts", params: [] });
const initialAccounts = await ganacheProvider.getInitialAccounts();
const deployerAddress = accountsRaw[0];
const deployerPrivateKey = initialAccounts[deployerAddress].secretKey;
console.log(`  Deployer: ${deployerAddress}`);

const provider = new ethers.JsonRpcProvider(`http://127.0.0.1:${PORT}`);
const wallet = new ethers.Wallet(deployerPrivateKey, provider);

const factory = new ethers.ContractFactory(abi, bytecode, wallet);
const deployed = await factory.deploy();
await deployed.waitForDeployment();
const contractAddress = await deployed.getAddress();
console.log(`\n📄 StudentLedger deployed at: ${contractAddress}`);

const info = {
    contractAddress,
    abi,
    rpcUrl: `http://127.0.0.1:${PORT}`,
    deployerAddress,
    deployerPrivateKey,
};

mkdirSync("./artifacts", { recursive: true });
writeFileSync("./artifacts/deployment.json", JSON.stringify(info, null, 2));
console.log("\n✅ Saved to blockchain/artifacts/deployment.json");
console.log("⚡ Local blockchain node is running. Press Ctrl+C to stop.\n");
