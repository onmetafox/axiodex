from requests import get
import time
from threading import Thread

from web3 import Web3
from eth_account import Account
import random

DEBUG = False
COINMARKETCAP_APIKEY = '26c092d3-a1ea-49d0-8376-e6b5322a2df1'

config = {
    'usdc': ['kucoin', 'gate', 'mexc', 'bitexch', 'bitget', 'bitmart', 'binance', 'okx'],
    'btc': ['kucoin', 'gate', 'mexc', 'bitexch', 'bitget', 'bitmart', 'binance', 'okx'],
    'eth': ['kucoin', 'gate', 'mexc', 'bitexch', 'bitget', 'bitmart', 'binance', 'okx'],
    'bnb': ['kucoin', 'gate', 'mexc', 'bitexch', 'bitget', 'bitmart', 'binance', 'okx'],
    'pls': ['okx'], # bitget, hotbit?
    'bone': ['gate', 'mexc', 'bitexch', 'bitget', 'bitmart', 'okx'], # hotbit?
    'hex': ['mexc', 'bitget'], # hotbit?
    'shib': ['kucoin', 'gate', 'mexc', 'bitexch', 'bitget', 'bitmart', 'binance', 'okx'],
    'leash': ['gate', 'bitexch', 'bitget', 'bitmart', 'okx'], # hotbit?

    'coinmarketcap_ids': {
        'pls': '11145', 'hex': '5015', 'usdt': '825', 'usdc': '3408', 'btc': '1', 'eth': '1027', 'bnb': '1839'
    },
    'coingecko_ids': {
        'pls': 'pulsechain', 'usdt': 'tether', 'usdc': 'usd-coin', 'btc': 'bitcoin', 'eth': 'ethereum', 'bnb': 'binancecoin', 'hex': 'hex-pulsechain'
    },
    'coinpaprika_ids': {
        'pls': 'pls-pulsechain', 'usdt': 'usdt-tether', 'usdc': 'usdc-usd-coin', 'btc': 'btc-bitcoin', 'eth': 'eth-ethereum', 'bnb': 'bnb-binance-coin', 'hex': 'hex-hex'
    }
}

