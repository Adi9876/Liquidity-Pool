// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LiquidityPool is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    uint256 public totalShares;
    mapping(address => uint256) public shares;

    uint256 private constant PRECISION = 1e18;
    uint256 private constant MIN_LIQUIDITY = 1000;

    event LiquidityAdded(
        address indexed provider,
        uint256 sharesMinted,
        uint256 amountA,
        uint256 amountB
    );
    event LiquidityRemoved(
        address indexed provider,
        uint256 sharesBurned,
        uint256 amountA,
        uint256 amountB
    );
    event Swap(
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor(address _tokenA, address _tokenB) Ownable(msg.sender) {
        require(
            _tokenA != address(0) && _tokenB != address(0),
            "Invalid token addresses"
        );
        require(_tokenA != _tokenB, "Tokens must be different");
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant returns (uint256) {
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");

        uint256 sharesToMint;
        if (totalShares == 0) {
            sharesToMint = sqrt(amountA * amountB);
            require(
                sharesToMint >= MIN_LIQUIDITY,
                "Insufficient liquidity minted"
            );
        } else {
            uint256 shareA = (amountA * totalShares) /
                tokenA.balanceOf(address(this));
            uint256 shareB = (amountB * totalShares) /
                tokenB.balanceOf(address(this));
            sharesToMint = shareA < shareB ? shareA : shareB;
        }

        require(sharesToMint > 0, "Insufficient shares minted");

        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);

        totalShares += sharesToMint;
        shares[msg.sender] += sharesToMint;

        emit LiquidityAdded(msg.sender, sharesToMint, amountA, amountB);
        return sharesToMint;
    }

    function removeLiquidity(
        uint256 sharesToBurn
    ) external nonReentrant returns (uint256, uint256) {
        require(
            sharesToBurn > 0 && sharesToBurn <= shares[msg.sender],
            "Invalid shares amount"
        );

        uint256 amountA = (tokenA.balanceOf(address(this)) * sharesToBurn) /
            totalShares;
        uint256 amountB = (tokenB.balanceOf(address(this)) * sharesToBurn) /
            totalShares;

        require(amountA > 0 && amountB > 0, "Insufficient amounts calculated");

        shares[msg.sender] -= sharesToBurn;
        totalShares -= sharesToBurn;

        tokenA.safeTransfer(msg.sender, amountA);
        tokenB.safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, sharesToBurn, amountA, amountB);
        return (amountA, amountB);
    }

    function swap(
        address tokenIn,
        uint256 amountIn
    ) external nonReentrant returns (uint256) {
        require(
            tokenIn == address(tokenA) || tokenIn == address(tokenB),
            "Invalid input token"
        );
        require(amountIn > 0, "Amount must be greater than 0");

        IERC20 tokenOut = tokenIn == address(tokenA) ? tokenB : tokenA;

        uint256 reserveIn = IERC20(tokenIn).balanceOf(address(this));
        uint256 reserveOut = tokenOut.balanceOf(address(this));

        // Calculate amount out using constant product formula (x * y = k)
        uint256 amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
        require(amountOut > 0, "Insufficient output amount");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        tokenOut.safeTransfer(msg.sender, amountOut);

        emit Swap(msg.sender, tokenIn, address(tokenOut), amountIn, amountOut);
        return amountOut;
    }

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256) {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        uint256 amountInWithFee = amountIn * 997; // 0.3% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;

        return numerator / denominator;
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
