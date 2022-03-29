import React, { useState } from "react";
import { Button, Divider, Input, Collapse } from "antd";

import { Contract, ContestContract, CreateContestModal, CreateGenericVotesTokenModal, CreateERC20VotesWrapperModal } from "../components";
import DeployedContestContract from "../contracts/bytecodeAndAbi/Contest.sol/Contest.json";
import DeployedGenericVotesTokenContract from "../contracts/bytecodeAndAbi/GenericVotesToken.sol/GenericVotesToken.json";
import DeployedERC20VotesWrapperContract from "../contracts/bytecodeAndAbi/ERC20VotesWrapper.sol/ERC20VotesWrapper.json";

const { Panel } = Collapse;

export default function ContestsPage({targetNetwork, price, signer, provider, mainnetProvider, address, gasPrice, blockExplorer}) {

  const [contestSearchInput, setContestSearchInput] = useState("");
  const [fullContestSearchInput, setFullContestSearchInput] = useState("");
  const [tokenSearchInput, setTokenSearchInput] = useState("");
  const [wrapperSearchInput, setWrapperSearchInput] = useState("");
  const [isCreateContestModalVisible, setIsCreateContestModalVisible] = useState(false);  
  const [isCreateTokenModalVisible, setIsCreateTokenModalVisible] = useState(false);  
  const [isCreateWrapperModalVisible, setIsCreateWrapperModalVisible] = useState(false);  
  const [resultMessage, setResultMessage] = useState("")
  
  function generateCustomConfigBase() {
    let customConfigBase = {};
    customConfigBase["deployedContracts"] = {};
    customConfigBase["deployedContracts"][targetNetwork.chainId] = {};
    return customConfigBase;
  }

  function generateCustomContestConfig(fullContest) {
    let customContestConfig = generateCustomConfigBase();
    customContestConfig["deployedContracts"][targetNetwork.chainId][targetNetwork.name] =
      {
        chainId: targetNetwork.chainId.toString(),
        contracts: {
          Contest: {
            abi: DeployedContestContract.abi,
            address: fullContest ? fullContestSearchInput : contestSearchInput
          }
        },
        name: targetNetwork.name
      }
    return customContestConfig;
  }
  
  function generateCustomTokenConfig(address) {
    let customTokenConfig = generateCustomConfigBase();
    customTokenConfig["deployedContracts"][targetNetwork.chainId][targetNetwork.name] =
      {
        chainId: targetNetwork.chainId.toString(),
        contracts: {
          GenericVotesToken: {
            abi: DeployedGenericVotesTokenContract.abi,
            address: address
          }
        },
        name: targetNetwork.name
      }
    return customTokenConfig;
  }
  
  function generateCustomWrapperConfig() {
    let customWrapprConfig = generateCustomConfigBase();
    customWrapprConfig["deployedContracts"][targetNetwork.chainId][targetNetwork.name] =
      {
        chainId: targetNetwork.chainId.toString(),
        contracts: {
          ERC20VotesWrapper: {
            abi: DeployedERC20VotesWrapperContract.abi,
            address: wrapperSearchInput
          }
        },
        name: targetNetwork.name
      }
    return customWrapprConfig;
  }

  const showContestModal = () => {
    setIsCreateContestModalVisible(true);
  };

  const showTokenModal = () => {
    setIsCreateTokenModalVisible(true);
  };

  const showWrapperModal = () => {
    setIsCreateWrapperModalVisible(true);
  };
  
  return (
    <div style={{ border: "1px solid #cccccc", padding: 16, width: 800, margin: "auto", marginTop: 24 }}>
      <Button onClick={() => {window.location.reload();}}>Refresh Page</Button>
      <Button type="primary" onClick={showTokenModal}>
        Create Generic Votes Token
      </Button>
      <Button type="primary" onClick={showContestModal}>
        Create Contest
      </Button>
      <CreateContestModal 
        modalVisible={isCreateContestModalVisible} 
        setModalVisible={setIsCreateContestModalVisible} 
        setResultMessage={setResultMessage} 
        signer={signer}
      />
      <CreateGenericVotesTokenModal 
        modalVisible={isCreateTokenModalVisible} 
        setModalVisible={setIsCreateTokenModalVisible} 
        setResultMessage={setResultMessage} 
        signer={signer}
      />
      <CreateERC20VotesWrapperModal 
        modalVisible={isCreateWrapperModalVisible} 
        setModalVisible={setIsCreateWrapperModalVisible} 
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
        <ContestContract
          price={price}
          signer={signer}
          provider={provider}
          mainnetProvider={mainnetProvider}
          userAddress={address}
          blockExplorer={blockExplorer}
          contestContractConfig={generateCustomContestConfig(false)}
          tokenContractConfigGenerator={generateCustomTokenConfig}
          chainId={targetNetwork.chainId}
        />
      : ""}
      <Divider />
      <h4>Below are fields with which you can search the address of Contest and ERC20Votes types of contracts and access their full function lists</h4>
      <div>
        <Input icon='search' placeholder='Search Contest full contract functions' value={fullContestSearchInput} onChange={(e) => setFullContestSearchInput(e.target.value.trim().replace(/['"]+/g, ''))} />
      </div>
      {fullContestSearchInput != "" ?
          <Contract
            name="Contest"
            price={price}
            signer={signer}
            provider={provider}
            address={address}
            blockExplorer={blockExplorer}
            contractConfig={generateCustomContestConfig(true)}
            chainId={targetNetwork.chainId}
          />
        : ""
      }
      <div>
        {/* Get rid of any whitespace or extra quotation marks */}
        <Input icon='search' placeholder='Search ERC20Votes full contract functions' value={tokenSearchInput} onChange={(e) => setTokenSearchInput(e.target.value.trim().replace(/['"]+/g, ''))} />
      </div>
      {tokenSearchInput != "" ? 
        <Contract
          name="GenericVotesToken"
          price={price}
          signer={signer}
          provider={provider}
          address={address}
          blockExplorer={blockExplorer}
          contractConfig={generateCustomTokenConfig(tokenSearchInput)}
          chainId={targetNetwork.chainId}
        /> 
      : ""}
      <Divider />
      <Collapse>
        <Panel header="Want to wrap a pre-existing ERC20 to have ERC20Votes functionality?" key="1">
          <h4>Below are the tools to wrap a given ERC20 token in order to add <a href="https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Votes">ERC20Votes</a> functionality to it.</h4>
          <Button type="primary" onClick={showWrapperModal}>
            Create ERC20Votes Wrapper Token
          </Button>
          <div>
            {/* Get rid of any whitespace or extra quotation marks */}
            <Input icon='search' placeholder='Search ERC20VotesWrapper full contract functions' value={wrapperSearchInput} onChange={(e) => setWrapperSearchInput(e.target.value.trim().replace(/['"]+/g, ''))} />
          </div>
          {wrapperSearchInput != "" ? 
            <Contract
              name="ERC20VotesWrapper"
              price={price}
              signer={signer}
              provider={provider}
              address={address}
              blockExplorer={blockExplorer}
              contractConfig={generateCustomWrapperConfig()}
              chainId={targetNetwork.chainId}
            /> 
          : ""}
        </Panel>
      </Collapse>
    </div>
  );
}
