from web3 import Web3
from threading import Thread
from keeper import Wallet
import time
import random
import requests
import numpy as np


config = {
    'endpoint': "https://goerli.base.org",
    'sleepTime': 10,
    'keeper': "",
    'orderBookAddress': "0x00093a37d28b4D987E6e951D3b5dFED83Eb508B0",
    'orderExecutorAddress': "0x00629a62B9F76681CE76C7F3CFae067858A69Eb2",
    'timeLockAddress': "0x4063EF728Cf71306f5F9BeC04309C1e5e8B55485",
    'vaultAddress': "0x0fe870bc7d5d9cFd8b6e079AC3FB5CBfc02Adeb0"
}

class OrderKeeper(object):
    def __init__(self) -> None:
        self.web3 = Web3(Web3.HTTPProvider(config['endpoint']))
        self.wallet = Wallet(config['endpoint'], config['keeper']);
        self.orderBookContract = self.web3.eth.contract(abi=open('abiOrderBook.json', 'r').read(), address=config['orderBookAddress'])
        self.orderExecutorContract = self.web3.eth.contract(abi=open('abiOrderExecutor.json', 'r').read(), address=config['orderExecutorAddress'])
        self.timeLockContract = self.web3.eth.contract(abi=open('abiTimeLock.json', 'r').read(), address=config['timeLockAddress'])
        
    def run_query(self, query):
        request = requests.post('https://api.studio.thegraph.com/proxy/44624/orders-base-goerli/version/latest/'
                                '', 
                                json={'query':query}, 
                                headers={'Content-Type': 'application/json'})
        if request.status_code == 200:
            return request.json()
        else:
            raise Exception(f"Unexpected status code returned: {request.status_code}")
        
    def start(self):
        Thread(target=self.transmit).start()
        
    def transmit(self):
        print('starting order processing ...')
        
        query = """
                {
                    orders(
                        where: { status: open }
                        orderBy: createdTimestamp
                        orderDirection: asc
                    ) {
                        id
                        type
                        index
                        account
                        triggerAboveThreshold
                        triggerRatio
                        indexToken
                        isLong
                        path
                    }
                }
            """
        
        while True:
            
            try:
                result = self.run_query(query)
                print('---------');
                print("order length:", len(result['data']['orders']))
                
                for order in result['data']['orders']:
                    try:
                        ordertype = order['type']
                        path = []
                        if len(order['path']) == 2 : 
                            path = [
                                self.web3.to_checksum_address(order['path'][0]), 
                                self.web3.to_checksum_address(order['path'][1])
                            ]
                        triggerAboveThreshold = bool(order['triggerAboveThreshold'])
                        triggerRatio = int(order['triggerRatio'])
                        indexToken = order['indexToken']
                        isLong = bool(order['isLong'])
                        index = int(order['index'])
                        account = order['account']
                        
                        # print(type, bool(order['triggerAboveThreshold']), int(order['triggerRatio']), self.web3.to_checksum_address(order['indexToken']), bool(order['isLong']), bool(True))                    
                        if ordertype == 'increase' :
                            print('[Increase] ', self.web3.to_checksum_address(account), index)
                            tx = self.orderBookContract.functions.validatePositionOrderPrice(triggerAboveThreshold, triggerRatio, self.web3.to_checksum_address(indexToken), isLong, bool(True)).call()
                            print('tx', tx)
                            time.sleep(random.randint(1, 10))
                            self.wallet.sendTx(self.timeLockContract.functions.setIsLeverageEnabled(config['vaultAddress'], True))
                            time.sleep(random.randint(1, 10))
                            self.wallet.sendTx(self.orderBookContract.functions.executeIncreaseOrder(self.web3.to_checksum_address(account), index, self.wallet.address))
                            time.sleep(random.randint(1, 10))
                            self.wallet.sendTx(self.timeLockContract.functions.setIsLeverageEnabled(config['vaultAddress'], False))
                        elif ordertype == 'decrease' :
                            print('[Decrease] ', self.web3.to_checksum_address(account), index)
                            tx = self.orderBookContract.functions.validatePositionOrderPrice(triggerAboveThreshold, triggerRatio, self.web3.to_checksum_address(indexToken), isLong, bool(True)).call()
                            print('tx', tx)
                            time.sleep(random.randint(1, 10))
                            self.wallet.sendTx(self.orderBookContract.functions.executeDecreaseOrder(self.web3.to_checksum_address(account), index, self.wallet.address))
                        else :
                            print('[Swap] ', path, triggerRatio)
                            if(len(path) > 0) :
                                tx = self.orderBookContract.functions.validateSwapOrderPriceWithTriggerAboveThreshold( path, triggerRatio).call()
                                print('tx', tx)
                                self.wallet.sendTx(self.orderBookContract.functions.executeSwapOrder(self.web3.to_checksum_address(account), index, self.wallet.address))
                    except Exception as e:
                        print('Transaction Error', str(e))
                        
                    time.sleep(random.randint(10, 20))
                    
            except Exception as query_error:
                print('Query Error', str(query_error))

if __name__ == "__main__":
    OrderKeeper().start()
