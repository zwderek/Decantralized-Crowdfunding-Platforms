## cosmosprj

There is a test account which you can view details in truffle-config.js.

The project is now deployed on Evmos Testnet.

The latest CampaignFactory account address is "0xC2ddBc6138a9150F9ce7409a7099918e90749425".

To compile the contracts: 
'''console
truffle compile
'''

To deploy the contract:
'''console
truffle migrate --network evmos
'''

To enter the console:
'''console
truffle console --network evmos
'''

Then you can directly operate with the Evmos Testnet.
For expample:
'''console
contract = await CampaignFactory.at('0xC2ddBc6138a9150F9ce7409a7099918e90749425')
await contract.getDeployedCampaigns()
'''
