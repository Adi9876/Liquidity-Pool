import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  // Deploy Token1
  const Token1 = await hre.ethers.getContractFactory("Token1");
  const token1 = await Token1.deploy(ethers.utils.parseEther("1000000")); // 1,000,000 initial supply
  await token1.deployed();
  console.log("Token1 deployed to:", token1.address);

  // Deploy Token2
  const Token2 = await hre.ethers.getContractFactory("Token2");
  const token2 = await Token2.deploy(ethers.utils.parseEther("1000000")); // 1,000,000 initial supply
  await token2.deployed();
  console.log("Token2 deployed to:", token2.address);

  // Deploy LiquidityPool
  const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
  const liquidityPool = await LiquidityPool.deploy(
    token1.address,
    token2.address
  );
  await liquidityPool.deployed();
  console.log("LiquidityPool deployed to:", liquidityPool.address);

  console.log("\nDeployment complete:");
  console.log(`Token1 Address: ${token1.address}`);
  console.log(`Token2 Address: ${token2.address}`);
  console.log(`LiquidityPool Address: ${liquidityPool.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
