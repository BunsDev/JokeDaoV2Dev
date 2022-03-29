import { Button, Col, Divider, Input, Row, Tooltip } from "antd";
import React, { useState } from "react";
import Blockies from "react-blockies";

import { Transactor } from "../../helpers";
import { tryToDisplay, tryToDisplayAsText } from "./utils";

const { utils, BigNumber } = require("ethers");

const getFunctionInputKey = (functionInfo, input, inputIndex) => {
  const name = input?.name ? input.name : "input_" + inputIndex + "_";
  return functionInfo.name + "_" + name + "_" + input.type;
};

export default function FunctionForm({ tokenContractConfig, tokenContractFunction, tokenFunctionInfo, provider, gasPrice, triggerRefresh }) {
  const [form, setForm] = useState({});
  const [txValue, setTxValue] = useState();
  const [returnValue, setReturnValue] = useState();

  const tx = Transactor(provider, gasPrice);

  const inputs = tokenFunctionInfo.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(tokenFunctionInfo, input, inputIndex);

    let buttons = "";
    if (input.type === "bytes32") {
      buttons = (
        <Tooltip placement="right" title="to bytes32">
          <div
            type="dashed"
            style={{ cursor: "pointer" }}
            onClick={async () => {
              if (utils.isHexString(form[key])) {
                const formUpdate = { ...form };
                formUpdate[key] = utils.parseBytes32String(form[key]);
                setForm(formUpdate);
              } else {
                const formUpdate = { ...form };
                formUpdate[key] = utils.formatBytes32String(form[key]);
                setForm(formUpdate);
              }
            }}
          >
            #️⃣
          </div>
        </Tooltip>
      );
    } else if (input.type === "bytes") {
      buttons = (
        <Tooltip placement="right" title="to hex">
          <div
            type="dashed"
            style={{ cursor: "pointer" }}
            onClick={async () => {
              if (utils.isHexString(form[key])) {
                const formUpdate = { ...form };
                formUpdate[key] = utils.toUtf8String(form[key]);
                setForm(formUpdate);
              } else {
                const formUpdate = { ...form };
                formUpdate[key] = utils.hexlify(utils.toUtf8Bytes(form[key]));
                setForm(formUpdate);
              }
            }}
          >
            #️⃣
          </div>
        </Tooltip>
      );
    } else if (input.type === "uint256") {
      buttons = (
        <Tooltip placement="right" title="* 10 ** 18">
          <div
            type="dashed"
            style={{ cursor: "pointer" }}
            onClick={async () => {
              const formUpdate = { ...form };
              formUpdate[key] = utils.parseEther(form[key]);
              setForm(formUpdate);
            }}
          >
            ✴️
          </div>
        </Tooltip>
      );
    } else if (input.type === "address") {
      const possibleAddress = form[key] && form[key].toLowerCase && form[key].toLowerCase().trim();
      if (possibleAddress && possibleAddress.length === 42) {
        buttons = (
          <Tooltip placement="right" title="blockie">
            <Blockies seed={possibleAddress} scale={3} />
          </Tooltip>
        );
      }
    }

    return (
      <div style={{ margin: 2 }} key={key}>
        <Input
          size="large"
          placeholder={input.name ? input.type + " " + input.name : input.type}
          autoComplete="off"
          value={form[key]}
          name={key}
          onChange={event => {
            const formUpdate = { ...form };
            formUpdate[event.target.name] = event.target.value;
            setForm(formUpdate);
          }}
          suffix={buttons}
        />
      </div>
    );
  });

  const txValueInput = (
    <div style={{ margin: 2 }} key="txValueInput">
      <Input
        placeholder="transaction value"
        onChange={e => setTxValue(e.target.value)}
        value={txValue}
        addonAfter={
          <div>
            <Row>
              <Col span={16}>
                <Tooltip placement="right" title=" * 10^18 ">
                  <div
                    type="dashed"
                    style={{ cursor: "pointer" }}
                    onClick={async () => {
                      const floatValue = parseFloat(txValue);
                      if (floatValue) setTxValue("" + floatValue * 10 ** 18);
                    }}
                  >
                    ✳️
                  </div>
                </Tooltip>
              </Col>
              <Col span={16}>
                <Tooltip placement="right" title="number to hex">
                  <div
                    type="dashed"
                    style={{ cursor: "pointer" }}
                    onClick={async () => {
                      setTxValue(BigNumber.from(txValue).toHexString());
                    }}
                  >
                    #️⃣
                  </div>
                </Tooltip>
              </Col>
            </Row>
          </div>
        }
      />
    </div>
  );

  if (tokenFunctionInfo.payable) {
    inputs.push(txValueInput);
  }

  const handleForm = returned => {
    if (returned) {
      setForm({});
    }
  };

  const buttonIcon = <Button style={{ marginLeft: -32 }}>Submit</Button>
  inputs.push(
    <div style={{ cursor: "pointer", margin: 2 }} key="goButton">
      <Input
        onChange={e => setReturnValue(e.target.value)}
        defaultValue=""
        bordered={false}
        disabled
        value={returnValue}
        suffix={
          <div
            style={{ width: 50, height: 30, margin: 0 }}
            type="default"
            onClick={async () => {
              const args = tokenFunctionInfo.inputs.map((input, inputIndex) => {
                const key = getFunctionInputKey(tokenFunctionInfo, input, inputIndex);
                let value = form[key];
                if (input.baseType === "array") {
                  value = JSON.parse(value);
                } else if (input.type === "bool") {
                  if (value === "true" || value === "1" || value === "0x1" || value === "0x01" || value === "0x0001") {
                    value = 1;
                  } else {
                    value = 0;
                  }
                }
                return value;
              });

              let result;
              if (tokenFunctionInfo.stateMutability === "view" || tokenFunctionInfo.stateMutability === "pure") {
                try {
                  const returned = await tokenContractFunction(...args);
                  handleForm(returned);
                  result = tryToDisplayAsText(returned);
                } catch (err) {
                  console.error(err);
                }
              } else {
                const overrides = {};
                if (txValue) {
                  overrides.value = txValue; // ethers.utils.parseEther()
                }
                // if (gasPrice) {
                //   overrides.gasPrice = gasPrice;
                // }
                // Uncomment this if you want to skip the gas estimation for each transaction
                // overrides.gasLimit = hexlify(1200000);

                // console.log("Running with extras",extras)
                const returned = await tx(tokenContractFunction(...args, overrides));
                handleForm(returned);
                result = tryToDisplay(returned);
              }

              console.log("SETTING RESULT:", result);
              setReturnValue(result);
              triggerRefresh(true);
            }}
          >
            {buttonIcon}
          </div>
        }
      />
    </div>,
  );

  return (
    <div>
      <Row>
        <Col
          span={8}
          style={{
            textAlign: "right",
            paddingRight: 6,
            fontSize: 24,
          }}
        >
          Delegate your votes:
        </Col>
        <Col span={16}>{inputs}</Col>
      </Row>
      <Divider />
    </div>
  );
}
