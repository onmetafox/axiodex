from web3 import Web3
from threading import Thread
from keeper import Wallet
import time
import random
import requests


config = {
    'endpoint': "https://goerli.base.org",
    'sleepTime': 10,
    'keeper': "3b4b8d98a95a38a00817c95eb2d9e1bb826a544fe4d3eabe4276c877a0a74681",
    'orderBookAddress': "0x698727269d637aC283F0CF07CD1B48715a4bD59F",
}

class IncreaseOrderKeeper(object):
    def __init__(self) -> None:
        self.web3 = Web3(Web3.HTTPProvider(config['endpoint']))
        self.wallet = Wallet(config['endpoint'], config['keeper']);
        self.contract = self.web3.eth.contract(abi=open('abiOrderBook.json', 'r').read(), address=config['orderBookAddress'])
        
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
        print('start order increasing transmit...')
        
        while True:
            query = """
                {
                    orders(
                        where: { type: "increase", status: open }
                        orderBy: createdTimestamp
                        orderDirection: asc
                    ) {
                        id
                        index
                        account
                        triggerAboveThreshold
                        triggerRatio
                        indexToken
                        isLong
                    }
                }
            """
            try:
                result = self.run_query(query)
                print('---------')
                print("order length:", len(result['data']['orders']))
                
                for order in result['data']['orders']:
                    print(bool(order['triggerAboveThreshold']), int(order['triggerRatio']), self.web3.to_checksum_address(order['indexToken']), bool(order['isLong']), bool(True))                    
                    try:
                        tx = self.contract.functions.validatePositionOrderPrice(bool(order['triggerAboveThreshold']), int(order['triggerRatio']), self.web3.to_checksum_address(order['indexToken']), bool(order['isLong']), bool(True)).call()
                        print('tx', tx)
                        time.sleep(random.randint(1, 10))
                        print(self.web3.to_checksum_address(order['account']), int(order['index']), self.wallet.address)
                        self.wallet.sendTx(self.contract.functions.executeIncreaseOrder(self.web3.to_checksum_address(order['account']), int(order['index']), self.wallet.address))
                    except Exception as e:
                        print('error', str(e))
                        
                    time.sleep(random.randint(10, 20))
                    
            except Exception as query_error:
                print('error', str(query_error))

if __name__ == "__main__":
    IncreaseOrderKeeper().start()
