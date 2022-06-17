import React, { useState, useEffect } from "react";
import { Button, Input, Collapse, notification } from "antd";
import { useLocation } from "react-router-dom";

import { ContestContract, CreateContestModal, CreateGenericVotesTimestampTokenModal, CreateContestCrowdsaleModal } from "../components";
import DeployedContestContract from "../contracts/bytecodeAndAbi/Contest.sol/Contest.json";

const { Panel } = Collapse;

export default function ContestsPage({targetNetwork, price, signer, provider, mainnetProvider, address, blockExplorer}) {

  const [contestSearchInput, setContestSearchInput] = useState("");
  const [isCreateCrowdsaleModalVisible, setIsCreateCrowdsaleModalVisible] = useState(false);
  const [isCreateContestModalVisible, setIsCreateContestModalVisible] = useState(false);
  const [isCreateTokenModalVisible, setIsCreateTokenModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const location = useLocation();
  
  function generateCustomConfigBase() {
    let customConfigBase = {};
    customConfigBase["deployedContracts"] = {};
    customConfigBase["deployedContracts"][targetNetwork.chainId] = {};
    return customConfigBase;
  }

  function generateCustomContestConfig() {
    let customContestConfig = generateCustomConfigBase();
    customContestConfig["deployedContracts"][targetNetwork.chainId][targetNetwork.name] =
      {
        chainId: targetNetwork.chainId.toString(),
        contracts: {
          Contest: {
            abi: DeployedContestContract.abi,
            address: contestSearchInput
          }
        },
        name: targetNetwork.name
      }
    return customContestConfig;
  }
  
  const showCrowdsaleModal = () => {
    setIsCreateCrowdsaleModalVisible(true);
  };
  
  const showContestModal = () => {
    setIsCreateContestModalVisible(true);
  };

  const showTokenModal = () => {
    setIsCreateTokenModalVisible(true);
  };

  useEffect(() => {
    let linkedContest = new URLSearchParams(location.search).get("linked_contest");
    if (linkedContest != null){
      setContestSearchInput(linkedContest);
    } else {
      if(window.localStorage.getItem('currentContest') != null) {
        setContestSearchInput(window.localStorage.getItem('currentContest'));
      }
    }
  }, []);
  
  useEffect(() => {
    let linkedContest = new URLSearchParams(location.search).get("linked_contest");
    if (linkedContest == null){
      if((contestSearchInput != null) && (contestSearchInput != "null")) {
        window.localStorage.setItem('currentContest', contestSearchInput);
      }
    }
  }, [contestSearchInput]);
  
  
  return (
    <div style={{ border: "1px solid #cccccc", padding: 16, width: 900, margin: "auto", marginTop: 24 }}>
      <Button onClick={() => {window.location.reload();}}>Refresh</Button>
      <Button type="primary" onClick={showTokenModal}>
        Create Voting Token
      </Button>
      <Button type="primary" onClick={showContestModal}>
        Create Contest
      </Button>
      <Button type="primary" onClick={showCrowdsaleModal}>
        Create Crowdsale
      </Button>
      <CreateContestModal 
        modalVisible={isCreateContestModalVisible} 
        setModalVisible={setIsCreateContestModalVisible} 
        setResultMessage={setResultMessage} 
        signer={signer}
      />
      <CreateGenericVotesTimestampTokenModal 
        modalVisible={isCreateTokenModalVisible} 
        setModalVisible={setIsCreateTokenModalVisible} 
        setResultMessage={setResultMessage} 
        signer={signer}
      />
      <CreateContestCrowdsaleModal 
        modalVisible={isCreateCrowdsaleModalVisible} 
        setModalVisible={setIsCreateCrowdsaleModalVisible} 
        setResultMessage={setResultMessage} 
        signer={signer}
      />
      <Button onClick={() => setResultMessage("")}>Clear message</Button>
      <div>
        <p>{resultMessage}</p>
      </div>
      <div>
        {/* Get rid of any whitespace or extra quotation marks */}
        <Input icon='search' placeholder='Enter Contest contract address here' value={contestSearchInput} onChange={(e) => setContestSearchInput(e.target.value.trim().replace(/['"]+/g, ''))} />
      </div>
      {contestSearchInput != "" ? 
        <div>
          <Button onClick={() => {
            navigator.clipboard.writeText("https://jokedao.io/?linked_contest=" + contestSearchInput + "&linked_network=" + targetNetwork.rawName);
            notification.info({
              message: "Copied to clipboard",
              description: "https://jokedao.io/?linked_contest=" + contestSearchInput + "&linked_network=" + targetNetwork.rawName,
              placement: "bottomRight",
            });}}
            >Copy contest link to clipboard
          </Button>
          <ContestContract
            name="Contest"
            price={price}
            signer={signer}
            provider={provider}
            mainnetProvider={mainnetProvider}
            userAddress={address}
            blockExplorer={blockExplorer}
            contractConfig={generateCustomContestConfig()}
            chainId={targetNetwork.chainId}
          />
        </div>
      : ""}
    </div>
  );
}