class PriceFeeds(object):
    def __init__(self, token, sleepTime):
        self.sleepTime = sleepTime
        self.token = token
        self.symbol = token.upper()
        self.price = list()
        self.lastUSDPrice = dict()
        self.lastUSDTPrice = dict()
        self.lastStablePrice = dict()
    
    def start(self):
        token = self.token
        if 'kucoin' in config[token]:
            Thread(target=self.priceKucoin).start()
        if 'gate' in config[token]:
            Thread(target=self.priceGate).start()
        if 'mexc' in config[token]:
            Thread(target=self.priceMexc).start()
        if 'bitexch' in config[token]:
            Thread(target=self.priceBit).start()
        if 'bitget' in config[token]:
            Thread(target=self.priceBitget).start()
        if 'bitmart' in config[token]:
            Thread(target=self.priceBitmart).start()
        if 'binance' in config[token]:
            Thread(target=self.priceBinance).start()
        if 'coinbase' in config[token]:
            Thread(target=self.priceCoinbase).start()
        if 'okx' in config[token]:
            Thread(target=self.priceOkx).start()
        if 'hotbit' in config[token]:
            Thread(target=self.priceHotbit).start()
        if token in config['coinmarketcap_ids']:
            Thread(target=self.priceCoinmarket, args=[config['coinmarketcap_ids'][token]]).start()
        if token in config['coingecko_ids']:
            Thread(target=self.priceCoingecko, args=[config['coingecko_ids'][token]]).start()
        if token in config['coinpaprika_ids']:
            Thread(target=self.priceCoinpaprika, args=[config['coinpaprika_ids'][token]]).start()
        Thread(target=self.priceCoinmarket, args=[config['coinmarketcap_ids']['usdt'], True]).start()
        Thread(target=self.priceCoingecko, args=[config['coingecko_ids']['usdt'], True]).start()
        Thread(target=self.priceCoinpaprika, args=[config['coinpaprika_ids']['usdt'], True]).start()
        
    def getAvgPrice(self):
        priceStable = sum(self.lastStablePrice.values())/len(self.lastStablePrice) if len(self.lastStablePrice)>0 else 1
        prices = list(x/priceStable for x in self.lastUSDTPrice.values())
        prices = prices + list(self.lastUSDPrice.values())
        if len(prices)==0:
            return 0
        return int(sum(prices)/len(prices)*10**8)
    
    def priceKucoin(self):
        while 1:
            try:
                data = get("https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=" + self.symbol + "-USDT").json()
                data = data['data']
                data = float(data['price'])
                if DEBUG: print(['kucoin', self.symbol, data])
                self.lastUSDTPrice['kucoin'] = data
            except:
                pass
            time.sleep(self.sleepTime)
            
    def priceBinance(self):
        while 1:
            try:
                data = get("https://api.binance.com/api/v3/ticker/price?symbol=" + self.symbol + "USDT").json()
                data = float(data['price'])
                if DEBUG: print(['binance', self.symbol, data])
                self.lastUSDTPrice['binance'] = data
            except:
                pass
            time.sleep(self.sleepTime)
            
            
    def priceCoinbase(self, id, stable=False):
        while 1:
            try:
                data = get("https://api.coinbase.com/v2/prices/" + id + "-USD/spot").json()
                data = data['data']
                data = float(data['amount'])
                if DEBUG and not stable: print(['coinbase', self.symbol, data])
                if stable:
                    self.lastStablePrice['coinbase'] = data
                else:
                    self.lastUSDPrice['coinbase'] = data
            except:
                pass
            time.sleep(self.sleepTime)
    
    def priceCoinmarket(self, id, stable=False):
        while 1:
            try:
                data = get("https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=" + id, headers={'X-CMC_PRO_API_KEY': COINMARKETCAP_APIKEY}).json()
                data = data['data'][id]['quote']['USD']
                data = float(data['price'])
                if DEBUG and not stable: print(['coinmarketcap', self.symbol, data])
                if stable:
                    self.lastStablePrice['coinmarketcap'] = data
                else:
                    self.lastUSDPrice['coinmarketcap'] = data
            except:
                pass
            time.sleep(self.sleepTime)

    def priceCoingecko(self, id, stable=False):
        while 1:
            try:
                data = get("https://api.coingecko.com/api/v3/simple/price?ids=" + id + "&vs_currencies=usd").json()
                data = data[id]
                data = float(data['usd'])
                if DEBUG and not stable: print(['coingecko', self.symbol, data])
                if stable:
                    self.lastStablePrice['coingecko'] = data
                else:
                    self.lastUSDPrice['coingecko'] = data
            except:
                pass
            time.sleep(self.sleepTime)

    def priceCoinpaprika(self, id, stable=False):
        while 1:
            try:
                data = get("https://api.coinpaprika.com/v1/tickers/" + id).json()
                data = data["quotes"]["USD"]
                data = float(data['price'])
                if DEBUG and not stable: print(['coinpaprika', self.symbol, data])
                if stable:
                    self.lastStablePrice['coinpaprika'] = data
                else:
                    self.lastUSDPrice['coinpaprika'] = data
            except:
                pass
            time.sleep(self.sleepTime)

    def priceGate(self):
        while 1:
            try:
                data = get("https://data.gateapi.io/api2/1/ticker/" + self.symbol + "_USDT").json()
                lowestAsk = float(data['lowestAsk'])
                highestBid = float(data['highestBid'])
                last = float(data['last'])
                data = (((lowestAsk + highestBid)/2) + last)/2
                if DEBUG: print(['gate', self.symbol, data])
                self.lastUSDTPrice['gate'] = data
            except:
                pass
            time.sleep(self.sleepTime)
    
    def priceMexc(self):
        while 1:
            try:
                data = get("https://api.mexc.com/api/v3/ticker/price?symbol=" + self.symbol + "USDT").json()
                data = float(data['price'])
                if DEBUG: print(['mexc', self.symbol, data])
                self.lastUSDTPrice['mexc'] = data
            except:
                pass
            time.sleep(self.sleepTime)

    def priceHotbit(self):
        while 1:
            try:
                data = get(
                    "https://api.hotbit.io/api/v1/market.last?market=" + self.symbol + "_USDT").json()
                data = float(data['result'])
                if DEBUG: print(['hotbit', self.symbol, data])
                self.lastUSDTPrice['hotbit'] = data
            except:
                pass
            time.sleep(self.sleepTime)

    def priceOkx(self):
        while 1:
            try:
                data = get("https://www.okx.com/api/v5/market/ticker?instId=" + self.symbol + "-USDT").json()
                data = data['data'][0]
                lowestAskSz = float(
                    data['askSz']) / (float(data['askSz'])+float(data['bidSz'])+float(data['lastSz']))
                highestBidSz = float(
                    data['bidSz']) / (float(data['askSz'])+float(data['bidSz'])+float(data['lastSz']))
                lastSz = float(data['lastSz']) / (float(data['askSz']) +
                                                  float(data['bidSz'])+float(data['lastSz']))
                lowestAsk = float(data['askPx']) * lowestAskSz
                highestBid = float(data['bidPx']) * highestBidSz
                last = float(data['last']) * lastSz
                data = lowestAsk+highestBid+last
                if DEBUG: print(['okx', self.symbol, data])
                self.lastUSDTPrice['okx'] = data
            except:
                print(['okx error', self.symbol])
                pass
            time.sleep(self.sleepTime)

    def priceBit(self):
        while 1:
            try:
                data = get(
                    "https://betaapi.bitexch.dev/um/v1/index_price?currency=" + self.symbol + "&quote_currency=USDT").json()
                data = data['data'][0]
                data = float(data['index_price'])
                if DEBUG: print(['bit', self.symbol, data])
                self.lastUSDTPrice['bit'] = data
            except:
                pass
            time.sleep(self.sleepTime)

    def priceBitget(self):
        while 1:
            try:
                data = get(
                    "https://api.bitget.com/api/spot/v1/market/ticker?symbol=" + self.symbol + "USDT_SPBL").json()
                data = data['data']
                lowestAskSz = float(
                    data['askSz']) / (float(data['askSz'])+float(data['bidSz']))
                highestBidSz = float(
                    data['bidSz']) / (float(data['askSz'])+float(data['bidSz']))
                lowestAsk = float(data['sellOne']) * lowestAskSz
                highestBid = float(data['buyOne']) * highestBidSz
                last = float(data['close'])
                data = ((lowestAsk+highestBid)+last)/2
                if DEBUG: print(['bitget', self.symbol, data])
                self.lastUSDTPrice['bitget'] = data
            except:
                pass
            time.sleep(self.sleepTime)

    def priceBitmart(self):
        while 1:
            try:
                data = get(
                    "https://api-cloud.bitmart.com/spot/v1/ticker_detail?symbol=" + self.symbol + "_USDT").json()
                data = data['data']
                lowestAskSz = float(
                    data['best_ask_size']) / (float(data['best_ask_size'])+float(data['best_bid_size']))
                highestBidSz = float(
                    data['best_bid_size']) / (float(data['best_ask_size'])+float(data['best_bid_size']))
                lowestAsk = float(data['best_ask']) * lowestAskSz
                highestBid = float(data['best_bid']) * highestBidSz
                last = float(data['last_price'])
                data = ((lowestAsk+highestBid)+last)/2
                if DEBUG: print(['bitmart', self.symbol, data])
                self.lastUSDTPrice['bitmart'] = data
            except:
                pass
            time.sleep(self.sleepTime)


