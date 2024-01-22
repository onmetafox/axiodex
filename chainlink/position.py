from eth_account import Account
from sympy import primorial
from web3 import Web3
import sha3
from gasProvider import GasProvider
from threading import Thread
from keeper import Wallet
import time
import random

config = {
    'endpoint': "https://goerli.base.org",
    'sleepTime': 10,
    'keeper': "",
    'positionRouterAddress': "0x29C973401298772BC78ecc12E548Ce12C3241874",
}

class PositionKeeper(object):
    def __init__(self) -> None:
        self.web3 = Web3(Web3.HTTPProvider(config['endpoint']))
        self.wallet = Wallet(config['endpoint'], config['keeper']);
        self.contract = self.web3.eth.contract(abi=open('abiPositionRouter.json', 'r').read(), address=config['positionRouterAddress'])
    def start(self):
        Thread(target=self.transmit).start()
    def transmit(self):
        print('start position transmit...')
        while True: 
            try:
                tx = self.contract.functions.getRequestQueueLengths().call()
                if tx[1] > tx[0] :
                    print('Increase', tx[0], tx[1])
                    self.wallet.sendTx(self.contract.functions.executeIncreasePositions(tx[1], self.wallet.address))
                if tx[3] > tx[2] :
                    print('Decrease', tx[2], tx[3])
                    self.wallet.sendTx(self.contract.functions.executeDecreasePositions(tx[3], self.wallet.address))
            except Exception as e:
                print('error', str(e))
                pass
            time.sleep(random.randint(10, 20))

if __name__ == "__main__":
    PositionKeeper().start()