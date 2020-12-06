// @ts-nocheck

async function UpdateContractOfSaleConversation(contractofSalesMe: IContractofSaleResponse[]): Promise<void> {
    let myVar = contractOfSalesMe.find((x: IContractofSaleResponse) => x.Id == conversationEventHubResponse.ContractofSaleId);
    return myVar;
}