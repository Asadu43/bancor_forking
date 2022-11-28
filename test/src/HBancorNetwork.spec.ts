import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, BigNumber, Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import hre, { ethers } from "hardhat";
import { Impersonate } from "../utils/utilities";

const USDC_TOKEN = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const WETH_TOKEN = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const FRAX = "0x853d955aCEf822Db058eb8505911ED77F175b99e";
const ALETH = "0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6";
const BNT = "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C";
const bnBNT = "0xab05cf7c6c3a288cd36326e4f7b8600e7268e344";
const vBNT = "0x48Fb253446873234F2fEBbF9BdeAA72d9d387f94";

let withdrawNo: any;

describe.only("Bancor ", function () {
  let signer: SignerWithAddress;
  let user: SignerWithAddress;
  let bancor: Contract;
  let recipient: Contract;
  let bnbnt: Contract;
  let bnt: Contract;
  let vbnt: Contract;

  before(async () => {
    signer = await Impersonate("0x5b698CB96575f62c99cC204c99Fa448353E124F4");
    user = await Impersonate("0x7713974908Be4BEd47172370115e8b1219F4A5f0");

    bancor = await ethers.getContractAt("IBancorNetwork", "0xeEF417e1D5CC832e619ae18D2F140De2999dD4fB", signer);
    const TestFlashLoanRecipient = await ethers.getContractFactory("TestFlashLoanRecipient");
    recipient = await TestFlashLoanRecipient.deploy(bancor.address);

    bnbnt = await ethers.getContractAt("IERC20", bnBNT, signer);
    bnt = await ethers.getContractAt("IERC20", BNT, signer);
    vbnt = await ethers.getContractAt("IERC20", vBNT, signer);
  });

  it("Desposit", async function () {

    await bnt.connect(signer).approve(bancor.address, parseEther("10"))
    await bancor.connect(signer).deposit(bnt.address, parseEther("5"), { value: parseEther("0") })
  })

  it("Init Withdrawal", async function () {

    await bnbnt.connect(signer).approve(bancor.address, parseEther("10"))
    const result = await bancor.connect(signer).initWithdrawal(bnbnt.address, parseEther("1"))

    let res = await result.wait();
    withdrawNo = res.events[2].args.requestId;
  })

  it("Withdraw", async function () {

    await vbnt.connect(signer).approve(bancor.address, parseEther("10"))
    await bancor.connect(signer).withdraw(withdrawNo)
  })


  it("FlashLoan", async function () {
    await bancor.connect(signer).flashLoan(bnt.address, parseEther("2"), recipient.address, "0x")

  })


});
