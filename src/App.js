import logo from './logo.svg';
import './App.css';
import {idlFactory as ledgerIDL} from "./ledger.did.js";
import {getAccountId} from "./principalToAccountID";
import {useEffect, useState} from "react";


function App() {
  const [actor, setActor] = useState();
  const [principal, setPrincipal] = useState();
  const [balance, setBalance] = useState();
  const [recipient, setRecipient] = useState();
  const [amount, setAmount] = useState();
  console.log(balance);
  const connectPlug = async () => {
    console.log("connectPlug");
    if (!(await window.ic.plug.isConnected())) {
      const connected = await window.ic.plug.requestConnect({
        whitelist: ["jwcfb-hyaaa-aaaaj-aac4q-cai"],
      });
      console.log(connected);
      if (connected === "denied")
        throw new Error("Error with plug.requestConnect");
    }

    console.log("connectPlug1");
    await window.ic.plug.createAgent({
      whitelist: ["jwcfb-hyaaa-aaaaj-aac4q-cai"],
      host: "https://boundary.ic0.app",
    });

    console.log("connectPlug2");
    const actor = await window.ic.plug.createActor({
      canisterId: "jwcfb-hyaaa-aaaaj-aac4q-cai",
      interfaceFactory: ledgerIDL,
    });

    const plugPrincipal = await window.ic.plug.agent.getPrincipal();
    window.localStorage.setItem("loggedIn", "plug");

    const ogyBalance = (await actor.account_balance_dfx({
      account: getAccountId(plugPrincipal),
    }));
    return {
      principal: plugPrincipal,
      actor,
      ogyBalance,
    };
  };

  const handleSendOGY = async () => {
    const blockHeight = await actor.send_dfx({
      to: recipient,
      fee: {
        e8s: 2000000n,
      },
      memo: 0n,
      from_subaccount: [],
      created_at_time: [],
      // eslint-disable-next-line no-undef
      amount: { e8s: BigInt(amount) },
    });
    console.log();
  };

  useEffect(() => {
    console.log("effect");
      connectPlug().then((data) => {
        console.log(data);
        setBalance(data.ogyBalance);
        setActor(data.actor);
        setPrincipal(data.principal);
      })
        .catch(console.log)
        .finally(() => console.log("asd"));
  }, [])

  return (
    <div className="App">
      <p>Your balace: <b>{balance?.e8s.toString()} OGY</b></p>
      <br/>
      <input type="text" placeholder="Receiver AccountID" value={recipient} onChange={(e) => setRecipient(e.target.value)}/>
      <br/>
      <br/>
      <input type="number" placeholder="amount (Natural value)" value={amount} onChange={(e) => setAmount(e.target.value)}/>
      <br/>
      <br/>
      <button onClick={handleSendOGY}>Send</button>
    </div>
  );
}

export default App;
