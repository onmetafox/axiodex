from keeper import Keeper
from gasProvider import GasProvider
import sha3
from eth_account import Account
from threading import Thread

config = {
    'endpoint': "https://goerli.base.org",
    'sleepTime': 9,
    'gasProvider': "",
    'tokens': {
        'usdc': "0xb85765935B4d9Ab6f841c9a00690Da5F34368bc0",
        'btc': "0xAC15714c08986DACC0379193e22382736796496f",
        'eth': "0xcD2A119bD1F7DF95d706DE6F2057fDD45A0503E2",
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
            print(hasher.hexdigest());
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
