module.exports = [
    { func: "wallet", as: "owner", value: "#1" },
    { func: "wallet", as: "tester", value: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" },
    { func: "wallet", as: "Camper", value: "0xB4bAc8b01397ACbBCEecf1B1e0871a249DA6D37e" },
    { func: "wallet", as: "Dicapro1", value: "0xcb2D1CF1ecDeF32a0BFa3C39d74F74AB7454E70B" },
    { func: "wallet", as: "Dicapro2", value: "0x2c215acdA3D070558cF3851AF0Ac7f75B4A233F4" },
    { func: "wallet", as: "Milos", value: "0xef249ab821DFc8e54375f4770DF1722f4DA981ed" },
    { func: "wallet", as: "NATIVE_TOKEN", value: "0x0000000000000000000000000000000000000000" },
    { func: "wallet", as: "AddressZero", value: "0x0000000000000000000000000000000000000000" },

    // TokenManager
    { func: "redeploy", artifact: "TokenManager", args: [4] },
    {
        func: "call",
        contract: "TokenManager",
        method: "initialize",
        args: [ ["${Camper.address}", "${Dicapro1.address}", "${Dicapro2.address}", "${Milos.address}"] ]
    },

    // Vault
    { func: "redeploy", artifact: "Vault" },
    { func: "deploy", artifact: "USDG", args: ["${Vault.address}"] },
    { func: "redeploy", artifact: "Router", args: ["${Vault.address}", "${USDG.address}", "${NATIVE_TOKEN.address}"] },
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
    { func: "redeploy", artifact: "VaultErrorController" },
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

    // whitelist
    // { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${VaultUtils.address}"] },

    { func: "redeploy", artifact: "OrderBook", args: [] },
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
    { func: "deploy", artifact: "BonusDistributor", as: "bonusGmxDistributor", args: ["${BN_GMX.address}","${BonusGmxTracker.address}"] },
    { func: "call", contract: "BonusGmxTracker", method: "initialize", args: [
        ["${StakedGmxTracker.address}"], "${bonusGmxDistributor.address}"
    ] },
    { func: "call", contract: "bonusGmxDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "deploy", artifact: "RewardTracker", as: "FeeGmxTracker", args: ["Staked + Bonus + Fee GMX", "sbfGMX"] },
    { func: "deploy", artifact: "RewardDistributor", as: "feeGmxDistributor", args: ["${NATIVE_TOKEN.address}","${FeeGmxTracker.address}"] },
    { func: "call", contract: "FeeGmxTracker", method: "initialize", args: [
        ["${BonusGmxTracker.address}","${bonusGmxDistributor.address}"], "${feeGmxDistributor.address}"
    ] },
    { func: "call", contract: "feeGmxDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "deploy", artifact: "RewardTracker", as: "FeeGlpTracker", args: ["Fee GLP", "fGLP"] },
    { func: "deploy", artifact: "RewardDistributor", as: "feeGlpDistributor", args: ["${NATIVE_TOKEN.address}","${FeeGlpTracker.address}"] },
    { func: "call", contract: "FeeGlpTracker", method: "initialize", args: [
        ["${GLP.address}"], "${feeGlpDistributor.address}"
    ] },
    { func: "call", contract: "feeGlpDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "deploy", artifact: "RewardTracker", as: "StakedGlpTracker", args: ["Fee + Staked GLP", "fsGLP"] },
    { func: "deploy", artifact: "RewardDistributor", as: "StakedGlpDistributor", args: ["${ES_GMX.address}","${StakedGlpTracker.address}"] },
    { func: "call", contract: "StakedGlpTracker", method: "initialize", args: [
        ["${StakedGlpTracker.address}"], "${StakedGlpDistributor.address}"
    ] },
    { func: "call", contract: "StakedGlpDistributor", method: "updateLastDistributionTime", args: [] },

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

    { func: "redeploy", artifact: "contracts/staking/Vester.sol:Vester", as: "GmxVester", args: [
        "Vested GMX", // _name
        "vGMX", // _symbol
        "${365 * 24 * 60 * 60}", // _vestingDuration
        "${ES_GMX.address}", // _esToken
        "${FeeGmxTracker.address}", // _pairToken
        "${GMX.address}", // _claimableToken
        "${StakedGmxTracker.address}", // _rewardTracker
    ] },

    { func: "redeploy", artifact: "contracts/staking/Vester.sol:Vester", as: "GlpVester", args: [
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

    { func: "redeploy", artifact: "RewardRouterV2", as: "RewardRouter", args: []},
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
    { func: "call", contract: "bonusGmxDistributor", method: "setBonusMultiplier", args: ["10000"] },
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

    { func: "redeploy", artifact: "RewardRouterV2", as: "glpRewardRouter", args: []},
    { func: "call", contract: "glpRewardRouter", method: "initialize", args: [
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
    { func: "call", contract: "FeeGlpTracker", method: "setHandler", args: ["${glpRewardRouter.address}", true] },
    { func: "call", contract: "StakedGlpTracker", method: "setHandler", args: ["${glpRewardRouter.address}", true] },
    { func: "call", contract: "GlpManager", method: "setHandler", args: ["${glpRewardRouter.address}", true] },

    { func: "deploy", artifact: "Timelock", args: [
        "${owner.address}", // admin ???
        "${2 * 60}", // buffer
        "${Vault.address}", // tokenManager
        "${Vault.address}", // mintReceiver
        "${GlpManager.address}", // glpManager
        "${RewardRouter.address}", // RewardRouter
        "${parseEther('13250000')}", // maxTokenSupply
        "10", // marginFeeBasisPoints 0.1%
        "500" // maxMarginFeeBasisPoints 5%    
    ]},
    { func: "call", contract: "Timelock", method: "setMarginFeeBasisPoints", args: [10, 500] },
    { func: "call", contract: "Timelock", method: "setShouldToggleIsLeverageEnabled", args: [true] },
    
    { func: "call", contract: "Vault", method: "setGov", args: ["${Timelock.address}"] },
    { func: "call", contract: "VaultErrorController", method: "setGov", args: ["${Timelock.address}"] },
    { func: "call", contract: "VaultUtils", method: "setGov", args: ["${Timelock.address}"] },
    
    { func: "call", contract: "Timelock", method: "setContractHandler", args: ["${Camper.address}", true] },
    { func: "call", contract: "Timelock", method: "setContractHandler", args: ["${Dicapro1.address}", true] },
    { func: "call", contract: "Timelock", method: "setContractHandler", args: ["${Dicapro2.address}", true] },

    { func: "call", contract: "Timelock", method: "setKeeper", args: ["${owner.address}", true] },

    { func: "call", contract: "Timelock", method: "signalApprove", args: ["${GMX.address}", "${owner.address}", "1000000000000000000"] },

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

    { func: "call", contract: "Timelock", method: "setContractHandler", args: ["${PositionManager.address}", true] },

    { func: "call", contract: "Timelock", method: "setLiquidator", args: ["${Vault.address}", "${PositionManager.address}", true] },

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
    { func: "call", contract: "Timelock", method: "setContractHandler", args: ["${PositionRouter.address}", true] },

    { func: "call", contract: "PositionRouter", method: "setGov", args: ["${govOfVault}"] },
    
    { func: "deploy", artifact: "ReferralReader", args: []},
    
    { func: "redeploy", artifact: "ReferralStorage", args: []},

    { func: "call", contract: "PositionRouter", method: "setReferralStorage", args: ["${ReferralStorage.address}"] },
    { func: "call", contract: "PositionManager", method: "setReferralStorage", args: ["${ReferralStorage.address}"] },
    { func: "call", contract: "ReferralStorage", method: "setHandler", args: ["${PositionRouter.address}", true] },
    { func: "call", contract: "ReferralStorage", method: "setTier", args: [0, 1000, 5000] },
    { func: "call", contract: "ReferralStorage", method: "setTier", args: [1, 2000, 5000] },
    { func: "call", contract: "ReferralStorage", method: "setTier", args: [2, 5000, 4000] },
    { func: "call", contract: "ReferralStorage", method: "setGov", args: ["${govOfVault}"] },
    
    { func: "deploy", artifact: "PriceFeedTimelock", args: [
        "${owner.address}",//signer
        "${2 * 60}",
        "${TokenManager.address}"    
    ]},
    { func: "call", contract: "PriceFeedTimelock", method: "setContractHandler", args: ["${Camper.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setContractHandler", args: ["${Dicapro1.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setContractHandler", args: ["${Dicapro2.address}", true] },

    { func: "call", contract: "PriceFeedTimelock", method: "setKeeper", args: ["${Camper.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setKeeper", args: ["${Dicapro1.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setKeeper", args: ["${Dicapro2.address}", true] },
    { func: "call", contract: "PriceFeedTimelock", method: "setKeeper", args: ["${owner.address}", true] },

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
        60, 300, 20
    ]},
    { func: "call", contract: "ShortsTrackerTimelock", method: "setHandler", args: ["${ShortsTracker.address}", true] },
    { func: "deploy", artifact: "RewardReader", args: []},
    { func: "deploy", artifact: "Reader", args: []},
    { func: "deploy", artifact: "OrderBookReader", args: []},
    
    { func: "wallet", as: "admin", value: "0x49B373D422BdA4C6BfCdd5eC1E48A9a26fdA2F8b" },
    { func: "wallet", as: "TokenManager1", value: "0xddDc546e07f1374A07b270b7d863371e575EA96A" },
    { func: "deploy", artifact: "GmxTimelock", args: [
        "${admin.address}",//0x49B373D422BdA4C6BfCdd5eC1E48A9a26fdA2F8b
        "${24 * 60 * 60}",
        "${7 * 24 * 60 * 60}",
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
        "${Timelock.address}",
        "${lockToken.address}",
        1681811161    
    ]},

    // { func: "wallet", as: "targetPeripheral", value: "0x5aeCDD22cDA7D2010631D71b268D5479e1d2B8f4" },//need to change address
    // { func: "load", artifact: "Timelock", address: "${targetPeripheral}", as: "govOfVaultTimelockNext" },
    // { func: "load", artifact: "Timelock", address: "${govOfVault}", as: "govOfVaultTimelockPrev" },
    // { func: "call", contract: "govOfVaultTimelockPrev", method: "signalSetGov", args: ["${govOfVault.address}", "${govOfVaultTimelockNext.address}"] },
    // { func: "call", contract: "govOfVaultTimelockNext", method: "signalSetGov", args: ["${govOfVault.address}", "${govOfVaultTimelockPrev.address}"] },


    // local only
    { func: "deploy", artifact: "WETH", args: [
        "Etherium",
        "WETH",
        18    
    ]},


]