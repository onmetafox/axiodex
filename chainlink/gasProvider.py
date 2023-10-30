from requests import get
import time
from threading import Thread

from web3 import Web3
from eth_account import Account

class GasProvider(object):
    def __init__(self, endpoint, wallets, privateKey):
        self.web3 = Web3(Web3.HTTPProvider(endpoint))
        self.account = Account.from_key(privateKey)
        self.privateKey = privateKey
        self.wallets = wallets
        self.distribute()
        Thread(target=self.transfer).start()

    def distribute(self):
        nonce = self.web3.eth.get_transaction_count(self.account.address)
        for wallet in self.wallets:
            balance = self.web3.eth.get_balance(wallet)
            if balance < self.web3.to_wei(0.02, 'ether'):
                tx = {
                    'chainId': self.web3.eth.chain_id,
                    'nonce': nonce,
                    'to': wallet,
                    'gas': 2000000,
                    'gasPrice': self.web3.to_wei(0.1, 'gwei'),
                    'value': self.web3.to_wei(0.1, 'ether'),
                }
                signed_tx = Account.sign_transaction(tx, self.privateKey)
                try:
                    self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
                    print('sent', self.account.address, wallet)
                    nonce = nonce + 1
                except:
                    pass
    def transfer(self):
        while True:
            try:
                self.distribute()
            except Exception as e:
                print(str(e))
                pass
            time.sleep(60)
