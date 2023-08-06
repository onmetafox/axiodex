module.exports = [
    { func: "wallet", as: "owner", value: "#1" },
    { func: "wallet", as: "tester", value: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" },
    { func: "wallet", as: "Camper", value: "0xB4bAc8b01397ACbBCEecf1B1e0871a249DA6D37e" },
    { func: "wallet", as: "Dicapro1", value: "0xcb2D1CF1ecDeF32a0BFa3C39d74F74AB7454E70B" },
    { func: "wallet", as: "Dicapro2", value: "0x2c215acdA3D070558cF3851AF0Ac7f75B4A233F4" },
    { func: "wallet", as: "Milos", value: "0xef249ab821DFc8e54375f4770DF1722f4DA981ed" },
    { func: "wallet", as: "nativeToken", value: "0x0000000000000000000000000000000000000000" },
    { func: "wallet", as: "AddressZero", value: "0x0000000000000000000000000000000000000000" },

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
    { func: "deploy", artifact: "Router", args: ["${Vault.address}", "${USDG.address}", "${nativeToken.address}"] },
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

    // whitelist
    // { func: "call", contract: "VaultPriceFeed", method: "setTokenConfig", args: ["${VaultUtils.address}"] },

    { func: "deploy", artifact: "OrderBook", args: [] },
    { func: "call", contract: "OrderBook", method: "initialize", args: [
        "${Router.address}",  // router
        "${Vault.address}", // vault
        "${nativeToken.address}", // weth
        "${USDG.address}", // usdg
        "10000000000000000", // 0.01 AVAX
        "${parseUnits('10', 30)}" // min purchase token amount usd
    ] },

    { func: "deploy", artifact: "OrderExecutor", args: ["${Vault.address}","${OrderBook.address}"] },

    { func: "deploy", artifact: "GMX", args: [] },
    { func: "call", contract: "GMX", method: "setMinter", args: ["${owner.address}", true] },

    //deployRewardRouterV2
    { func: "deploy", artifact: "EsGMX", args: [] },
    { func: "deploy", artifact: "MintableBaseToken", as: "BnGMX", args: ["Bonus GMX", "bnGMX", 0] },
    { func: "call", contract: "EsGMX", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "GLP", method: "setInPrivateTransferMode", args: [true] },

    { func: "deploy", artifact: "RewardTracker", as: "stakedGmxTracker", args: ["Staked GMX", "sGMX"] },
    { func: "deploy", artifact: "RewardDistributor", as: "stakedGmxDistributor", args: ["${EsGMX.address}","${stakedGmxTracker.address}"] },
    { func: "call", contract: "stakedGmxTracker", method: "initialize", args: [
        ["${GMX.address}","${EsGMX.address}"], "${stakedGmxDistributor.address}"
    ] },
    { func: "call", contract: "stakedGmxDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "deploy", artifact: "RewardTracker", as: "bonusGmxTracker", args: ["Staked + Bonus GMX", "sbGMX"] },
    { func: "deploy", artifact: "BonusDistributor", as: "bonusGmxDistributor", args: ["${BnGMX.address}","${bonusGmxTracker.address}"] },
    { func: "call", contract: "bonusGmxTracker", method: "initialize", args: [
        ["${stakedGmxTracker.address}"], "${bonusGmxDistributor.address}"
    ] },
    { func: "call", contract: "bonusGmxDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "deploy", artifact: "RewardTracker", as: "feeGmxTracker", args: ["Staked + Bonus + Fee GMX", "sbfGMX"] },
    { func: "deploy", artifact: "RewardDistributor", as: "feeGmxDistributor", args: ["${nativeToken.address}","${feeGmxTracker.address}"] },
    { func: "call", contract: "feeGmxTracker", method: "initialize", args: [
        ["${bonusGmxTracker.address}","${bonusGmxDistributor.address}"], "${feeGmxDistributor.address}"
    ] },
    { func: "call", contract: "feeGmxDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "deploy", artifact: "RewardTracker", as: "feeGlpTracker", args: ["Fee GLP", "fGLP"] },
    { func: "deploy", artifact: "RewardDistributor", as: "feeGlpDistributor", args: ["${nativeToken.address}","${feeGlpTracker.address}"] },
    { func: "call", contract: "feeGlpTracker", method: "initialize", args: [
        ["${GLP.address}"], "${feeGlpDistributor.address}"
    ] },
    { func: "call", contract: "feeGlpDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "deploy", artifact: "RewardTracker", as: "stakedGlpTracker", args: ["Fee + Staked GLP", "fsGLP"] },
    { func: "deploy", artifact: "RewardDistributor", as: "stakedGlpDistributor", args: ["${EsGMX.address}","${stakedGlpTracker.address}"] },
    { func: "call", contract: "stakedGlpTracker", method: "initialize", args: [
        ["${stakedGlpTracker.address}"], "${stakedGlpDistributor.address}"
    ] },
    { func: "call", contract: "stakedGlpDistributor", method: "updateLastDistributionTime", args: [] },

    { func: "call", contract: "stakedGmxTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "stakedGmxTracker", method: "setInPrivateStakingMode", args: [true] },
    { func: "call", contract: "bonusGmxTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "bonusGmxTracker", method: "setInPrivateStakingMode", args: [true] },
    { func: "call", contract: "bonusGmxTracker", method: "setInPrivateClaimingMode", args: [true] },
    { func: "call", contract: "feeGmxTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "feeGmxTracker", method: "setInPrivateStakingMode", args: [true] },

    { func: "call", contract: "feeGlpTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "feeGlpTracker", method: "setInPrivateStakingMode", args: [true] },
    { func: "call", contract: "stakedGlpTracker", method: "setInPrivateTransferMode", args: [true] },
    { func: "call", contract: "stakedGlpTracker", method: "setInPrivateStakingMode", args: [true] },

    { func: "deploy", artifact: "contracts/staking/Vester.sol:Vester", as: "gmxVester", args: [
        "Vested GMX", // _name
        "vGMX", // _symbol
        "${365 * 24 * 60 * 60}", // _vestingDuration
        "${EsGMX.address}", // _esToken
        "${feeGmxTracker.address}", // _pairToken
        "${GMX.address}", // _claimableToken
        "${stakedGmxTracker.address}", // _rewardTracker
    ] },

    { func: "deploy", artifact: "contracts/staking/Vester.sol:Vester", as: "glpVester", args: [
        "Vested GLP", // _name
        "vGLP", // _symbol
        "${365 * 24 * 60 * 60}", // _vestingDuration
        "${EsGMX.address}", // _esToken
        "${stakedGlpTracker.address}", // _pairToken
        "${GMX.address}", // _claimableToken
        "${stakedGlpTracker.address}", // _rewardTracker
    ] },

    { func: "call", contract: "GMX", method: "mint", args: ["${gmxVester.address}", "${parseEther('40000')}"] },
    { func: "call", contract: "GMX", method: "mint", args: ["${glpVester.address}", "${parseEther('20000')}"] },

    { func: "deploy", artifact: "RewardRouterV2", as: "rewardRouter", args: []},
    { func: "call", contract: "rewardRouter", method: "initialize", args: [
        "${nativeToken.address}",
        "${GMX.address}",
        "${EsGMX.address}",
        "${BnGMX.address}",
        "${GLP.address}",
        "${stakedGmxTracker.address}",
        "${bonusGmxTracker.address}",
        "${feeGmxTracker.address}",
        "${feeGlpTracker.address}",
        "${stakedGlpTracker.address}",
        "${GlpManager.address}",
        "${gmxVester.address}",
        "${glpVester.address}"    
    ] },

    { func: "call", contract: "GlpManager", method: "setHandler", args: ["${rewardRouter.address}", true] },

    { func: "call", contract: "stakedGmxTracker", method: "setHandler", args: ["${rewardRouter.address}", true] },
    { func: "call", contract: "stakedGmxTracker", method: "setHandler", args: ["${bonusGmxTracker.address}", true] },

    { func: "call", contract: "bonusGmxTracker", method: "setHandler", args: ["${rewardRouter.address}", true] },
    { func: "call", contract: "bonusGmxTracker", method: "setHandler", args: ["${feeGmxTracker.address}", true] },
    { func: "call", contract: "bonusGmxDistributor", method: "setBonusMultiplier", args: ["10000"] },
    { func: "call", contract: "feeGmxTracker", method: "setHandler", args: ["${rewardRouter.address}", true] },

    { func: "call", contract: "EsGMX", method: "setHandler", args: ["${stakedGmxTracker.address}", true] },
    { func: "call", contract: "BnGMX", method: "setHandler", args: ["${feeGmxTracker.address}", true] },
    { func: "call", contract: "BnGMX", method: "setHandler", args: ["${rewardRouter.address}", true] },

    { func: "call", contract: "feeGlpTracker", method: "setHandler", args: ["${stakedGlpTracker.address}", true] },
    { func: "call", contract: "GLP", method: "setHandler", args: ["${feeGlpTracker.address}", true] },
    { func: "call", contract: "feeGlpTracker", method: "setHandler", args: ["${rewardRouter.address}", true] },
    
    { func: "call", contract: "stakedGlpTracker", method: "setHandler", args: ["${rewardRouter.address}", true] },
    
    { func: "call", contract: "EsGMX", method: "setHandler", args: ["${rewardRouter.address}", true] },
    { func: "call", contract: "EsGMX", method: "setHandler", args: ["${stakedGmxDistributor.address}", true] },
    
    { func: "call", contract: "EsGMX", method: "setHandler", args: ["${stakedGlpDistributor.address}", true] },
    { func: "call", contract: "EsGMX", method: "setHandler", args: ["${stakedGlpTracker.address}", true] },
    { func: "call", contract: "EsGMX", method: "setHandler", args: ["${gmxVester.address}", true] },
    { func: "call", contract: "EsGMX", method: "setHandler", args: ["${glpVester.address}", true] },

    { func: "call", contract: "EsGMX", method: "setHandler", args: ["${gmxVester.address}", true] },
    { func: "call", contract: "EsGMX", method: "setHandler", args: ["${glpVester.address}", true] },

    { func: "call", contract: "gmxVester", method: "setHandler", args: ["${rewardRouter.address}", true] },
    { func: "call", contract: "glpVester", method: "setHandler", args: ["${rewardRouter.address}", true] },

    { func: "call", contract: "feeGmxTracker", method: "setHandler", args: ["${gmxVester.address}", true] },
    { func: "call", contract: "stakedGlpTracker", method: "setHandler", args: ["${glpVester.address}", true] },

    { func: "deploy", artifact: "RewardRouterV2", as: "glpRewardRouter", args: []},
    { func: "call", contract: "glpRewardRouter", method: "initialize", args: [
        "${nativeToken.address}",
        "${AddressZero.address}",
        "${AddressZero.address}",
        "${AddressZero.address}",
        "${GLP.address}",
        "${AddressZero.address}",
        "${AddressZero.address}",
        "${AddressZero.address}",
        "${feeGlpTracker.address}",
        "${stakedGlpTracker.address}",
        "${GlpManager.address}",
        "${AddressZero.address}",
        "${AddressZero.address}"    
    ] },
    { func: "call", contract: "feeGlpTracker", method: "setHandler", args: ["${glpRewardRouter.address}", true] },
    { func: "call", contract: "stakedGlpTracker", method: "setHandler", args: ["${glpRewardRouter.address}", true] },
    { func: "call", contract: "GlpManager", method: "setHandler", args: ["${glpRewardRouter.address}", true] },

    { func: "deploy", artifact: "Timelock", args: [
        "${owner.address}", // admin ???
        "${2 * 60}", // buffer
        "${Vault.address}", // tokenManager
        "${Vault.address}", // mintReceiver
        "${GlpManager.address}", // glpManager
        "${rewardRouter.address}", // rewardRouter
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
        "${nativeToken.address}", 
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
        "${nativeToken.address}", 
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
        "${stakedGlpTracker.address}",
        "${feeGlpTracker.address}"    
    ]},
    { func: "call", contract: "feeGlpTracker", method: "setHandler", args: ["${StakedGlp.address}", true] },
    { func: "call", contract: "stakedGlpTracker", method: "setHandler", args: ["${StakedGlp.address}", true] },
    { func: "deploy", artifact: "GlpBalance", args: ["${GlpManager.address}", "${stakedGlpTracker.address}"]},

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

    { func: "deploy", artifact: "EsGmxBatchSender", args: ["${EsGMX.address}"]},
    { func: "call", contract: "EsGMX", method: "gov", as: "govOfEsGMX" },
    { func: "load", artifact: "Timelock", address: "${govOfEsGMX}", as: "govOfEsGMXTimelock" },
    { func: "call", contract: "gmxVester", method: "gov", as: "govOfGmxVester" },
    { func: "load", artifact: "Timelock", address: "${govOfGmxVester}", as: "govOfGmxVesterTimelock" },
    { func: "call", contract: "glpVester", method: "gov", as: "govOfGlpVester" },
    { func: "load", artifact: "Timelock", address: "${govOfGlpVester}", as: "govOfGlpVesterTimelock" },
    { func: "call", contract: "govOfEsGMXTimelock", method: "signalSetHandler", args: ["${EsGMX.address}", "${EsGmxBatchSender.address}", true] },
    { func: "call", contract: "govOfGmxVesterTimelock", method: "signalSetHandler", args: ["${gmxVester.address}", "${EsGmxBatchSender.address}", true] },
    { func: "call", contract: "govOfGlpVesterTimelock", method: "signalSetHandler", args: ["${glpVester.address}", "${EsGmxBatchSender.address}", true] },

    { func: "wallet", as: "mummyClubVester", value: "0x6E3480D6EC39Ec1AAa70F53520F7D682fc4A6347" },
    { func: "deploy", artifact: "contracts/nft/MummyClubSale.sol:MummyClubSale", args: [
        "${owner.address}",//signer
        "${EsGMX.address}",
        "${mummyClubVester.address}",
    ]},
    { func: "call", contract: "MummyClubSale", method: "setSaleInfo", args: ["50000000000000000", 5000, "388000000000000000000"] },
    { func: "call", contract: "MummyClubSale", method: "flipSaleState", args: [] },
    // { func: "call", contract: "MummyClubSale", method: "setBaseURI", args: ["https://tank-dev-metadata.fiberbox.net/tanks/"] },
    // { func: "call", contract: "EsGMX", method: "mint", args: ["${mummyClubSale.address}", "${parseEther('2000000')}"] },
    { func: "wallet", as: "pairToken", value: "0x9f528097eFa1CFdEb5EfC3229a2Ee1BA8Dd97A8b" },
    // { func: "deploy", artifact: "MummyClubVester", args: [
    //     "Vested TAIL",
    //     "vTAIL",
    //     "31536000",
    //     "${EsGMX.address}",        // esGmx
    //     "${pairToken.address}",      // UsdcGmx Pair 
    //     "${GMX.address}", // gmx
    //     "${stakedGmxTracker.address}",  // stakedGmxTracker
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
]