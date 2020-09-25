const DaiToken = artifacts.require('DaiToken');
const DappToken = artifacts.require('DappToken');
const TokenFarm = artifacts.require('TokenFarm');

// using Chai and Mocha for testing
require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm;
  before(async () => {
    // load contracts
    daiToken = await DaiToken.new();
    dappToken = await DappToken.new();
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

    // transfer all Dapp tokens to farm (1 million)
    await dappToken.transfer(tokenFarm.address, tokens('1000000'));

    // send tokens to investor
    await daiToken.transfer(investor, tokens('100'), { from: owner })
  });

  // write tests here
  describe('Mock Dai deployment', async () => {
    it('has a name', async () => {
      const name = await daiToken.name();
      assert.equal(name, 'Mock DAI Token');
    });
  });

  describe('Dapp Token deployment', async () => {
    it('has a name', async () => {
      const name = await dappToken.name();
      assert.equal(name, 'DApp Token');
    });
  });

  describe('Token Farm deployment', async () => {
    it('has a name', async () => {
      const name = await tokenFarm.name();
      assert.equal(name, 'Dapp Token Farm');
    });

    it('contract has tokens', async () => {
      let balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), tokens('1000000'));
    });
  });

  describe('Farming tokens', async () => {
    it('rewards investors for staking mDai tokens', async () => {
      let result;

      // check investor balance before staking
      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(), tokens('100'), 'investor mock DAI wallet balance correct before staking');

      // stake mock DAI tokens
      await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor }); // approve payment
      await tokenFarm.stakeTokens(tokens('100'), { from: investor }); // process payment

      // check staking result
      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(), tokens('0'), 'investor mock DAI wallet balance correct after staking');

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(result.toString(), tokens('100'), 'TokenFarm mock DAI balance correct after staking');

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking');

      result = await tokenFarm.isStaking(investor);
      assert.equal(result.toString(), 'true', 'investor staking status correct after staking');
    });
  });
});