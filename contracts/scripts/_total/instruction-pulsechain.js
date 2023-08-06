module.exports = [
    { func: "wallet", as: "admin", value: "#1" },
    { func: "wallet", as: "AddressZero", value: "0x0000000000000000000000000000000000000000" },
    { func: "wallet", as: "localPriceUpdater", value: "tail local keeper" },
    { func: "wallet", as: "remotePriceUpdater", value: "tail backend keeper" },
    { func: "wallet", as: "positionKeeper", value: "position keeper" },

    // { func: "load", artifact: "WPLS", as: "NATIVE_TOKEN", address: "0x70499adEBB11Efd915E3b69E700c331778628707" },
    { func: "deploy", artifact: "WPLS", as: "NATIVE_TOKEN" },
    // { func: "load", artifact: "contracts/tokens/General.sol:GeneralToken", as: "HEX", address: "0x826e4e896CC2f5B371Cd7Bb0bd929DB3e3DB67c0" },
    // { func: "load", artifact: "contracts/tokens/General.sol:GeneralToken", as: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
    // { func: "load", artifact: "contracts/tokens/General.sol:GeneralToken", as: "ETH", address: "0x3677bd78ccf4d299328ecfba61790cf8dbfcf686" },
    // { func: "load", artifact: "contracts/tokens/General.sol:GeneralToken", as: "BTC", address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599" },
    { func: "deploy", artifact: "contracts/tokens/General.sol:GeneralToken", as: "HEX", args: [
        "HEX", "HEX", 8, 1000000000
    ] },
    { func: "deploy", artifact: "contracts/tokens/General.sol:GeneralToken", as: "USDC", args: [
        "USD Coin", "USDC", 6, 1000000000
    ] },
    { func: "deploy", artifact: "contracts/tokens/General.sol:GeneralToken", as: "BTC", args: [
        "Bitcoin", "BTC", 8, 100000
    ] },
    { func: "deploy", artifact: "contracts/tokens/General.sol:GeneralToken", as: "ETH", args: [
        "Ethereum", "ETH", 18, 10000000
    ] },

    { func: "deploy", artifact: "TokenManager", args: [1] },
    {
        func: "call",
        contract: "TokenManager",
        method: "initialize",
        args: [ ["${admin.address}"] ]
    },

    { func: "deploy", artifact: "Multicall3" },
    { func: "deploy", artifact: "Vault" },
    { func: "deploy", artifact: "USDG", args: ["${Vault.address}"] },
    { func: "deploy", artifact: "Router", args: ["${Vault.address}", "${USDG.address}", "${NATIVE_TOKEN.address}"] },
    { func: "deploy", artifact: "VaultPriceFeed" },
    { func: "call", contract: "VaultPriceFeed", method: "setMaxStrictPriceDeviation", args: ["${parseEther('10000000000')}"] },
    { func: "call", contract: "VaultPriceFeed", method: "setPriceSampleSpace", args: [1] },
    { func: "call", contract: "VaultPriceFeed", method: "setIsAmmEnabled", args: [false] },
    { func: "deploy", artifact: "ALP" },
    { func: "call", contract: "ALP", method: "setInPrivateTransferMode", args: [true] },
    { func: "deploy", artifact: "ShortsTracker", args: ["${Vault.address}"] },
    { func: "deploy", artifact: "AlpManager", args: ["${Vault.address}", "${USDG.address}", "${ALP.address}", "${ShortsTracker.address}", 1] },
    { func: "call", contract: "AlpManager", method: "setInPrivateMode", args: [true] },
    { func: "call", contract: "ALP", method: "setMinter", args: ["${AlpManager.address}", true] },
    { func: "call", contract: "USDG", method: "addVault", args: ["${AlpManager.address}"] },
    { func: "call", contract: "Vault", method: "initialize", args: ["${Router.address}", "${USDG.address}", "${VaultPriceFeed.address}", "${parseUnits('2',30)}", 100, 100] },
    { func: "call", contract: "Vault", method: "setFundingRate", args: [3600, 100, 100] },
    { func: "call", contract: "Vault", method: "setInManagerMode", args: [true] },
    { func: "call", contract: "Vault", method: "setManager", args: ["${AlpManager.address}", true] },
    { func: "call", contract: "Vault", method: "setFees", args: [10, 5, 20, 20, 1, 10, "${parseUnits('2',30)}", "${24*60*60}", true] },
    { func: "deploy", artifact: "VaultErrorController" },
    { func: "call", contract: "Vault", method: "setErrorController", args: ["${VaultErrorController.address}"] },
    {
        func: "call",
        contract: "VaultErrorController",
        method: "setErrors",
        args: ["${Vault.address}", [
            "Vault: zero error",
            "Vault: already initialized",
            "Vault: invalid _maxLeverage",
            "Vault: invalid _taxBasisPoints",
            "Vault: invalid _stableTaxBasisPoints",
            "Vault: invalid _mintBurnFeeBasisPoints",
            "Vault: invalid _swapFeeBasisPoints",
            "Vault: invalid _stableSwapFeeBasisPoints",
            "Vault: invalid _marginFeeBasisPoints",
            "Vault: invalid _liquidationFeeUsd",
            "Vault: invalid _fundingInterval",
            "Vault: invalid _fundingRateFactor",
            "Vault: invalid _stableFundingRateFactor",
            "Vault: token not whitelisted",
            "Vault: _token not whitelisted",
            "Vault: invalid tokenAmount",
            "Vault: _token not whitelisted",
            "Vault: invalid tokenAmount",
            "Vault: invalid usdgAmount",
            "Vault: _token not whitelisted",
            "Vault: invalid usdgAmount",
            "Vault: invalid redemptionAmount",
            "Vault: invalid amountOut",
            "Vault: swaps not enabled",
            "Vault: _tokenIn not whitelisted",
            "Vault: _tokenOut not whitelisted",
            "Vault: invalid tokens",
            "Vault: invalid amountIn",
            "Vault: leverage not enabled",
            "Vault: insufficient collateral for fees",
            "Vault: invalid position.size",
            "Vault: empty position",
            "Vault: position size exceeded",
            "Vault: position collateral exceeded",
            "Vault: invalid liquidator",
            "Vault: empty position",
            "Vault: position cannot be liquidated",
            "Vault: invalid position",
            "Vault: invalid _averagePrice",
            "Vault: collateral should be withdrawn",
            "Vault: _size must be more than _collateral",
            "Vault: invalid msg.sender",
            "Vault: mismatched tokens",
            "Vault: _collateralToken not whitelisted",
            "Vault: _collateralToken must not be a stableToken",
            "Vault: _collateralToken not whitelisted",
            "Vault: _collateralToken must be a stableToken",
            "Vault: _indexToken must not be a stableToken",
            "Vault: _indexToken not shortable",
            "Vault: invalid increase",
            "Vault: reserve exceeds pool",
            "Vault: max USDG exceeded",
            "Vault: reserve exceeds pool",
            "Vault: forbidden",
            "Vault: forbidden",
            "Vault: maxGasPrice exceeded"
        ]]
    },
    { func: "deploy", artifact: "VaultUtils", args: ["${Vault.address}"] },
    { func: "call", contract: "Vault", method: "setVaultUtils", args: ["${VaultUtils.address}"] },

    { func: "deploy", artifact: "PriceFeed", as: "PriceFeedPLS" },
    // { func: "call", contract: "PriceFeedPLS", method: "setLatestAnswer", args: ["${parseUnits('0.14826772', 8)}"] },
    { func: "wallet", as: "_keeper", value: "AxionDex:PLS:PriceFeed:0" }, { func: "call", contract: "PriceFeedPLS", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:PLS:PriceFeed:1" }, { func: "call", contract: "PriceFeedPLS", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:PLS:PriceFeed:2" }, { func: "call", contract: "PriceFeedPLS", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:PLS:PriceFeed:3" }, { func: "call", contract: "PriceFeedPLS", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:PLS:PriceFeed:4" }, { func: "call", contract: "PriceFeedPLS", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:PLS:PriceFeed:5" }, { func: "call", contract: "PriceFeedPLS", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${NATIVE_TOKEN.address}", "${PriceFeedPLS.address}", 8, false] },

    { func: "deploy", artifact: "PriceFeed", as: "PriceFeedBTC" },
    // { func: "call", contract: "PriceFeedBTC", method: "setLatestAnswer", args: ["${parseUnits('28600.55', 8)}"] },
    { func: "wallet", as: "_keeper", value: "AxionDex:BTC:PriceFeed:0" }, { func: "call", contract: "PriceFeedBTC", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:BTC:PriceFeed:1" }, { func: "call", contract: "PriceFeedBTC", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:BTC:PriceFeed:2" }, { func: "call", contract: "PriceFeedBTC", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:BTC:PriceFeed:3" }, { func: "call", contract: "PriceFeedBTC", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:BTC:PriceFeed:4" }, { func: "call", contract: "PriceFeedBTC", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:BTC:PriceFeed:5" }, { func: "call", contract: "PriceFeedBTC", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${BTC.address}", "${PriceFeedBTC.address}", 8, false] },
    
    { func: "deploy", artifact: "PriceFeed", as: "PriceFeedUSDC" },
    // { func: "call", contract: "PriceFeedUSDC", method: "setLatestAnswer", args: ["${parseUnits('1', 8)}"] },
    { func: "wallet", as: "_keeper", value: "AxionDex:USDC:PriceFeed:0" }, { func: "call", contract: "PriceFeedUSDC", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:USDC:PriceFeed:1" }, { func: "call", contract: "PriceFeedUSDC", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:USDC:PriceFeed:2" }, { func: "call", contract: "PriceFeedUSDC", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:USDC:PriceFeed:3" }, { func: "call", contract: "PriceFeedUSDC", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:USDC:PriceFeed:4" }, { func: "call", contract: "PriceFeedUSDC", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:USDC:PriceFeed:5" }, { func: "call", contract: "PriceFeedUSDC", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${USDC.address}", "${PriceFeedUSDC.address}", 8, true] },
    
    { func: "deploy", artifact: "PriceFeed", as: "PriceFeedETH" },
    // { func: "call", contract: "PriceFeedETH", method: "setLatestAnswer", args: ["${parseUnits('1800', 8)}"] },
    { func: "wallet", as: "_keeper", value: "AxionDex:ETH:PriceFeed:0" }, { func: "call", contract: "PriceFeedETH", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:ETH:PriceFeed:1" }, { func: "call", contract: "PriceFeedETH", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:ETH:PriceFeed:2" }, { func: "call", contract: "PriceFeedETH", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:ETH:PriceFeed:3" }, { func: "call", contract: "PriceFeedETH", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:ETH:PriceFeed:4" }, { func: "call", contract: "PriceFeedETH", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:ETH:PriceFeed:5" }, { func: "call", contract: "PriceFeedETH", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${ETH.address}", "${PriceFeedETH.address}", 8, false] },

    { func: "deploy", artifact: "PriceFeed", as: "PriceFeedHEX" },
    // { func: "call", contract: "PriceFeedHEX", method: "setLatestAnswer", args: ["${parseUnits('1', 8)}"] },
    { func: "wallet", as: "_keeper", value: "AxionDex:HEX:PriceFeed:0" }, { func: "call", contract: "PriceFeedHEX", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:HEX:PriceFeed:1" }, { func: "call", contract: "PriceFeedHEX", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:HEX:PriceFeed:2" }, { func: "call", contract: "PriceFeedHEX", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:HEX:PriceFeed:3" }, { func: "call", contract: "PriceFeedHEX", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:HEX:PriceFeed:4" }, { func: "call", contract: "PriceFeedHEX", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "wallet", as: "_keeper", value: "AxionDex:HEX:PriceFeed:5" }, { func: "call", contract: "PriceFeedHEX", method: "setAdmin", args: ["${_keeper.address}", true] }, 
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${HEX.address}", "${PriceFeedHEX.address}", 8, false] },

    // { func: "call", contract: "PriceFeedPLS", method: "setAdmin", args: ["${localPriceUpdater.address}", true] }, 
    // { func: "call", contract: "PriceFeedBTC", method: "setAdmin", args: ["${localPriceUpdater.address}", true] }, 
    // { func: "call", contract: "PriceFeedETH", method: "setAdmin", args: ["${localPriceUpdater.address}", true] }, 
    // { func: "call", contract: "PriceFeedHEX", method: "setAdmin", args: ["${localPriceUpdater.address}", true] }, 
    // { func: "call", contract: "PriceFeedUSDC", method: "setAdmin", args: ["${localPriceUpdater.address}", true] }, 

    // { func: "call", contract: "PriceFeedPLS", method: "setAdmin", args: ["${remotePriceUpdater.address}", true] }, 
    // { func: "call", contract: "PriceFeedBTC", method: "setAdmin", args: ["${remotePriceUpdater.address}", true] }, 
    // { func: "call", contract: "PriceFeedETH", method: "setAdmin", args: ["${remotePriceUpdater.address}", true] }, 
    // { func: "call", contract: "PriceFeedHEX", method: "setAdmin", args: ["${remotePriceUpdater.address}", true] }, 
    // { func: "call", contract: "PriceFeedUSDC", method: "setAdmin", args: ["${remotePriceUpdater.address}", true] }, 
    
    { func: "call", contract: "Vault", method: "setTokenConfig", args: ["${NATIVE_TOKEN.address}", 18, 20000, 0, "${parseUnits('3',25)}", false, true] },
    { func: "call", contract: "Vault", method: "setTokenConfig", args: ["${BTC.address}", 8, 3000, 0, "${parseUnits('5',25)}", false, true] },
    { func: "call", contract: "Vault", method: "setTokenConfig", args: ["${ETH.address}", 18, 45000, 0, "${parseUnits('5',25)}", false, true] },
    { func: "call", contract: "Vault", method: "setTokenConfig", args: ["${HEX.address}", 8, 45000, 0, "${parseUnits('5',25)}", false, true] },
    { func: "call", contract: "Vault", method: "setTokenConfig", args: ["${USDC.address}", 6, 45000, 0, "${parseUnits('5',25)}", true, false] },

    { func: "deploy", artifact: "OrderBook", args: [] },
    { func: "call", contract: "OrderBook", method: "initialize", args: [
        "${Router.address}",  // router
        "${Vault.address}", // vault
        "${NATIVE_TOKEN.address}", // weth
        "${USDG.address}", // usdg
        "${parseEther('0.01')}", // min execution fee
        "${parseUnits('10', 30)}" // min purchase token amount usd
    ] },

    { func: "deploy", artifact: "OrderExecutor", args: ["${Vault.address}","${OrderBook.address}"] },

    { func: "deploy", artifact: "AXN", args: [] },
    { func: "call", contract: "AXN", method: "setMinter", args: ["${admin.address}", true] },

    //deployRewardRouterV2
    { func: "deploy", artifact: "EsAXN", args: [] },
    { func: "deploy", artifact: "MintableBaseToken", as: "BnAXN", args: ["Bonus AXN", "bnAXN", 0] },
    { func: "call", contract: "EsAXN", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "ALP", method: "setInPrivateTransferMode", args: [true] },

    { func: "deploy", artifact: "RewardTracker", as: "StakedAxnTracker", args: ["Staked AXN", "sAXN"] },
    { func: "deploy", artifact: "RewardDistributor", as: "StakedAxnDistributor", args: ["${EsAXN.address}","${StakedAxnTracker.address}"] },
    { func: "call", contract: "StakedAxnTracker", method: "initialize", args: [
        ["${AXN.address}","${EsAXN.address}"], "${StakedAxnDistributor.address}"
    ] },
    { func: "call", contract: "StakedAxnDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "deploy", artifact: "RewardTracker", as: "BonusAxnTracker", args: ["Staked + Bonus AXN", "sbAXN"] },
    { func: "deploy", artifact: "BonusDistributor", as: "BonusAxnDistributor", args: ["${BnAXN.address}","${BonusAxnTracker.address}"] },
    { func: "call", contract: "BonusAxnTracker", method: "initialize", args: [
        ["${StakedAxnTracker.address}"], "${BonusAxnDistributor.address}"
    ] },
    { func: "call", contract: "BonusAxnDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "call", contract: "BnAXN", method: "setMinter", args: ["${admin.address}", true] },
    { func: "call", contract: "BnAXN", method: "mint", args: ["${BonusAxnDistributor.address}", "${parseEther('15000000')}"] },

    { func: "deploy", artifact: "RewardTracker", as: "FeeAxnTracker", args: ["Staked + Bonus + Fee AXN", "sbfAXN"] },
    { func: "deploy", artifact: "RewardDistributor", as: "FeeAxnDistributor", args: ["${NATIVE_TOKEN.address}","${FeeAxnTracker.address}"] },
    { func: "call", contract: "FeeAxnTracker", method: "initialize", args: [
        ["${BonusAxnTracker.address}","${BonusAxnDistributor.address}"], "${FeeAxnDistributor.address}"
    ] },
    { func: "call", contract: "FeeAxnDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "deploy", artifact: "RewardTracker", as: "FeeAlpTracker", args: ["Fee ALP", "fALP"] },
    { func: "deploy", artifact: "RewardDistributor", as: "FeeAlpDistributor", args: ["${NATIVE_TOKEN.address}","${FeeAlpTracker.address}"] },
    { func: "call", contract: "FeeAlpTracker", method: "initialize", args: [
        ["${ALP.address}"], "${FeeAlpDistributor.address}"
    ] },
    { func: "call", contract: "FeeAlpDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "deploy", artifact: "RewardTracker", as: "StakedAlpTracker", args: ["Fee + Staked ALP", "fsALP"] },
    { func: "deploy", artifact: "RewardDistributor", as: "StakedAlpDistributor", args: ["${EsAXN.address}","${StakedAlpTracker.address}"] },
    { func: "call", contract: "StakedAlpTracker", method: "initialize", args: [
        ["${StakedAlpTracker.address}"], "${StakedAlpDistributor.address}"
    ] },
    { func: "call", contract: "StakedAlpDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "call", contract: "EsAXN", method: "setMinter", args: ["${admin.address}", true] },
    { func: "call", contract: "EsAXN", method: "mint", args: ["${StakedAxnDistributor.address}", "${parseEther('600000')}"] },
    { func: "call", contract: "EsAXN", method: "mint", args: ["${StakedAlpDistributor.address}", "${parseEther('600000')}"] },
    
    { func: "call", contract: "StakedAxnTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "StakedAxnTracker", method: "setInPrivateStakingMode", args: [true] },
    { func: "call", contract: "BonusAxnTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "BonusAxnTracker", method: "setInPrivateStakingMode", args: [true] },
    { func: "call", contract: "BonusAxnTracker", method: "setInPrivateClaimingMode", args: [true] },
    { func: "call", contract: "FeeAxnTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "FeeAxnTracker", method: "setInPrivateStakingMode", args: [true] },

    { func: "call", contract: "FeeAlpTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "FeeAlpTracker", method: "setInPrivateStakingMode", args: [true] },
    { func: "call", contract: "StakedAlpTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "StakedAlpTracker", method: "setInPrivateStakingMode", args: [true] },

    { func: "deploy", artifact: "contracts/staking/Vester.sol:Vester", as: "AxnVester", args: [
        "Vested AXN", // _name
        "vAXN", // _symbol
        "${365 * 86400}", // _vestingDuration
        "${EsAXN.address}", // _esToken
        "${FeeAxnTracker.address}", // _pairToken
        "${AXN.address}", // _claimableToken
        "${StakedAxnTracker.address}", // _rewardTracker
    ] },

    { func: "deploy", artifact: "contracts/staking/Vester.sol:Vester", as: "AlpVester", args: [
        "Vested ALP", // _name
        "vGLP", // _symbol
        "${365 * 86400}", // _vestingDuration
        "${EsAXN.address}", // _esToken
        "${StakedAlpTracker.address}", // _pairToken
        "${AXN.address}", // _claimableToken
        "${StakedAlpTracker.address}", // _rewardTracker
    ] },

    { func: "call", contract: "AXN", method: "mint", args: ["${AxnVester.address}", "${parseEther('40000')}"] },
    { func: "call", contract: "AXN", method: "mint", args: ["${AlpVester.address}", "${parseEther('20000')}"] },

    { func: "deploy", artifact: "RewardRouterV2", as: "RewardRouter", args: []},
    { func: "call", contract: "RewardRouter", method: "initialize", args: [
        "${NATIVE_TOKEN.address}",
        "${AXN.address}",
        "${EsAXN.address}",
        "${BnAXN.address}",
        "${ALP.address}",
        "${StakedAxnTracker.address}",
        "${BonusAxnTracker.address}",
        "${FeeAxnTracker.address}",
        "${FeeAlpTracker.address}",
        "${StakedAlpTracker.address}",
        "${AlpManager.address}",
        "${AxnVester.address}",
        "${AlpVester.address}"    
    ] },

    { func: "call", contract: "AlpManager", method: "setHandler", args: ["${RewardRouter.address}", true] },

    { func: "call", contract: "StakedAxnTracker", method: "setHandler", args: ["${RewardRouter.address}", true] },
    { func: "call", contract: "StakedAxnTracker", method: "setHandler", args: ["${BonusAxnTracker.address}", true] },

    { func: "call", contract: "BonusAxnTracker", method: "setHandler", args: ["${RewardRouter.address}", true] },
    { func: "call", contract: "BonusAxnTracker", method: "setHandler", args: ["${FeeAxnTracker.address}", true] },
    { func: "call", contract: "BonusAxnDistributor", method: "setBonusMultiplier", args: ["10000"] },
    { func: "call", contract: "FeeAxnTracker", method: "setHandler", args: ["${RewardRouter.address}", true] },

    { func: "call", contract: "EsAXN", method: "setHandler", args: ["${StakedAxnTracker.address}", true] },
    { func: "call", contract: "BnAXN", method: "setHandler", args: ["${FeeAxnTracker.address}", true] },
    { func: "call", contract: "BnAXN", method: "setHandler", args: ["${RewardRouter.address}", true] },

    { func: "call", contract: "FeeAlpTracker", method: "setHandler", args: ["${StakedAlpTracker.address}", true] },
    { func: "call", contract: "ALP", method: "setHandler", args: ["${FeeAlpTracker.address}", true] },
    { func: "call", contract: "FeeAlpTracker", method: "setHandler", args: ["${RewardRouter.address}", true] },
    
    { func: "call", contract: "StakedAlpTracker", method: "setHandler", args: ["${RewardRouter.address}", true] },
    
    { func: "call", contract: "EsAXN", method: "setHandler", args: ["${RewardRouter.address}", true] },
    { func: "call", contract: "EsAXN", method: "setHandler", args: ["${StakedAxnDistributor.address}", true] },
    
    { func: "call", contract: "EsAXN", method: "setHandler", args: ["${StakedAlpDistributor.address}", true] },
    { func: "call", contract: "EsAXN", method: "setHandler", args: ["${StakedAlpTracker.address}", true] },
    { func: "call", contract: "EsAXN", method: "setHandler", args: ["${AxnVester.address}", true] },
    { func: "call", contract: "EsAXN", method: "setHandler", args: ["${AlpVester.address}", true] },

    { func: "call", contract: "AxnVester", method: "setHandler", args: ["${RewardRouter.address}", true] },
    { func: "call", contract: "AlpVester", method: "setHandler", args: ["${RewardRouter.address}", true] },

    { func: "call", contract: "FeeAxnTracker", method: "setHandler", args: ["${AxnVester.address}", true] },
    { func: "call", contract: "StakedAlpTracker", method: "setHandler", args: ["${AlpVester.address}", true] },

    { func: "deploy", artifact: "RewardRouterV2", as: "AlpRewardRouter", args: []},
    { func: "call", contract: "AlpRewardRouter", method: "initialize", args: [
        "${NATIVE_TOKEN.address}",
        "${AddressZero.address}",
        "${AddressZero.address}",
        "${AddressZero.address}",
        "${ALP.address}",
        "${AddressZero.address}",
        "${AddressZero.address}",
        "${AddressZero.address}",
        "${FeeAlpTracker.address}",
        "${StakedAlpTracker.address}",
        "${AlpManager.address}",
        "${AddressZero.address}",
        "${AddressZero.address}"    
    ] },
    { func: "call", contract: "FeeAlpTracker", method: "setHandler", args: ["${AlpRewardRouter.address}", true] },
    { func: "call", contract: "StakedAlpTracker", method: "setHandler", args: ["${AlpRewardRouter.address}", true] },
    { func: "call", contract: "AlpManager", method: "setHandler", args: ["${AlpRewardRouter.address}", true] },

    { func: "deploy", artifact: "Timelock", as: "TimeLock", args: [
        "${admin.address}", // admin ???
        "1", // buffer
        "${Vault.address}", // tokenManager
        "${Vault.address}", // mintReceiver
        "${AlpManager.address}", // glpManager
        "${RewardRouter.address}", // RewardRouter
        "${parseEther('13250000')}", // maxTokenSupply
        "10", // marginFeeBasisPoints 0.1%
        "500" // maxMarginFeeBasisPoints 5%    
    ]},
    { func: "call", contract: "TimeLock", method: "setMarginFeeBasisPoints", args: [10, 500] },
    { func: "call", contract: "TimeLock", method: "setShouldToggleIsLeverageEnabled", args: [true] },
    
    { func: "call", contract: "Vault", method: "setGov", args: ["${TimeLock.address}"] },
    { func: "call", contract: "VaultErrorController", method: "setGov", args: ["${TimeLock.address}"] },
    { func: "call", contract: "VaultUtils", method: "setGov", args: ["${TimeLock.address}"] },

    { func: "call", contract: "TimeLock", method: "setContractHandler", args: ["${admin.address}", true] },

    { func: "call", contract: "TimeLock", method: "setKeeper", args: ["${admin.address}", true] },

    { func: "call", contract: "TimeLock", method: "signalApprove", args: ["${AXN.address}", "${admin.address}", "1000000000000000000"] },

    { func: "deploy", artifact: "PositionManager", args: [
        "${Vault.address}", 
        "${Router.address}", 
        "${ShortsTracker.address}", 
        "${NATIVE_TOKEN.address}", 
        30, 
        "${OrderBook.address}"
    ]},

    { func: "call", contract: "PositionManager", method: "setShouldValidateIncreaseOrder", args: ["false"] },

    { func: "call", contract: "PositionManager", method: "setOrderKeeper", args: ["${admin.address}", true] },

    { func: "call", contract: "PositionManager", method: "setLiquidator", args: ["${admin.address}", true] },

    { func: "call", contract: "TimeLock", method: "setContractHandler", args: ["${PositionManager.address}", true] },

    { func: "call", contract: "TimeLock", method: "setLiquidator", args: ["${Vault.address}", "${PositionManager.address}", true] },

    { func: "call", contract: "ShortsTracker", method: "setHandler", args: ["${PositionManager.address}", true] },

    { func: "call", contract: "Router", method: "addPlugin", args: ["${PositionManager.address}"] },

    { func: "call", contract: "PositionManager", method: "setGov", args: ["${TimeLock.address}"] },

    { func: "deploy", artifact: "PositionRouter", args: [
        "${Vault.address}", 
        "${Router.address}", 
        "${NATIVE_TOKEN.address}", 
        "${ShortsTracker.address}", 
        30, 
        "20000000000000000" 
    ]},

    { func: "call", contract: "ShortsTracker", method: "setHandler", args: ["${PositionRouter.address}", true] },
    
    { func: "call", contract: "Router", method: "addPlugin", args: ["${PositionRouter.address}"] },
    
    { func: "call", contract: "PositionRouter", method: "setDelayValues", args: [1, 180, "${30 * 60}"] },
    { func: "call", contract: "TimeLock", method: "setContractHandler", args: ["${PositionRouter.address}", true] },

    { func: "call", contract: "PositionRouter", method: "setGov", args: ["${TimeLock.address}"] },
    
    { func: "deploy", artifact: "ReferralReader", args: []},
    
    { func: "deploy", artifact: "ReferralStorage", args: []},

    { func: "call", contract: "PositionRouter", method: "setReferralStorage", args: ["${ReferralStorage.address}"] },
    { func: "call", contract: "PositionManager", method: "setReferralStorage", args: ["${ReferralStorage.address}"] },
    { func: "call", contract: "ReferralStorage", method: "setHandler", args: ["${PositionRouter.address}", true] },
    { func: "call", contract: "ReferralStorage", method: "setTier", args: [0, 1000, 5000] },
    { func: "call", contract: "ReferralStorage", method: "setTier", args: [1, 2000, 5000] },
    { func: "call", contract: "ReferralStorage", method: "setTier", args: [2, 5000, 4000] },
    { func: "call", contract: "ReferralStorage", method: "setGov", args: ["${TimeLock.address}"] },
    
    { func: "deploy", artifact: "PriceFeedTimelock", args: [
        "${admin.address}",
        "1",
        "${TokenManager.address}"    
    ]},
    { func: "call", contract: "PriceFeedTimelock", method: "setContractHandler", args: ["${admin.address}", true] },

    { func: "call", contract: "PriceFeedTimelock", method: "setKeeper", args: ["${admin.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setKeeper", args: ["${localPriceUpdater.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setKeeper", args: ["${remotePriceUpdater.address}", true] },

    { func: "deploy", artifact: "FastPriceEvents" },
    { func: "deploy", artifact: "FastPriceFeed", args: [
        300, // priceDuration 
        3600, // maxPriceUpdateDelay 
        1, // minBlockInterval 
        250, // maxDeviationBasisPoint 
        "${FastPriceEvents.address}", // fastPriceEvents 
        "${admin.address}", // tokenManager 
        "${PositionRouter.address}" // positionRouter
    ], as: "SecondaryPriceFeed" },
    { func: "call", contract: "VaultPriceFeed", method: "setSecondaryPriceFeed", args: ["${SecondaryPriceFeed.address}"] },
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${NATIVE_TOKEN.address}", "${PriceFeedPLS.address}", 8, false] },
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${BTC.address}", "${PriceFeedBTC.address}", 8, false] },
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${ETH.address}", "${PriceFeedETH.address}", 8, false] },
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${HEX.address}", "${PriceFeedHEX.address}", 8, true] },
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${USDC.address}", "${PriceFeedUSDC.address}", 8, true] },

    { func: "call", contract: "SecondaryPriceFeed", method: "initialize", args: [1, 
        ["${admin.address}"], 
        ["${admin.address}", "${localPriceUpdater.address}", "${remotePriceUpdater.address}"]
    ] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setVaultPriceFeed", args: ["${VaultPriceFeed.address}"] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setMaxTimeDeviation", args: [3600] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setSpreadBasisPointsIfInactive", args: [50] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setSpreadBasisPointsIfChainError", args: [500] },
    // { func: "call", contract: "SecondaryPriceFeed", method: "setTokens", args: [
    //     ["${NATIVE_TOKEN.address}", "${BTC.address}", "${ETH.address}", "${HEX.address}", "${USDC.address}"],
    //     [1000000, 1000, 10000, 1000000, 1000000]
    // ] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setPriceDataInterval", args: [60] },

    { func: "call", contract: "PositionRouter", method: "setPositionKeeper", args: ["${admin.address}", true] },
    { func: "call", contract: "PositionRouter", method: "setPositionKeeper", args: ["${SecondaryPriceFeed.address}", true] },
    { func: "call", contract: "PositionRouter", method: "setPositionKeeper", args: ["${positionKeeper.address}", true] },
    { func: "call", contract: "FastPriceEvents", method: "setIsPriceFeed", args: ["${SecondaryPriceFeed.address}", true] },

    { func: "call", contract: "VaultPriceFeed", method: "setGov", args: ["${PriceFeedTimelock.address}"] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setGov", args: ["${PriceFeedTimelock.address}"] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setTokenManager", args: ["${TokenManager.address}"] },
    { func: "call", contract: "FastPriceEvents", method: "setGov", args: ["${PriceFeedTimelock.address}"] },

    // { func: "deploy", artifact: "GMT", args: ["${parseEther('401000')}"]},
    { func: "deploy", artifact: "StakeManager", args: []},
    { func: "deploy", artifact: "StakedAlp", args: [
        "${ALP.address}",
        "${AlpManager.address}",
        "${StakedAlpTracker.address}",
        "${FeeAlpTracker.address}"    
    ]},
    { func: "call", contract: "FeeAlpTracker", method: "setHandler", args: ["${StakedAlp.address}", true] },
    { func: "call", contract: "StakedAlpTracker", method: "setHandler", args: ["${StakedAlp.address}", true] },
    { func: "deploy", artifact: "AlpBalance", args: ["${AlpManager.address}", "${StakedAlpTracker.address}"]},

    { func: "deploy", artifact: "BalanceUpdater", args: []},
    { func: "deploy", artifact: "BatchSender", args: []},
    { func: "deploy", artifact: "VaultReader", args: []},
    { func: "deploy", artifact: "ShortsTrackerTimelock", args: [
        "${admin.address}", // admin
        1, // buffer
        300,  // averagePriceUpdateDelay
        20 // maxAveragePriceChange
    ]},
    { func: "call", contract: "ShortsTrackerTimelock", method: "setHandler", args: ["${ShortsTracker.address}", true] },
    { func: "deploy", artifact: "RewardReader", args: []},
    { func: "deploy", artifact: "Reader", args: []},
    { func: "deploy", artifact: "OrderBookReader", args: []},
    
    { func: "deploy", artifact: "AxnTimelock", args: [
        "${admin.address}",
        "1",
        "1",
        "${AddressZero.address}",
        "${admin.address}",
        "${AddressZero.address}",
        "${parseEther('13250000')}"    
    ]},

    { func: "deploy", artifact: "EsAxnBatchSender", args: ["${EsAXN.address}"]},
    { func: "call", contract: "EsAXN", method: "setHandler", args: ["${EsAxnBatchSender.address}"] },
    { func: "call", contract: "AxnVester", method: "setHandler", args: ["${EsAxnBatchSender.address}"] },
    { func: "call", contract: "AlpVester", method: "setHandler", args: ["${EsAxnBatchSender.address}"] },

    // { func: "wallet", as: "nextTimelock", value: "0x2c79620F6f6eBff251A62eBE3eFfc1C9b7C2209d" },
    // { func: "call", contract: "AxnVester", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "AlpVester", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "AlpManager", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "ALP", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "EsAXN", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "BnAXN", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "USDG", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "StakedAxnTracker", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "StakedAxnDistributor", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "BonusAxnTracker", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "BonusAxnDistributor", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "FeeAxnTracker", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "FeeAxnDistributor", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "StakedAlpTracker", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "StakedAlpDistributor", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "FeeAlpTracker", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "FeeAlpDistributor", method: "setGov", args: ["${nextTimelock.address}"] },
    // { func: "call", contract: "ShortsTracker", method: "setGov", args: ["${nextTimelock.address}"] },

    // { func: "load", artifact: "contracts/uniswap/Router.sol:PancakeRouter", address: "0xDaE9dd3d1A52CfCe9d5F2fAC7fDe164D500E50f7" },
    // { func: "load", artifact: "contracts/uniswap/Factory.sol:PancakeFactory", address: "0xFf0538782D122d3112F75dc7121F61562261c0f7" },
    { func: "deploy", artifact: "contracts/uniswap/Factory.sol:PancakeFactory", args: ["${admin.address}"]},
    { func: "init_pair_hash", router: "contracts/uniswap/Router.sol", factory: "PancakeFactory"},
    { func: "deploy", artifact: "contracts/uniswap/Router.sol:PancakeRouter", args: ["${PancakeFactory.address}", "${NATIVE_TOKEN.address}"]},
    { func: "call", contract: "AXN", method: "mint", args: ["${admin.address}", "${parseEther('10000000')}"] },
    { func: "call", contract: "AXN", method: "approve", args: ["${PancakeRouter.address}", "${parseEther('1000000')}"] },
    { func: "call", contract: "USDC", method: "approve", args: ["${PancakeRouter.address}", "${parseUnits('10000000', 6)}"] },
    { func: "call", contract: "PancakeRouter", method: "addLiquidity", args: [
        "${USDC.address}", "${AXN.address}", "${parseUnits('10000000', 6)}", "${parseEther('1000000')}", 0, 0, "${admin.address}", "${block.timestamp + 1000}"
    ]},
    { func: "call", contract: "PancakeFactory", method: "getPair", args: ["${USDC.address}", "${AXN.address}"], as: "_pairAxnUsdcPool" },

    { func: "load", artifact: "contracts/uniswap/IUniswapV2Pair.sol:IUniswapV2Pair", as: "UniswapAxnUsdcPool", address: "${_pairAxnUsdcPool}" },
    
    { func: "deploy", artifact: "LiquidityLocker", args: [
        "${TimeLock.address}",
        "${UniswapAxnUsdcPool.address}",
        "${block.timestamp + 86400 * 20}"    
    ]},
    
    { func: "call", contract: "UniswapAxnUsdcPool", method: "balanceOf", args: ["${admin.address}"], as: "_balanceOfAxnUsdc" },
    { func: "call", contract: "UniswapAxnUsdcPool", method: "transfer", args: ["${LiquidityLocker.address}", "${_balanceOfAxnUsdc}"] },

    { func: "call", contract: "PositionRouter", method: "setMaxGlobalSizes", args: [
        ["${NATIVE_TOKEN.address}", "${BTC.address}", "${ETH.address}"], 
        ["${parseUnits('15', 36)}", "${parseUnits('10', 36)}", "${parseUnits('10', 36)}"], 
        ["${parseUnits('10', 36)}", "${parseUnits('1000', 30)}", "${parseUnits('10', 36)}"]
    ] },
    { func: "call", contract: "PositionManager", method: "setMaxGlobalSizes", args: [
        ["${NATIVE_TOKEN.address}", "${BTC.address}", "${ETH.address}"], 
        ["${parseUnits('15', 36)}", "${parseUnits('10', 36)}", "${parseUnits('10', 36)}"], 
        ["${parseUnits('10', 36)}", "${parseUnits('1000', 30)}", "${parseUnits('10', 36)}"]
    ] },

    // { func: "wallet", value: "0x2fD798a8fcc64Ba1Bc62bF363A6A28F63e93D5b8", as: "tierAccount1" },
    // { func: "wallet", value: "0x8Bcf10D5bD8a0FF835221dD2a9C794B435c52813", as: "tierAccount2" },
    // { func: "call", contract: "TimeLock", method: "setReferrerTier", args: ["${ReferralStorage.address}", "${tierAccount1.address}", 1] },
    // { func: "call", contract: "TimeLock", method: "setReferrerTier", args: ["${ReferralStorage.address}", "${tierAccount2.address}", 1] },

    { func: "call", contract: "TimeLock", method: "setMaxGlobalShortSize", args: ["${Vault.address}", "${NATIVE_TOKEN.address}", "${parseUnits('20000', 30)}"] },
    { func: "call", contract: "TimeLock", method: "setMaxGlobalShortSize", args: ["${Vault.address}", "${BTC.address}", "${parseUnits('20000', 30)}"] },
    { func: "call", contract: "TimeLock", method: "setMaxGlobalShortSize", args: ["${Vault.address}", "${ETH.address}", "${parseUnits('20000', 30)}"] },
    { func: "call", contract: "TimeLock", method: "setMaxGlobalShortSize", args: ["${Vault.address}", "${HEX.address}", "${parseUnits('20000', 30)}"] },
    { func: "call", contract: "TimeLock", method: "setMaxGlobalShortSize", args: ["${Vault.address}", "${USDC.address}", "${parseUnits('20000', 30)}"] },

    { func: "call", contract: "NATIVE_TOKEN", method: "deposit", overrides: {value: "1000000000000000000000"}, key: "deposit 1000PLS" },
    { func: "call", contract: "NATIVE_TOKEN", method: "approve", args: ["${Router.address}", "${parseUnits('1000', 18)}"] },
    { func: "call", contract: "Router", method: "directPoolDeposit", args: ["${NATIVE_TOKEN.address}", "${parseUnits('1000', 18)}"] },
    { func: "call", contract: "USDC", method: "approve", args: ["${Router.address}", "${parseUnits('100000', 6)}"] },
    { func: "call", contract: "Router", method: "directPoolDeposit", args: ["${USDC.address}", "${parseUnits('100000', 6)}"] },
    { func: "call", contract: "BTC", method: "approve", args: ["${Router.address}", "${parseUnits('100', 8)}"] },
    { func: "call", contract: "Router", method: "directPoolDeposit", args: ["${BTC.address}", "${parseUnits('100', 8)}"] },
    { func: "call", contract: "ETH", method: "approve", args: ["${Router.address}", "${parseUnits('1000', 18)}"] },
    { func: "call", contract: "Router", method: "directPoolDeposit", args: ["${ETH.address}", "${parseUnits('1000', 18)}"] },
    { func: "call", contract: "HEX", method: "approve", args: ["${Router.address}", "${parseUnits('1000000', 8)}"] },
    { func: "call", contract: "Router", method: "directPoolDeposit", args: ["${HEX.address}", "${parseUnits('5000', 8)}"] },
    
    // { func: "call", contract: "EsAXN", method: "setMinter", args: ["${admin.address}", true] },
    // { func: "call", contract: "EsAXN", method: "mint", args: ["${StakedAxnDistributor.address}", "${parseEther('600000')}"] },
    // { func: "call", contract: "EsAXN", method: "mint", args: ["${StakedAlpDistributor.address}", "${parseEther('600000')}"] },
    // { func: "call", contract: "BnAXN", method: "setMinter", args: ["${admin.address}", true] },
    // { func: "call", contract: "BnAXN", method: "mint", args: ["${BonusAxnDistributor.address}", "${parseEther('15000000')}"] },
    { func: "call", contract: "NATIVE_TOKEN", method: "deposit", overrides: {value: "2000000000000000000"}, key: "deposit 2PLS" },
    { func: "call", contract: "NATIVE_TOKEN", method: "transfer", args: ["${FeeAxnDistributor.address}", "${parseEther('1')}"] },
    { func: "call", contract: "NATIVE_TOKEN", method: "transfer", args: ["${FeeAlpDistributor.address}", "${parseEther('1')}"] },

    { func: "call", contract: "StakedAxnDistributor", method: "setTokensPerInterval", args: ["20667989410000000"] },
    { func: "call", contract: "StakedAlpDistributor", method: "setTokensPerInterval", args: ["10667989410000000"] },

    { func: "call", contract: "FeeAxnDistributor", method: "setTokensPerInterval", args: ["20000000000"] },
    { func: "call", contract: "FeeAlpDistributor", method: "setTokensPerInterval", args: ["20000000000"] },

    { func: "call", contract: "StakedAxnTracker", method: "updateRewards" },
    { func: "call", contract: "StakedAlpTracker", method: "updateRewards" },
    { func: "call", contract: "FeeAxnTracker", method: "updateRewards" },
    { func: "call", contract: "FeeAlpTracker", method: "updateRewards" },
    { func: "call", contract: "BonusAxnTracker", method: "updateRewards" },

    { func: "call", contract: "StakedAxnDistributor", method: "updateLastDistributionTime" },
    { func: "call", contract: "StakedAlpDistributor", method: "updateLastDistributionTime" },
    { func: "call", contract: "FeeAxnDistributor", method: "updateLastDistributionTime" },
    { func: "call", contract: "FeeAlpDistributor", method: "updateLastDistributionTime" },
    { func: "call", contract: "BonusAxnDistributor", method: "updateLastDistributionTime" },

    { func: "save", contracts: [
        "NATIVE_TOKEN", "BTC", "ETH", "HEX", "USDC",
        "Vault", "Router", "VaultReader", "Reader", "AlpManager", "RewardRouter", "AlpRewardRouter", "RewardReader", 
        "ALP", "AXN", "EsAXN", "BnAXN", "USDG", "EsAxnIOU",
        "StakedAxnTracker", "BonusAxnTracker", "FeeAxnTracker", "StakedAlpTracker", "FeeAlpTracker",
        "StakedAxnDistributor", "StakedAlpDistributor",
        "AxnVester", "AlpVester",
        "OrderBook", "OrderExecutor", "OrderBookReader",
        "PositionRouter", "PositionManager",
        "UniswapMmyFtmPool", "UniswapAxnUsdcPool", "ReferralStorage",
        "ReferralReader",
        "TimeLock", "SecondaryPriceFeed",
        "LiquidityLocker", "MummyClubNFT", "MummyClubNFTStaking", "MummyClubSale", "MummyClubVester"
    ] }
]