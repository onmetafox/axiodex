from keeper import Keeper
from gasProvider import GasProvider
import sha3
from eth_account import Account
from threading import Thread

config = {
    'endpoint': "https://rpc.v4.testnet.pulsechain.com",
    'sleepTime': 9,
    'gasProvider': "0xa0ac723c47c750b1aad4923d70e23257698debac7bdafd0afcf79713707eaaf9",
    'tokens': {
        'usdc': "0x598d812240983501fb074781a0225cB026900e3e",
        'btc': "0xDc78a8443EA62cDFd56B18D1A5Db9b1eF31e1E6C",
        'eth': "0xf6aaFB97EFe4d723E7EF03ff225174293213eEc3",
        # 'bnb': "0x4826533B4897376654Bb4d4AD88B7faFD0C98528",
        'pls': "0xe90563aB3ebFe5978F0D96d94110BdCC06ed4708",
        # 'bone': "0xe52198b893caa2f3691708534591d44b599d5007",
        'hex': "0x196B5355757E2eccC70Fb118f5653336Bb0F222e",
        # 'shib': "0xaB3d36925958fad37BBcfB6Cb5A3C2ae09cB41b7",
        # 'leash': "0x09D70a09a2EeEb8Cf4e698F5633f883Cb690D0e5",
    }
}

if __name__ == "__main__":
    keepers = list()
    wallets = list()
    # pvkeys = list()
    # for key in ['tail local keeper', 'tail backend keeper']:
    #     hasher = sha3.keccak_256()
    #     hasher.update(key.encode('ascii'))
    #     pvkeys.append(hasher.hexdigest())
    #     wallets.append(Account.from_key(hasher.hexdigest()).address)
    #     print(key, Account.from_key(hasher.hexdigest()).address)
    for token in config['tokens']:
        pvkeys = list()
        for i in range(6):
            hasher = sha3.keccak_256()
            hasher.update(('AxionDex:' + token.upper() + ':PriceFeed:' + str(i)).encode('ascii'))
            # print('AxionDex:' + token.upper() + ':PriceFeed:' + str(i), Account.from_key(hasher.hexdigest()).address)
            pvkeys.append(hasher.hexdigest())
            wallets.append(Account.from_key(hasher.hexdigest()).address)
        keepers.append(Keeper(
            token=token, 
            wallets=pvkeys,
            endpoint=config['endpoint'], 
            address=config['tokens'][token], 
            sleepTime=config['sleepTime']
        ))
    GasProvider(endpoint=config['endpoint'], privateKey=config['gasProvider'], wallets=wallets)
    for keeper in keepers:
        keeper.start()
