import hre from "hardhat";

async function main() {
    const StudentLedger = await hre.ethers.getContractFactory("StudentLedger");
    const ledger = await StudentLedger.deploy();

    await ledger.waitForDeployment();

    console.log("StudentLedger deployed to:", await ledger.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
