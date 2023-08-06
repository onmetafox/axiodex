module.exports = [
    { func: "wallet", as: "owner", value: "#1" },
    { func: "wallet", as: "tester", value: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" },
    { func: "wallet", as: "Camper", value: "0xB4bAc8b01397ACbBCEecf1B1e0871a249DA6D37e" },
    { func: "wallet", as: "Dicapro1", value: "0xcb2D1CF1ecDeF32a0BFa3C39d74F74AB7454E70B" },
    { func: "wallet", as: "Dicapro2", value: "0x2c215acdA3D070558cF3851AF0Ac7f75B4A233F4" },
    { func: "wallet", as: "Milos", value: "0xef249ab821DFc8e54375f4770DF1722f4DA981ed" },
    { func: "wallet", as: "NATIVE_TOKEN", value: "0x1e86fCe4d102A5924A9EF503f772fCA162Af2067" },
    { func: "wallet", as: "AddressZero", value: "0x0000000000000000000000000000000000000000" },
    { func: "wallet", as: "localPriceUpdater", value: "tail local keeper" },
    { func: "wallet", as: "backendPriceUpdater", value: "tail backend keeper" },
    { func: "wallet", as: "positionKeeper", value: "position keeper" },

    // local only
    { func: "deploy", artifact: "WETH", args: [ "Wrapped ETH", "WETH", 18 ], as: "NATIVE_TOKEN" },
    { func: "deploy", artifact: "contracts/tokens/General.sol:GeneralToken", as: "USDC", args: [
        "USD Coin", "USDC", 6, 1000000000
    ] },
    { func: "deploy", artifact: "contracts/tokens/General.sol:GeneralToken", as: "BTC", args: [
        "Bitcoin", "BTC", 8, 100000
    ] },
    { func: "deploy", artifact: "contracts/tokens/General.sol:GeneralToken", as: "ETH", args: [
        "Ethereum", "ETH", 18, 10000000
    ] },
    { func: "deploy", artifact: "contracts/tokens/General.sol:GeneralToken", as: "SHIB", args: [
        "Shibarium", "SHIB", 18, 1000000000000
    ] },

    { func: "load", artifact: "WETH", as: "NATIVE_TOKEN", address: "0x888888888030F38cF1CdA6aD34cCCcB0f83Cd86a", network: "shibarium" },
    { func: "load", artifact: "contracts/tokens/General.sol:GeneralToken", as: "USDC", address: "0x9e29510A0fd59dff54BD64C778062f3d32E94C28", network: "shibarium" },
    { func: "deploy", artifact: "contracts/tokens/General.sol:GeneralToken", as: "BTC", address: "0xc7e716fc607d993f969510d9409c08d0ff9cf35b", network: "shibarium" },
    
    // TokenManager
    { func: "deploy", artifact: "TokenManager", args: [4] },
    {
        func: "call",
        contract: "TokenManager",
        method: "initialize",
        args: [ ["${Camper.address}", "${Dicapro1.address}", "${Dicapro2.address}", "${Milos.address}"] ]
    },

    // Vault
    { func: "deploy", artifact: "Vault" },
    { func: "deploy", artifact: "USDG", args: ["${Vault.address}"] },
    { func: "deploy", artifact: "Router", args: ["${Vault.address}", "${USDG.address}", "${NATIVE_TOKEN.address}"] },
    { func: "deploy", artifact: "VaultPriceFeed" },
    { func: "call", contract: "VaultPriceFeed", method: "setMaxStrictPriceDeviation", args: ["${parseEther('10000000000')}"] },
    { func: "call", contract: "VaultPriceFeed", method: "setPriceSampleSpace", args: [1] },
    { func: "call", contract: "VaultPriceFeed", method: "setIsAmmEnabled", args: [false] },
    { func: "deploy", artifact: "GLP" },
    { func: "call", contract: "GLP", method: "setInPrivateTransferMode", args: [true] },
    { func: "deploy", artifact: "ShortsTracker", args: ["${Vault.address}"] },
    { func: "deploy", artifact: "GlpManager", args: ["${Vault.address}", "${USDG.address}", "${GLP.address}", "${ShortsTracker.address}", 1] },
    { func: "call", contract: "GlpManager", method: "setInPrivateMode", args: [true] },
    { func: "call", contract: "GLP", method: "setMinter", args: ["${GlpManager.address}", true] },
    { func: "call", contract: "USDG", method: "addVault", args: ["${GlpManager.address}"] },
    { func: "call", contract: "Vault", method: "initialize", args: ["${Router.address}", "${USDG.address}", "${VaultPriceFeed.address}", "${parseUnits('2',30)}", 100, 100] },
    { func: "call", contract: "Vault", method: "setFundingRate", args: [3600, 100, 100] },
    { func: "call", contract: "Vault", method: "setInManagerMode", args: [true] },
    { func: "call", contract: "Vault", method: "setManager", args: ["${GlpManager.address}", true] },
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

    // { func: "load", artifact: "PriceFeedTimelock" },
    // { func: "call", contract: "PriceFeedTimelock", method: "signalSetGov", args: ["${Vault.address}", "${owner.address}"] },
    // { func: "call", contract: "PriceFeedTimelock", method: "signalSetGov", args: ["${VaultPriceFeed.address}", "${owner.address}"] },
    // { func: "call", contract: "PriceFeedTimelock", method: "setGov", args: ["${Vault.address}", "${owner.address}"] },
    // { func: "call", contract: "PriceFeedTimelock", method: "setGov", args: ["${VaultPriceFeed.address}", "${owner.address}"] },
    
    { func: "deploy", artifact: "PriceFeed", as: "PriceFeedBONE" },
    // { func: "call", contract: "PriceFeedBONE", method: "setLatestAnswer", args: ["${parseUnits('1.08', 8)}"] },
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${NATIVE_TOKEN.address}", "${PriceFeedBONE.address}", 8, false] },
    { func: "deploy", artifact: "PriceFeed", as: "PriceFeedBTC" },
    // { func: "call", contract: "PriceFeedBTC", method: "setLatestAnswer", args: ["${parseUnits('28600.55', 8)}"] },
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${BTC.address}", "${PriceFeedBTC.address}", 8, false] },
    { func: "deploy", artifact: "PriceFeed", as: "PriceFeedUSDC" },
    // { func: "call", contract: "PriceFeedUSDC", method: "setLatestAnswer", args: ["${parseUnits('0.998', 8)}"] },
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${USDC.address}", "${PriceFeedUSDC.address}", 8, true] },
    { func: "deploy", artifact: "PriceFeed", as: "PriceFeedETH" },
    // { func: "call", contract: "PriceFeedETH", method: "setLatestAnswer", args: ["${parseUnits('1800', 8)}"] },
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${ETH.address}", "${PriceFeedETH.address}", 8, true] },
    { func: "deploy", artifact: "PriceFeed", as: "PriceFeedSHIB" },
    // { func: "call", contract: "PriceFeedSHIB", method: "setLatestAnswer", args: ["${parseUnits('0.998', 8)}"] },
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${SHIB.address}", "${PriceFeedSHIB.address}", 8, true] },

    { func: "call", contract: "PriceFeedBONE", method: "setAdmin", args: ["${localPriceUpdater.address}", true] }, 
    { func: "call", contract: "PriceFeedBTC", method: "setAdmin", args: ["${localPriceUpdater.address}", true] }, 
    { func: "call", contract: "PriceFeedETH", method: "setAdmin", args: ["${localPriceUpdater.address}", true] }, 
    { func: "call", contract: "PriceFeedSHIB", method: "setAdmin", args: ["${localPriceUpdater.address}", true] }, 
    { func: "call", contract: "PriceFeedUSDC", method: "setAdmin", args: ["${localPriceUpdater.address}", true] }, 

    { func: "call", contract: "PriceFeedBONE", method: "setAdmin", args: ["${backendPriceUpdater.address}", true] }, 
    { func: "call", contract: "PriceFeedBTC", method: "setAdmin", args: ["${backendPriceUpdater.address}", true] }, 
    { func: "call", contract: "PriceFeedETH", method: "setAdmin", args: ["${backendPriceUpdater.address}", true] }, 
    { func: "call", contract: "PriceFeedSHIB", method: "setAdmin", args: ["${backendPriceUpdater.address}", true] }, 
    { func: "call", contract: "PriceFeedUSDC", method: "setAdmin", args: ["${backendPriceUpdater.address}", true] }, 
    
    { func: "call", contract: "Vault", method: "setTokenConfig", args: ["${NATIVE_TOKEN.address}", 18, 20000, 0, "${parseUnits('3',25)}", false, true] },
    { func: "call", contract: "Vault", method: "setTokenConfig", args: ["${BTC.address}", 8, 3000, 0, "${parseUnits('5',25)}", false, true] },
    { func: "call", contract: "Vault", method: "setTokenConfig", args: ["${ETH.address}", 18, 45000, 0, "${parseUnits('5',25)}", false, true] },
    { func: "call", contract: "Vault", method: "setTokenConfig", args: ["${SHIB.address}", 18, 45000, 0, "${parseUnits('5',25)}", false, true] },
    { func: "call", contract: "Vault", method: "setTokenConfig", args: ["${USDC.address}", 6, 45000, 0, "${parseUnits('5',25)}", true, false] },

    { func: "deploy", artifact: "OrderBook", args: [] },
    { func: "call", contract: "OrderBook", method: "initialize", args: [
        "${Router.address}",  // router
        "${Vault.address}", // vault
        "${NATIVE_TOKEN.address}", // weth
        "${USDG.address}", // usdg
        "10000000000000000", // 0.01 AVAX
        "${parseUnits('10', 30)}" // min purchase token amount usd
    ] },

    { func: "deploy", artifact: "OrderExecutor", args: ["${Vault.address}","${OrderBook.address}"] },

    { func: "deploy", artifact: "GMX", args: [] },
    { func: "call", contract: "GMX", method: "setMinter", args: ["${owner.address}", true] },

    //deployRewardRouterV2
    { func: "deploy", artifact: "EsGMX", as: "ES_GMX", args: [] },
    { func: "deploy", artifact: "MintableBaseToken", as: "BN_GMX", args: ["Bonus GMX", "bnGMX", 0] },
    { func: "call", contract: "ES_GMX", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "GLP", method: "setInPrivateTransferMode", args: [true] },

    { func: "deploy", artifact: "RewardTracker", as: "StakedGmxTracker", args: ["Staked GMX", "sGMX"] },
    { func: "deploy", artifact: "RewardDistributor", as: "StakedGmxDistributor", args: ["${ES_GMX.address}","${StakedGmxTracker.address}"] },
    { func: "call", contract: "StakedGmxTracker", method: "initialize", args: [
        ["${GMX.address}","${ES_GMX.address}"], "${StakedGmxDistributor.address}"
    ] },
    { func: "call", contract: "StakedGmxDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "deploy", artifact: "RewardTracker", as: "BonusGmxTracker", args: ["Staked + Bonus GMX", "sbGMX"] },
    { func: "deploy", artifact: "BonusDistributor", as: "BonusGmxDistributor", args: ["${BN_GMX.address}","${BonusGmxTracker.address}"] },
    { func: "call", contract: "BonusGmxTracker", method: "initialize", args: [
        ["${StakedGmxTracker.address}"], "${BonusGmxDistributor.address}"
    ] },
    { func: "call", contract: "BonusGmxDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "call", contract: "BN_GMX", method: "setMinter", args: ["${owner.address}", true] },
    { func: "call", contract: "BN_GMX", method: "mint", args: ["${BonusGmxDistributor.address}", "${parseEther('15000000')}"] },

    { func: "deploy", artifact: "RewardTracker", as: "FeeGmxTracker", args: ["Staked + Bonus + Fee GMX", "sbfGMX"] },
    { func: "deploy", artifact: "RewardDistributor", as: "FeeGmxDistributor", args: ["${NATIVE_TOKEN.address}","${FeeGmxTracker.address}"] },
    { func: "call", contract: "FeeGmxTracker", method: "initialize", args: [
        ["${BonusGmxTracker.address}","${BonusGmxDistributor.address}"], "${FeeGmxDistributor.address}"
    ] },
    { func: "call", contract: "FeeGmxDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "deploy", artifact: "RewardTracker", as: "FeeGlpTracker", args: ["Fee GLP", "fGLP"] },
    { func: "deploy", artifact: "RewardDistributor", as: "FeeGlpDistributor", args: ["${NATIVE_TOKEN.address}","${FeeGlpTracker.address}"] },
    { func: "call", contract: "FeeGlpTracker", method: "initialize", args: [
        ["${GLP.address}"], "${FeeGlpDistributor.address}"
    ] },
    { func: "call", contract: "FeeGlpDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "deploy", artifact: "RewardTracker", as: "StakedGlpTracker", args: ["Fee + Staked GLP", "fsGLP"] },
    { func: "deploy", artifact: "RewardDistributor", as: "StakedGlpDistributor", args: ["${ES_GMX.address}","${StakedGlpTracker.address}"] },
    { func: "call", contract: "StakedGlpTracker", method: "initialize", args: [
        ["${StakedGlpTracker.address}"], "${StakedGlpDistributor.address}"
    ] },
    { func: "call", contract: "StakedGlpDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "call", contract: "ES_GMX", method: "setMinter", args: ["${owner.address}", true] },
    { func: "call", contract: "ES_GMX", method: "mint", args: ["${StakedGmxDistributor.address}", "${parseEther('600000')}"] },
    { func: "call", contract: "ES_GMX", method: "mint", args: ["${StakedGlpDistributor.address}", "${parseEther('600000')}"] },
    
    { func: "call", contract: "StakedGmxTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "StakedGmxTracker", method: "setInPrivateStakingMode", args: [true] },
    { func: "call", contract: "BonusGmxTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "BonusGmxTracker", method: "setInPrivateStakingMode", args: [true] },
    { func: "call", contract: "BonusGmxTracker", method: "setInPrivateClaimingMode", args: [true] },
    { func: "call", contract: "FeeGmxTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "FeeGmxTracker", method: "setInPrivateStakingMode", args: [true] },

    { func: "call", contract: "FeeGlpTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "FeeGlpTracker", method: "setInPrivateStakingMode", args: [true] },
    { func: "call", contract: "StakedGlpTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "StakedGlpTracker", method: "setInPrivateStakingMode", args: [true] },

    { func: "deploy", artifact: "contracts/staking/Vester.sol:Vester", as: "GmxVester", args: [
        "Vested GMX", // _name
        "vGMX", // _symbol
        "${365 * 24 * 60 * 60}", // _vestingDuration
        "${ES_GMX.address}", // _esToken
        "${FeeGmxTracker.address}", // _pairToken
        "${GMX.address}", // _claimableToken
        "${StakedGmxTracker.address}", // _rewardTracker
    ] },

    { func: "deploy", artifact: "contracts/staking/Vester.sol:Vester", as: "GlpVester", args: [
        "Vested GLP", // _name
        "vGLP", // _symbol
        "${365 * 24 * 60 * 60}", // _vestingDuration
        "${ES_GMX.address}", // _esToken
        "${StakedGlpTracker.address}", // _pairToken
        "${GMX.address}", // _claimableToken
        "${StakedGlpTracker.address}", // _rewardTracker
    ] },

    { func: "call", contract: "GMX", method: "mint", args: ["${GmxVester.address}", "${parseEther('40000')}"] },
    { func: "call", contract: "GMX", method: "mint", args: ["${GlpVester.address}", "${parseEther('20000')}"] },

    { func: "deploy", artifact: "RewardRouterV2", as: "RewardRouter", args: []},
    { func: "call", contract: "RewardRouter", method: "initialize", args: [
        "${NATIVE_TOKEN.address}",
        "${GMX.address}",
        "${ES_GMX.address}",
        "${BN_GMX.address}",
        "${GLP.address}",
        "${StakedGmxTracker.address}",
        "${BonusGmxTracker.address}",
        "${FeeGmxTracker.address}",
        "${FeeGlpTracker.address}",
        "${StakedGlpTracker.address}",
        "${GlpManager.address}",
        "${GmxVester.address}",
        "${GlpVester.address}"    
    ] },

    { func: "call", contract: "GlpManager", method: "setHandler", args: ["${RewardRouter.address}", true] },

    { func: "call", contract: "StakedGmxTracker", method: "setHandler", args: ["${RewardRouter.address}", true] },
    { func: "call", contract: "StakedGmxTracker", method: "setHandler", args: ["${BonusGmxTracker.address}", true] },

    { func: "call", contract: "BonusGmxTracker", method: "setHandler", args: ["${RewardRouter.address}", true] },
    { func: "call", contract: "BonusGmxTracker", method: "setHandler", args: ["${FeeGmxTracker.address}", true] },
    { func: "call", contract: "BonusGmxDistributor", method: "setBonusMultiplier", args: ["10000"] },
    { func: "call", contract: "FeeGmxTracker", method: "setHandler", args: ["${RewardRouter.address}", true] },

    { func: "call", contract: "ES_GMX", method: "setHandler", args: ["${StakedGmxTracker.address}", true] },
    { func: "call", contract: "BN_GMX", method: "setHandler", args: ["${FeeGmxTracker.address}", true] },
    { func: "call", contract: "BN_GMX", method: "setHandler", args: ["${RewardRouter.address}", true] },

    { func: "call", contract: "FeeGlpTracker", method: "setHandler", args: ["${StakedGlpTracker.address}", true] },
    { func: "call", contract: "GLP", method: "setHandler", args: ["${FeeGlpTracker.address}", true] },
    { func: "call", contract: "FeeGlpTracker", method: "setHandler", args: ["${RewardRouter.address}", true] },
    
    { func: "call", contract: "StakedGlpTracker", method: "setHandler", args: ["${RewardRouter.address}", true] },
    
    { func: "call", contract: "ES_GMX", method: "setHandler", args: ["${RewardRouter.address}", true] },
    { func: "call", contract: "ES_GMX", method: "setHandler", args: ["${StakedGmxDistributor.address}", true] },
    
    { func: "call", contract: "ES_GMX", method: "setHandler", args: ["${StakedGlpDistributor.address}", true] },
    { func: "call", contract: "ES_GMX", method: "setHandler", args: ["${StakedGlpTracker.address}", true] },
    { func: "call", contract: "ES_GMX", method: "setHandler", args: ["${GmxVester.address}", true] },
    { func: "call", contract: "ES_GMX", method: "setHandler", args: ["${GlpVester.address}", true] },

    { func: "call", contract: "ES_GMX", method: "setHandler", args: ["${GmxVester.address}", true] },
    { func: "call", contract: "ES_GMX", method: "setHandler", args: ["${GlpVester.address}", true] },

    { func: "call", contract: "GmxVester", method: "setHandler", args: ["${RewardRouter.address}", true] },
    { func: "call", contract: "GlpVester", method: "setHandler", args: ["${RewardRouter.address}", true] },

    { func: "call", contract: "FeeGmxTracker", method: "setHandler", args: ["${GmxVester.address}", true] },
    { func: "call", contract: "StakedGlpTracker", method: "setHandler", args: ["${GlpVester.address}", true] },

    { func: "deploy", artifact: "RewardRouterV2", as: "GlpRewardRouter", args: []},
    { func: "call", contract: "GlpRewardRouter", method: "initialize", args: [
        "${NATIVE_TOKEN.address}",
        "${AddressZero.address}",
        "${AddressZero.address}",
        "${AddressZero.address}",
        "${GLP.address}",
        "${AddressZero.address}",
        "${AddressZero.address}",
        "${AddressZero.address}",
        "${FeeGlpTracker.address}",
        "${StakedGlpTracker.address}",
        "${GlpManager.address}",
        "${AddressZero.address}",
        "${AddressZero.address}"    
    ] },
    { func: "call", contract: "FeeGlpTracker", method: "setHandler", args: ["${GlpRewardRouter.address}", true] },
    { func: "call", contract: "StakedGlpTracker", method: "setHandler", args: ["${GlpRewardRouter.address}", true] },
    { func: "call", contract: "GlpManager", method: "setHandler", args: ["${GlpRewardRouter.address}", true] },

    { func: "deploy", artifact: "Timelock", as: "TimeLock", args: [
        "${owner.address}", // admin ???
        "1", // buffer
        "${Vault.address}", // tokenManager
        "${Vault.address}", // mintReceiver
        "${GlpManager.address}", // glpManager
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

    { func: "call", contract: "TimeLock", method: "setContractHandler", args: ["${Camper.address}", true] },
    { func: "call", contract: "TimeLock", method: "setContractHandler", args: ["${Dicapro1.address}", true] },
    { func: "call", contract: "TimeLock", method: "setContractHandler", args: ["${Dicapro2.address}", true] },

    { func: "call", contract: "TimeLock", method: "setKeeper", args: ["${owner.address}", true] },

    { func: "call", contract: "TimeLock", method: "signalApprove", args: ["${GMX.address}", "${owner.address}", "1000000000000000000"] },

    { func: "deploy", artifact: "PositionManager", args: [
        "${Vault.address}", 
        "${Router.address}", 
        "${ShortsTracker.address}", 
        "${NATIVE_TOKEN.address}", 
        30, 
        "${OrderBook.address}"
    ]},

    { func: "call", contract: "PositionManager", method: "setShouldValidateIncreaseOrder", args: ["false"] },

    { func: "call", contract: "PositionManager", method: "setOrderKeeper", args: ["${owner.address}", true] },

    { func: "call", contract: "PositionManager", method: "setLiquidator", args: ["${owner.address}", true] },

    { func: "call", contract: "TimeLock", method: "setContractHandler", args: ["${PositionManager.address}", true] },

    { func: "call", contract: "TimeLock", method: "setLiquidator", args: ["${Vault.address}", "${PositionManager.address}", true] },

    { func: "call", contract: "ShortsTracker", method: "setHandler", args: ["${PositionManager.address}", true] },

    { func: "call", contract: "Router", method: "addPlugin", args: ["${PositionManager.address}"] },

    // { func: "call", contract: "PositionManager", method: "setPartner", args: ["", false] },//
    { func: "call", contract: "Vault", method: "gov", as: "govOfVault" },
    { func: "call", contract: "PositionManager", method: "setGov", args: ["${govOfVault}"] },

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

    { func: "call", contract: "PositionRouter", method: "setGov", args: ["${govOfVault}"] },
    
    { func: "deploy", artifact: "ReferralReader", args: []},
    
    { func: "deploy", artifact: "ReferralStorage", args: []},

    { func: "call", contract: "PositionRouter", method: "setReferralStorage", args: ["${ReferralStorage.address}"] },
    { func: "call", contract: "PositionManager", method: "setReferralStorage", args: ["${ReferralStorage.address}"] },
    { func: "call", contract: "ReferralStorage", method: "setHandler", args: ["${PositionRouter.address}", true] },
    { func: "call", contract: "ReferralStorage", method: "setTier", args: [0, 1000, 5000] },
    { func: "call", contract: "ReferralStorage", method: "setTier", args: [1, 2000, 5000] },
    { func: "call", contract: "ReferralStorage", method: "setTier", args: [2, 5000, 4000] },
    { func: "call", contract: "ReferralStorage", method: "setGov", args: ["${govOfVault}"] },
    
    { func: "deploy", artifact: "PriceFeedTimelock", args: [
        "${owner.address}",//signer
        "1",
        "${TokenManager.address}"    
    ]},
    { func: "call", contract: "PriceFeedTimelock", method: "setContractHandler", args: ["${Camper.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setContractHandler", args: ["${Dicapro1.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setContractHandler", args: ["${Dicapro2.address}", true] },

    { func: "call", contract: "PriceFeedTimelock", method: "setKeeper", args: ["${Camper.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setKeeper", args: ["${Dicapro1.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setKeeper", args: ["${Dicapro2.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setKeeper", args: ["${owner.address}", true] },

    { func: "wallet", as: "updater1", value: "0x2b249Bec7c3A142431b67e63A1dF86F974FAF3aa" },
    { func: "wallet", as: "updater2", value: "0x63ff41E44d68216e716d236E2ECdd5272611D835" },
    { func: "wallet", as: "updater3", value: "0x5e0338CE6597FCB9404d69F4286194A60aD442b7" },
    { func: "wallet", as: "updater4", value: "owner" },

    { func: "deploy", artifact: "FastPriceEvents" },
    { func: "deploy", artifact: "FastPriceFeed", args: [
        300, 3600, 1, 250, "${FastPriceEvents.address}", "${owner.address}", "${PositionRouter.address}"
    ], as: "SecondaryPriceFeed" },
    { func: "call", contract: "VaultPriceFeed", method: "setSecondaryPriceFeed", args: ["${SecondaryPriceFeed.address}"] },
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${NATIVE_TOKEN.address}", "${PriceFeedBONE.address}", 8, false] },
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${BTC.address}", "${PriceFeedBTC.address}", 8, false] },
    { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${USDC.address}", "${PriceFeedUSDC.address}", 8, true] },

    // { func: "call", contract: "PriceFeedTimelock", method: "setGov", args: ["${SecondaryPriceFeed.address}", "${owner.address}"] },

    { func: "call", contract: "SecondaryPriceFeed", method: "initialize", args: [1, 
        ["${Camper.address}", "${Dicapro1.address}", "${Dicapro2.address}", "${Milos.address}"], 
        ["${updater1.address}", "${updater2.address}", "${updater3.address}", "${updater4.address}"]
    ] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setVaultPriceFeed", args: ["${VaultPriceFeed.address}"] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setMaxTimeDeviation", args: [3600] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setSpreadBasisPointsIfInactive", args: [50] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setSpreadBasisPointsIfChainError", args: [500] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setTokens", args: [
        ["${NATIVE_TOKEN.address}", "${BTC.address}", "${ETH.address}", "${SHIB.address}", "${USDC.address}"],
        [1000000, 1000, 10000, 1000000, 1000000]
    ] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setPriceDataInterval", args: [60] },

    { func: "call", contract: "PositionRouter", method: "setPositionKeeper", args: ["${SecondaryPriceFeed.address}", true] },
    { func: "call", contract: "PositionRouter", method: "setPositionKeeper", args: ["${owner.address}", true] },
    { func: "call", contract: "PositionRouter", method: "setPositionKeeper", args: ["${positionKeeper.address}", true] },
    { func: "call", contract: "FastPriceEvents", method: "setIsPriceFeed", args: ["${SecondaryPriceFeed.address}", true] },

    { func: "call", contract: "VaultPriceFeed", method: "setGov", args: ["${PriceFeedTimelock.address}"] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setGov", args: ["${PriceFeedTimelock.address}"] },
    { func: "call", contract: "SecondaryPriceFeed", method: "setTokenManager", args: ["${TokenManager.address}"] },
    { func: "call", contract: "FastPriceEvents", method: "setGov", args: ["${PriceFeedTimelock.address}"] },

    { func: "deploy", artifact: "GMT", args: ["${parseEther('401000')}"]},
    { func: "deploy", artifact: "StakeManager", args: []},
    { func: "deploy", artifact: "StakedGlp", args: [
        "${GLP.address}",
        "${GlpManager.address}",
        "${StakedGlpTracker.address}",
        "${FeeGlpTracker.address}"    
    ]},
    { func: "call", contract: "FeeGlpTracker", method: "setHandler", args: ["${StakedGlp.address}", true] },
    { func: "call", contract: "StakedGlpTracker", method: "setHandler", args: ["${StakedGlp.address}", true] },
    { func: "deploy", artifact: "GlpBalance", args: ["${GlpManager.address}", "${StakedGlpTracker.address}"]},

    { func: "deploy", artifact: "BalanceUpdater", args: []},
    { func: "deploy", artifact: "BatchSender", args: []},
    { func: "deploy", artifact: "VaultReader", args: []},
    { func: "deploy", artifact: "ShortsTrackerTimelock", args: [
        "${owner.address}", //admin
        1, 300, 20
    ]},
    { func: "call", contract: "ShortsTrackerTimelock", method: "setHandler", args: ["${ShortsTracker.address}", true] },
    { func: "deploy", artifact: "RewardReader", args: []},
    { func: "deploy", artifact: "Reader", args: []},
    { func: "deploy", artifact: "OrderBookReader", args: []},
    
    { func: "wallet", as: "admin", value: "0x49B373D422BdA4C6BfCdd5eC1E48A9a26fdA2F8b" },
    { func: "wallet", as: "TokenManager1", value: "0xddDc546e07f1374A07b270b7d863371e575EA96A" },
    { func: "deploy", artifact: "GmxTimelock", args: [
        "${owner.address}", //admin
        "1",
        "1",
        "${AddressZero.address}",
        "${TokenManager1.address}",//0xddDc546e07f1374A07b270b7d863371e575EA96A
        "${AddressZero.address}",
        "${parseEther('13250000')}"    
    ]},

    { func: "deploy", artifact: "EsGmxBatchSender", args: ["${ES_GMX.address}"]},
    { func: "call", contract: "ES_GMX", method: "gov", as: "govOfEsGMX" },
    { func: "load", artifact: "Timelock", address: "${govOfEsGMX}", as: "govOfEsGMXTimelock" },
    { func: "call", contract: "GmxVester", method: "gov", as: "govOfGmxVester" },
    { func: "load", artifact: "Timelock", address: "${govOfGmxVester}", as: "govOfGmxVesterTimelock" },
    { func: "call", contract: "GlpVester", method: "gov", as: "govOfGlpVester" },
    { func: "load", artifact: "Timelock", address: "${govOfGlpVester}", as: "govOfGlpVesterTimelock" },
    { func: "call", contract: "govOfEsGMXTimelock", method: "signalSetHandler", args: ["${ES_GMX.address}", "${EsGmxBatchSender.address}", true] },
    { func: "call", contract: "govOfGmxVesterTimelock", method: "signalSetHandler", args: ["${GmxVester.address}", "${EsGmxBatchSender.address}", true] },
    { func: "call", contract: "govOfGlpVesterTimelock", method: "signalSetHandler", args: ["${GlpVester.address}", "${EsGmxBatchSender.address}", true] },

    { func: "wallet", as: "mummyClubVester", value: "0x6E3480D6EC39Ec1AAa70F53520F7D682fc4A6347" },
    { func: "deploy", artifact: "contracts/nft/MummyClubSale.sol:MummyClubSale", args: [
        "${owner.address}",//signer
        "${ES_GMX.address}",
        "${mummyClubVester.address}",
    ]},
    { func: "call", contract: "MummyClubSale", method: "setSaleInfo", args: ["50000000000000000", 5000, "388000000000000000000"] },
    { func: "call", contract: "MummyClubSale", method: "flipSaleState", args: [] },
    // { func: "call", contract: "MummyClubSale", method: "setBaseURI", args: ["https://tank-dev-metadata.fiberbox.net/tanks/"] },
    // { func: "call", contract: "ES_GMX", method: "mint", args: ["${mummyClubSale.address}", "${parseEther('2000000')}"] },
    { func: "wallet", as: "pairToken", value: "0x9f528097eFa1CFdEb5EfC3229a2Ee1BA8Dd97A8b" },
    // { func: "deploy", artifact: "MummyClubVester", args: [
    //     "Vested TAIL",
    //     "vTAIL",
    //     "31536000",
    //     "${ES_GMX.address}",        // ES_GMX
    //     "${pairToken.address}",      // UsdcGmx Pair 
    //     "${GMX.address}", // gmx
    //     "${StakedGmxTracker.address}",  // StakedGmxTracker
    // ]},
    

    { func: "deploy", artifact: "YieldToken", args: ["xGambit", "xGMT", "${parseEther('100000')}"]},
    { func: "deploy", artifact: "SnapshotToken", args: ["GMX Snapshot 1", "GMX 1", 0]},
    { func: "call", contract: "SnapshotToken", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "SnapshotToken", method: "setMinter", args: ["${owner.address}", true] },

    { func: "wallet", as: "lockToken", value: "0x0937fd9AEAc5049A13325D8b45c61671FBeD14b2" },
    { func: "deploy", artifact: "LiquidityLocker", args: [
        "${TimeLock.address}",
        "${lockToken.address}",
        "${block.timestamp + 86400 * 20}"    
    ]},

    { func: "wallet", as: "nextTimelock", value: "0x2c79620F6f6eBff251A62eBE3eFfc1C9b7C2209d" },
    { func: "call", contract: "GmxVester", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "GlpVester", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "GlpManager", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "GLP", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "ES_GMX", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "BN_GMX", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "USDG", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "StakedGmxTracker", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "StakedGmxDistributor", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "BonusGmxTracker", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "BonusGmxDistributor", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "FeeGmxTracker", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "FeeGmxDistributor", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "StakedGlpTracker", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "StakedGlpDistributor", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "FeeGlpTracker", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "FeeGlpDistributor", method: "setGov", args: ["${nextTimelock.address}"] },
    { func: "call", contract: "ShortsTracker", method: "setGov", args: ["${nextTimelock.address}"] },

    { func: "call", contract: "Vault", method: "gov", as: "_govOfVault" },
    { func: "load", artifact: "Timelock", address: "${_govOfVault}", as: "_VaultTimelock" },
    { func: "call", contract: "_VaultTimelock", method: "signalSetGov", args: ["${Vault.address}", "${TimeLock.address}"] },
    // { func: "call", contract: "TimeLock", method: "signalSetGov", args: ["${Vault.address}", "${_VaultTimelock.address}"] },


    // local only
    { func: "deploy", artifact: "contracts/uniswap/Factory.sol:PancakeFactory", args: ["${owner.address}"]},
    { func: "init_pair_hash", router: "contracts/uniswap/Router.sol", factory: "PancakeFactory"},
    { func: "deploy", artifact: "contracts/uniswap/Router.sol:PancakeRouter", args: ["${PancakeFactory.address}", "${NATIVE_TOKEN.address}"]},
    // { func: "call", contract: "USDC", method: "approve", args: ["${PancakeRouter.address}", "${parseEther('10000000000000')}"] },
    // { func: "call", contract: "PancakeRouter", method: "addLiquidityETH", overrides: { value: "100000000000000000000" }, args: [
    //     "${USDC.address}", "${parseUnits('182930.248', 6)}", 0, 0, "${owner.address}", "${block.timestamp + 1000}"
    // ]},
    { func: "call", contract: "GMX", method: "mint", args: ["${owner.address}", "${parseEther('10000000')}"] },
    { func: "call", contract: "GMX", method: "approve", args: ["${PancakeRouter.address}", "${parseEther('1000000')}"] },
    { func: "call", contract: "USDC", method: "approve", args: ["${PancakeRouter.address}", "${parseUnits('10000000', 6)}"] },
    { func: "call", contract: "PancakeRouter", method: "addLiquidity", args: [
        "${USDC.address}", "${GMX.address}", "${parseUnits('10000000', 6)}", "${parseEther('1000000')}", 0, 0, "${owner.address}", "${block.timestamp + 1000}"
    ]},
    { func: "call", contract: "PancakeFactory", method: "getPair", args: ["${USDC.address}", "${GMX.address}"], as: "_pairGmxUsdcPool" },
    
    { func: "load", artifact: "contracts/uniswap/IUniswapV2Pair.sol:IUniswapV2Pair", as: "UniswapGmxUsdcPool", address: "${_pairGmxUsdcPool}" },
    { func: "call", contract: "UniswapGmxUsdcPool", method: "balanceOf", args: ["${owner.address}"], as: "_balanceOfGmxUsdc" },
    { func: "call", contract: "UniswapGmxUsdcPool", method: "transfer", args: ["${LiquidityLocker.address}", "${_balanceOfGmxUsdc}"] },

    { func: "call", contract: "PositionRouter", method: "setMaxGlobalSizes", args: [
        ["${NATIVE_TOKEN.address}", "${BTC.address}", "${ETH.address}", "${SHIB.address}"], 
        ["${parseUnits('15', 36)}", "${parseUnits('10', 36)}", "${parseUnits('10', 36)}", "${parseUnits('10', 36)}"], 
        ["${parseUnits('10', 36)}", "${parseUnits('1000', 30)}", "${parseUnits('10', 36)}", "${parseUnits('10', 36)}"]
    ] },
    { func: "call", contract: "PositionManager", method: "setMaxGlobalSizes", args: [
        ["${NATIVE_TOKEN.address}", "${BTC.address}", "${ETH.address}", "${SHIB.address}"], 
        ["${parseUnits('15', 36)}", "${parseUnits('10', 36)}", "${parseUnits('10', 36)}", "${parseUnits('10', 36)}"], 
        ["${parseUnits('10', 36)}", "${parseUnits('1000', 30)}", "${parseUnits('10', 36)}", "${parseUnits('10', 36)}"]
    ] },

    { func: "wallet", value: "0x2fD798a8fcc64Ba1Bc62bF363A6A28F63e93D5b8", as: "tierAccount1" },
    { func: "wallet", value: "0x8Bcf10D5bD8a0FF835221dD2a9C794B435c52813", as: "tierAccount2" },
    { func: "load", artifact: "Timelock", address: "${govOfVault}", as: "TimelockOfValue" },
    { func: "call", contract: "TimelockOfValue", method: "setReferrerTier", args: ["${ReferralStorage.address}", "${tierAccount1.address}", 1] },
    { func: "call", contract: "TimelockOfValue", method: "setReferrerTier", args: ["${ReferralStorage.address}", "${tierAccount2.address}", 1] },

    { func: "call", contract: "TimelockOfValue", method: "setMaxGlobalShortSize", args: ["${Vault.address}", "${NATIVE_TOKEN.address}", "${parseUnits('20000', 30)}"] },
    { func: "call", contract: "TimelockOfValue", method: "setMaxGlobalShortSize", args: ["${Vault.address}", "${BTC.address}", "${parseUnits('20000', 30)}"] },
    { func: "call", contract: "TimelockOfValue", method: "setMaxGlobalShortSize", args: ["${Vault.address}", "${ETH.address}", "${parseUnits('20000', 30)}"] },
    { func: "call", contract: "TimelockOfValue", method: "setMaxGlobalShortSize", args: ["${Vault.address}", "${SHIB.address}", "${parseUnits('20000', 30)}"] },
    { func: "call", contract: "TimelockOfValue", method: "setMaxGlobalShortSize", args: ["${Vault.address}", "${USDC.address}", "${parseUnits('20000', 30)}"] },

    // { func: "call", contract: "TimeLock", method: "setBuffer", args: ["1"] },
    // { func: "call", contract: "PriceFeedTimelock", method: "setBuffer", args: ["1"] },
    // { func: "call", contract: "GmxTimelock", method: "setBuffer", args: ["1"] },
    // { func: "call", contract: "ShortsTrackerTimelock", method: "setBuffer", args: ["1"] },

    // { func: "call", contract: "SecondaryPriceFeed", method: "setPrices", args: [
    //     ["${NATIVE_TOKEN.address}", "${BTC.address}"],
    //     ["${parseUnits('1.75', 30)}", "${parseUnits('28000', 30)}"],
    //     "${block.timestamp}"
    // ] },

    { func: "call", contract: "USDC", method: "approve", args: ["${Router.address}", "${parseUnits('1000', 6)}"] },
    { func: "call", contract: "NATIVE_TOKEN", method: "deposit", overrides: {value: "1000000000000000000"} },
    { func: "call", contract: "NATIVE_TOKEN", method: "approve", args: ["${Router.address}", "${parseUnits('1', 18)}"] },
    { func: "call", contract: "BTC", method: "approve", args: ["${Router.address}", "${parseUnits('100', 8)}"] },
    { func: "call", contract: "Router", method: "directPoolDeposit", args: ["${USDC.address}", "${parseUnits('1000', 6)}"] },
    { func: "call", contract: "Router", method: "directPoolDeposit", args: ["${NATIVE_TOKEN.address}", "${parseUnits('1', 18)}"] },
    { func: "call", contract: "Router", method: "directPoolDeposit", args: ["${BTC.address}", "${parseUnits('100', 8)}"] },
    { func: "call", contract: "ETH", method: "approve", args: ["${Router.address}", "${parseUnits('1000', 18)}"] },
    { func: "call", contract: "Router", method: "directPoolDeposit", args: ["${ETH.address}", "${parseUnits('1000', 18)}"] },
    { func: "call", contract: "SHIB", method: "approve", args: ["${Router.address}", "${parseUnits('1000000', 18)}"] },
    { func: "call", contract: "Router", method: "directPoolDeposit", args: ["${SHIB.address}", "${parseUnits('1000000', 18)}"] },
    
    // { func: "call", contract: "ES_GMX", method: "setMinter", args: ["${owner.address}", true] },
    // { func: "call", contract: "ES_GMX", method: "mint", args: ["${StakedGmxDistributor.address}", "${parseEther('600000')}"] },
    // { func: "call", contract: "ES_GMX", method: "mint", args: ["${StakedGlpDistributor.address}", "${parseEther('600000')}"] },
    // { func: "call", contract: "BN_GMX", method: "setMinter", args: ["${owner.address}", true] },
    // { func: "call", contract: "BN_GMX", method: "mint", args: ["${BonusGmxDistributor.address}", "${parseEther('15000000')}"] },
    { func: "call", contract: "NATIVE_TOKEN", method: "deposit", overrides: {value: "2000000000000000000"}, key: "deposit 2BONE" },
    { func: "call", contract: "NATIVE_TOKEN", method: "transfer", args: ["${FeeGmxDistributor.address}", "${parseEther('1')}"] },
    { func: "call", contract: "NATIVE_TOKEN", method: "transfer", args: ["${FeeGlpDistributor.address}", "${parseEther('1')}"] },

    { func: "call", contract: "StakedGmxDistributor", method: "setTokensPerInterval", args: ["20667989410000000"] },
    { func: "call", contract: "StakedGlpDistributor", method: "setTokensPerInterval", args: ["10667989410000000"] },

    { func: "call", contract: "FeeGmxDistributor", method: "setTokensPerInterval", args: ["20000000000"] },
    { func: "call", contract: "FeeGlpDistributor", method: "setTokensPerInterval", args: ["20000000000"] },

    { func: "call", contract: "StakedGmxTracker", method: "updateRewards" },
    { func: "call", contract: "StakedGlpTracker", method: "updateRewards" },
    { func: "call", contract: "FeeGmxTracker", method: "updateRewards" },
    { func: "call", contract: "FeeGlpTracker", method: "updateRewards" },
    { func: "call", contract: "BonusGmxTracker", method: "updateRewards" },

    { func: "call", contract: "StakedGmxDistributor", method: "updateLastDistributionTime" },
    { func: "call", contract: "StakedGlpDistributor", method: "updateLastDistributionTime" },
    { func: "call", contract: "FeeGmxDistributor", method: "updateLastDistributionTime" },
    { func: "call", contract: "FeeGlpDistributor", method: "updateLastDistributionTime" },
    { func: "call", contract: "BonusGmxDistributor", method: "updateLastDistributionTime" },

    { func: "call", contract: "PriceFeedTimelock", method: "signalSetPriceFeedUpdater", args: ["${SecondaryPriceFeed.address}", "${localPriceUpdater.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "signalSetPriceFeedUpdater", args: ["${SecondaryPriceFeed.address}", "${backendPriceUpdater.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setPriceFeedUpdater", args: ["${SecondaryPriceFeed.address}", "${localPriceUpdater.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setPriceFeedUpdater", args: ["${SecondaryPriceFeed.address}", "${backendPriceUpdater.address}", true] },
    // { func: "call", contract: "PriceFeedTimelock", method: "setGov", args: ["${Vault.address}", "${PriceFeedTimelock.address}"] },
    // { func: "call", contract: "PriceFeedTimelock", method: "setGov", args: ["${VaultPriceFeed.address}", "${PriceFeedTimelock.address}"] },
    // { func: "call", contract: "PriceFeedTimelock", method: "setGov", args: ["${SecondaryPriceFeed.address}", "${PriceFeedTimelock.address}"] },

    { func: "save", contracts: [
        "NATIVE_TOKEN", "BTC", "ETH", "SHIB", "USDC",
        "Vault", "Router", "VaultReader", "Reader", "GlpManager", "RewardRouter", "GlpRewardRouter", "RewardReader", 
        "GLP", "GMX", "ES_GMX", "BN_GMX", "USDG", "ES_GMX_IOU",
        "StakedGmxTracker", "BonusGmxTracker", "FeeGmxTracker", "StakedGlpTracker", "FeeGlpTracker",
        "StakedGmxDistributor", "StakedGlpDistributor",
        "GmxVester", "GlpVester",
        "OrderBook", "OrderExecutor", "OrderBookReader",
        "PositionRouter", "PositionManager",
        "UniswapMmyFtmPool", "UniswapGmxUsdcPool", "ReferralStorage",
        "ReferralReader",
        "TimeLock", "SecondaryPriceFeed",
        "LiquidityLock", "MummyClubNFT", "MummyClubNFTStaking", "MummyClubSale", "MummyClubVester"
    ] }
]