import { compareVersions } from "compare-versions";
export function getContracts(contractConfig: any, version: string) {
  const commonFunctionNames = [
    "name",
    "creator",
    "numAllowedProposalSubmissions",
    "maxProposalCount",
    "contestStart",
    "contestDeadline",
    "voteStart",
    "prompt",
    "downvotingAllowed",
    "submissionMerkleRoot",
    "votingMerkleRoot",
  ];

  const v4FunctionNames = ["costToPropose", "percentageToCreator"];

  const v4_2FunctionNames = ["sortingEnabled"];

  let contractFunctionNames = [...commonFunctionNames];

  if (compareVersions(version, "4.0") >= 0) {
    contractFunctionNames = [...contractFunctionNames, ...v4FunctionNames];
  }
  if (compareVersions(version, "4.2") >= 0) {
    contractFunctionNames = [...contractFunctionNames, ...v4_2FunctionNames];
  }

  const contracts = contractFunctionNames.map(functionName => ({
    ...contractConfig,
    functionName,
  }));

  return contracts;
}
