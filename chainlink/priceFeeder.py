from keeper import Keeper
from gasProvider import GasProvider
import sha3
from eth_account import Account
from threading import Thread

config = {
    'endpoint': "https://goerli.base.org",
    'sleepTime': 9,
    'gasProvider': "0xa0ac723c47c750b1aad4923d70e23257698debac7bdafd0afcf79713707eaaf9",
    'tokens': {
        'usdc': "0x598d812240983501fb074781a0225cB026900e3e",
        'btc': "0xDc78a8443EA62cDFd56B18D1A5Db9b1eF31e1E6C",
        'eth': "0xf6aaFB97EFe4d723E7EF03ff225174293213eEc3",
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
