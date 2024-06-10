import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(0);
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [notification, setNotification] = useState('');

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(new ethers.providers.Web3Provider(window.ethereum));
    }
  };

  const handleAccount = async () => {
    if (ethWallet) {
      const accounts = await ethWallet.listAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        alert("No account found");
      }
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    await ethWallet.send("eth_requestAccounts", []);
    handleAccount();
    getATMContract();
  };

  const getATMContract = () => {
    if (ethWallet) {
      const signer = ethWallet.getSigner();
      const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
      setATM(atmContract);
    }
  };

  const deposit = async () => {
    if (atm && amount) {
      const amountInWei = ethers.utils.parseEther(amount);
      await atm.deposit(amountInWei);
      setNotification(`Deposited ${amount} ETH successfully.`);
      setBalance(balance + parseFloat(amount));
    }
  };

  const withdraw = async () => {
    if (atm && amount) {
      if (amount.toLowerCase() === "reset") {
        // Withdraw the full balance to reset it
        const currentBalance = await atm.getBalance(); // Use the correct function name
        const amountInWei = ethers.utils.parseEther(ethers.utils.formatEther(currentBalance)); // Convert the balance correctly
        await atm.withdraw(amountInWei);
        setBalance(0); // Reset local balance state
        setNotification("Balance reset to 0.");
      } else {
        const amountInWei = ethers.utils.parseEther(amount);
        await atm.withdraw(amountInWei);
        setNotification(`Withdrawn ${amount} ETH successfully.`);
        setBalance(balance - parseFloat(amount));
      }
    }
  };

  const withdrawHalfBalance = async () => {
    if (atm && balance) {
      const amountToWithdraw = ethers.utils.parseEther((balance / 2).toString());
      await atm.withdraw(amountToWithdraw);
      setNotification("Withdrawn 50% of the total balance successfully.");
      setBalance(balance - (balance / 2));
    }
  };

  const transferEth = async () => {
    if (ethWallet && receiverAddress && amount) {
      const signer = ethWallet.getSigner();
      const amountInWei = ethers.utils.parseEther(amount);
      const transaction = await signer.sendTransaction({
        to: receiverAddress,
        value: amountInWei,
      });
      await transaction.wait();
      setNotification(`Transferred ${amount} ETH successfully.`);
      getBalance();
    }
  };

  const getBalance = async () => {
    if (atm) {
      const depositedBalance = await atm.getBalance(); // Use the correct function name
      setBalance(ethers.utils.formatEther(depositedBalance)); // Convert the balance to a readable format
    }
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header><h1>Welcome to Jayster</h1></header>
      <div className="center">
        {account ? (
          <div>
            <p>Your Account: {account}</p>
            <p>Total Deposited Balance: {balance} ETH</p>
            <div className="input-group">
              <input
                type="text"
                placeholder="Receiver Address"
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
              />
              <input
                type="text"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button onClick={transferEth}>Transfer ETH</button>
            </div>
            <div className="button-group">
              <button onClick={deposit}>Deposit</button>
              <button onClick={withdraw}>Withdraw</button>
              <button onClick={withdrawHalfBalance}>Withdraw 50%</button>
            </div>
            {notification && <p>{notification}</p>}
          </div>
        ) : (
          <button onClick={connectAccount}>Connect with MetaMask</button>
        )}
      </div>
      <style jsx>{`
        .container {
          text-align: center;
        }
        .center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .input-group {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .input-group input {
          margin-right: 10px;
          padding: 8px;
          width: 200px;
        }
        .button-group button {
          margin: 5px;
          padding: 8px;
          width: 200px;
        }
      `}</style>
    </main>
  );
}
