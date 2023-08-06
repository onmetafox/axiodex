// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";
import "../libraries/utils/Address.sol";

import "./interfaces/IRewardTracker.sol";
import "../tokens/interfaces/IMintable.sol";
import "../tokens/interfaces/IWETH.sol";
import "../core/interfaces/IAlpManager.sol";
import "../access/Governable.sol";

contract RewardRouter is ReentrancyGuard, Governable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    bool public isInitialized;

    address public weth;

    address public axn;
    address public esAxn;
    address public bnAxn;

    address public alp; // AXN Liquidity Provider token

    address public stakedAxnTracker;
    address public bonusAxnTracker;
    address public feeAxnTracker;

    address public stakedAlpTracker;
    address public feeAlpTracker;

    address public alpManager;

    event StakeAxn(address account, uint256 amount);
    event UnstakeAxn(address account, uint256 amount);

    event StakeAlp(address account, uint256 amount);
    event UnstakeAlp(address account, uint256 amount);

    receive() external payable {
        require(msg.sender == weth, "Router: invalid sender");
    }

    function initialize(
        address _weth,
        address _axn,
        address _esAxn,
        address _bnAxn,
        address _alp,
        address _stakedAxnTracker,
        address _bonusAxnTracker,
        address _feeAxnTracker,
        address _feeAlpTracker,
        address _stakedAlpTracker,
        address _alpManager
    ) external onlyGov {
        require(!isInitialized, "RewardRouter: already initialized");
        isInitialized = true;

        weth = _weth;

        axn = _axn;
        esAxn = _esAxn;
        bnAxn = _bnAxn;

        alp = _alp;

        stakedAxnTracker = _stakedAxnTracker;
        bonusAxnTracker = _bonusAxnTracker;
        feeAxnTracker = _feeAxnTracker;

        feeAlpTracker = _feeAlpTracker;
        stakedAlpTracker = _stakedAlpTracker;

        alpManager = _alpManager;
    }

    // to help users who accidentally send their tokens to this contract
    function withdrawToken(address _token, address _account, uint256 _amount) external onlyGov {
        IERC20(_token).safeTransfer(_account, _amount);
    }

    function batchStakeAxnForAccount(address[] memory _accounts, uint256[] memory _amounts) external nonReentrant onlyGov {
        address _axn = axn;
        for (uint256 i = 0; i < _accounts.length; i++) {
            _stakeAxn(msg.sender, _accounts[i], _axn, _amounts[i]);
        }
    }

    function stakeAxnForAccount(address _account, uint256 _amount) external nonReentrant onlyGov {
        _stakeAxn(msg.sender, _account, axn, _amount);
    }

    function stakeAxn(uint256 _amount) external nonReentrant {
        _stakeAxn(msg.sender, msg.sender, axn, _amount);
    }

    function stakeEsAxn(uint256 _amount) external nonReentrant {
        _stakeAxn(msg.sender, msg.sender, esAxn, _amount);
    }

    function unstakeAxn(uint256 _amount) external nonReentrant {
        _unstakeAxn(msg.sender, axn, _amount);
    }

    function unstakeEsAxn(uint256 _amount) external nonReentrant {
        _unstakeAxn(msg.sender, esAxn, _amount);
    }

    function mintAndStakeAlp(address _token, uint256 _amount, uint256 _minUsdg, uint256 _minAlp) external nonReentrant returns (uint256) {
        require(_amount > 0, "RewardRouter: invalid _amount");

        address account = msg.sender;
        uint256 alpAmount = IAlpManager(alpManager).addLiquidityForAccount(account, account, _token, _amount, _minUsdg, _minAlp);
        IRewardTracker(feeAlpTracker).stakeForAccount(account, account, alp, alpAmount);
        IRewardTracker(stakedAlpTracker).stakeForAccount(account, account, feeAlpTracker, alpAmount);

        emit StakeAlp(account, alpAmount);

        return alpAmount;
    }

    function mintAndStakeAlpETH(uint256 _minUsdg, uint256 _minAlp) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "RewardRouter: invalid msg.value");

        IWETH(weth).deposit{value: msg.value}();
        IERC20(weth).approve(alpManager, msg.value);

        address account = msg.sender;
        uint256 alpAmount = IAlpManager(alpManager).addLiquidityForAccount(address(this), account, weth, msg.value, _minUsdg, _minAlp);

        IRewardTracker(feeAlpTracker).stakeForAccount(account, account, alp, alpAmount);
        IRewardTracker(stakedAlpTracker).stakeForAccount(account, account, feeAlpTracker, alpAmount);

        emit StakeAlp(account, alpAmount);

        return alpAmount;
    }

    function unstakeAndRedeemAlp(address _tokenOut, uint256 _alpAmount, uint256 _minOut, address _receiver) external nonReentrant returns (uint256) {
        require(_alpAmount > 0, "RewardRouter: invalid _alpAmount");

        address account = msg.sender;
        IRewardTracker(stakedAlpTracker).unstakeForAccount(account, feeAlpTracker, _alpAmount, account);
        IRewardTracker(feeAlpTracker).unstakeForAccount(account, alp, _alpAmount, account);
        uint256 amountOut = IAlpManager(alpManager).removeLiquidityForAccount(account, _tokenOut, _alpAmount, _minOut, _receiver);

        emit UnstakeAlp(account, _alpAmount);

        return amountOut;
    }

    function unstakeAndRedeemAlpETH(uint256 _alpAmount, uint256 _minOut, address payable _receiver) external nonReentrant returns (uint256) {
        require(_alpAmount > 0, "RewardRouter: invalid _alpAmount");

        address account = msg.sender;
        IRewardTracker(stakedAlpTracker).unstakeForAccount(account, feeAlpTracker, _alpAmount, account);
        IRewardTracker(feeAlpTracker).unstakeForAccount(account, alp, _alpAmount, account);
        uint256 amountOut = IAlpManager(alpManager).removeLiquidityForAccount(account, weth, _alpAmount, _minOut, address(this));

        IWETH(weth).withdraw(amountOut);

        _receiver.sendValue(amountOut);

        emit UnstakeAlp(account, _alpAmount);

        return amountOut;
    }

    function claim() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeAxnTracker).claimForAccount(account, account);
        IRewardTracker(feeAlpTracker).claimForAccount(account, account);

        IRewardTracker(stakedAxnTracker).claimForAccount(account, account);
        IRewardTracker(stakedAlpTracker).claimForAccount(account, account);
    }

    function claimEsAxn() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(stakedAxnTracker).claimForAccount(account, account);
        IRewardTracker(stakedAlpTracker).claimForAccount(account, account);
    }

    function claimFees() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeAxnTracker).claimForAccount(account, account);
        IRewardTracker(feeAlpTracker).claimForAccount(account, account);
    }

    function compound() external nonReentrant {
        _compound(msg.sender);
    }

    function compoundForAccount(address _account) external nonReentrant onlyGov {
        _compound(_account);
    }

    function batchCompoundForAccounts(address[] memory _accounts) external nonReentrant onlyGov {
        for (uint256 i = 0; i < _accounts.length; i++) {
            _compound(_accounts[i]);
        }
    }

    function _compound(address _account) private {
        _compoundAxn(_account);
        _compoundAlp(_account);
    }

    function _compoundAxn(address _account) private {
        uint256 esAxnAmount = IRewardTracker(stakedAxnTracker).claimForAccount(_account, _account);
        if (esAxnAmount > 0) {
            _stakeAxn(_account, _account, esAxn, esAxnAmount);
        }

        uint256 bnAxnAmount = IRewardTracker(bonusAxnTracker).claimForAccount(_account, _account);
        if (bnAxnAmount > 0) {
            IRewardTracker(feeAxnTracker).stakeForAccount(_account, _account, bnAxn, bnAxnAmount);
        }
    }

    function _compoundAlp(address _account) private {
        uint256 esAxnAmount = IRewardTracker(stakedAlpTracker).claimForAccount(_account, _account);
        if (esAxnAmount > 0) {
            _stakeAxn(_account, _account, esAxn, esAxnAmount);
        }
    }

    function _stakeAxn(address _fundingAccount, address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        IRewardTracker(stakedAxnTracker).stakeForAccount(_fundingAccount, _account, _token, _amount);
        IRewardTracker(bonusAxnTracker).stakeForAccount(_account, _account, stakedAxnTracker, _amount);
        IRewardTracker(feeAxnTracker).stakeForAccount(_account, _account, bonusAxnTracker, _amount);

        emit StakeAxn(_account, _amount);
    }

    function _unstakeAxn(address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        uint256 balance = IRewardTracker(stakedAxnTracker).stakedAmounts(_account);

        IRewardTracker(feeAxnTracker).unstakeForAccount(_account, bonusAxnTracker, _amount, _account);
        IRewardTracker(bonusAxnTracker).unstakeForAccount(_account, stakedAxnTracker, _amount, _account);
        IRewardTracker(stakedAxnTracker).unstakeForAccount(_account, _token, _amount, _account);

        uint256 bnAxnAmount = IRewardTracker(bonusAxnTracker).claimForAccount(_account, _account);
        if (bnAxnAmount > 0) {
            IRewardTracker(feeAxnTracker).stakeForAccount(_account, _account, bnAxn, bnAxnAmount);
        }

        uint256 stakedBnAxn = IRewardTracker(feeAxnTracker).depositBalances(_account, bnAxn);
        if (stakedBnAxn > 0) {
            uint256 reductionAmount = stakedBnAxn.mul(_amount).div(balance);
            IRewardTracker(feeAxnTracker).unstakeForAccount(_account, bnAxn, reductionAmount, _account);
            IMintable(bnAxn).burn(_account, reductionAmount);
        }

        emit UnstakeAxn(_account, _amount);
    }
}