class Wallet(object):
    def __init__(self, endpoint, priv):
        self.web3 = Web3(Web3.HTTPProvider(endpoint))
        self.privateKey = priv
        self.address = Account.from_key(self.privateKey).address

    def getNonce(self):
        return self.web3.eth.get_transaction_count(self.address)

    def signHash(self, hashToSign):
        signature = Account.signHash(hashToSign, self.privateKey).signature.hex()
        return signature

    def sendTx(self, tx):
        # try:
        #     gas = self.web3.estimateGas(tx)*1.2
        # except:
        #     gas = 300000
        nonce = self.getNonce()
        build_tx = tx.build_transaction({
            'chainId': self.web3.eth.chain_id,
            'from': self.address,
            # 'gas': int(gas),
            # 'maxFeePerGas': self.web3.toWei(gas, 'gwei'),
            # 'gasPrice': int(self.web3.eth._gas_price()*2),
            # 'maxPriorityFeePerGas': self.web3.toWei(max_priority_fee, 'gwei'),
            'nonce': nonce,
            # "value": 0,
        })
        signed_tx = self.web3.eth.account.sign_transaction(
            build_tx, private_key=self.privateKey)
        tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        res = self.web3.eth.wait_for_transaction_receipt(
            transaction_hash=tx_hash,
            timeout=90,
            # poll_latency=1,
        )
        print('transaction status:', res.status)


class Keeper(object):
    def __init__(self, endpoint, token, wallets, address, sleepTime):
        self.web3 = Web3(Web3.HTTPProvider(endpoint))
        self.pricefeeds = PriceFeeds(token, sleepTime)
        self.token = token
        self.contract = self.web3.eth.contract(abi=open('abi', 'r').read(), address=address)
        self.wallets = dict()
        for k in wallets:
            self.wallets[k] = Wallet(endpoint, k)

    def start(self):
        self.pricefeeds.start()
        Thread(target=self.transmit).start()

    def transmit(self):
        print('start transmit')
        while True:
            print('call', self.token, 'transmit')
            try:
                wallet = random.choice(list(self.wallets.values()))
                # roundId = self.contract.functions.latestRound().call()+1
                excPrice = self.pricefeeds.getAvgPrice()
                if excPrice > 0:
                    wallet.sendTx(self.contract.functions.setLatestAnswer(excPrice))
                    print('setLatestAnswer', self.token, excPrice, wallet.address)
            except Exception as e:
                print('error', str(e))
                pass
            time.sleep(random.randint(10, 20))

