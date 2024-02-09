from keeper import Keeper
from gasProvider import GasProvider
import sha3
from eth_account import Account
from threading import Thread

config = {
    'endpoint': "https://base.org",
    'sleepTime': 10,
    'gasProvider': "",
    'tokens': {
        'usdc': "0xeDc16F500dBb061449Fb46A6AB4701F9310c3928",
        'btc': "0x795356E1B93190aB641C711b7c69E56eaC4522c0",
        'eth': "0x4200000000000000000000000000000000000006",
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
