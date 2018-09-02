/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const levelSandbox = require('./levelSandbox');
const SHA256 = require('crypto-js/sha256');


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.chain = levelSandbox.getChain
		levelSandbox.getAllData().then(chain => {
			if(chain.length === 0){
				this.addBlock(new Block({
				   "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
				   "star": {
				     "dec": "-26° 29' 24.9",
				     "ra": "16h 29m 1.0s",
				     "story": new Buffer("Genesis Star").toString('hex')
				   }
	 			}))
			}
		})
  }

  // Add new block
  addBlock(newBlock){
		return levelSandbox.getAllData().then(chain => {
			// Block height
				if(!!chain){
					newBlock.height = chain.length;
					// UTC timestamp
					newBlock.time = new Date().getTime().toString().slice(0,-3);
					// previous block hash
					if(chain.length>0){
						newBlock.previousBlockHash = chain[chain.length-1]['value'].hash;
					}
					// Block hash with SHA256 using newBlock and converting to a string
					newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
					// Adding block object to chain
					// this.chain.push(newBlock);
					levelSandbox.addLevelDBData(newBlock.height, newBlock)
					return newBlock;
				}

			})
  }

  // Get block height
    getBlockHeight(){
      // return this.chain.length-1;
			levelSandbox.getAllData().then(chain => {console.log(chain.length - 1)})
    }

    // get block
    getBlock(blockHeight){
      return levelSandbox.getLevelDBData(blockHeight).then(block => {
				console.log(JSON.parse(JSON.stringify(block)))
				return JSON.parse(JSON.stringify(block))
			})
      // return JSON.parse(JSON.stringify(this.chain[blockHeight]));
    }

    // validate block
    validateBlock(blockHeight){
      // get block object
			console.log("BLOCKHEIGHT",blockHeight);
      let block = this.getBlock(blockHeight).then(block=>{

				// get block hash
				let blockHash = block.hash;
				// remove block hash to test block integrity
				block.hash = '';
				// generate block hash
				let validBlockHash = SHA256(JSON.stringify(block)).toString();
				// Compare
				if (blockHash===validBlockHash) {
					console.log(`BLOCK ${blockHeight} = VALID BLOCK`);
					return true;
				} else {
					console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
					return false;
				}
			})

    }

   // Validate blockchain
    validateChain(){
      let errorLog = [];
			levelSandbox.getAllData().then(chain => {

				for (var i = 0; i < chain.length; i++) {
					// validate block
					if (!!this.validateBlock(i))errorLog.push(i);
					// compare blocks hash link
						if(!!chain[i+1]){
							let blockHash = chain[i]['value'].hash;
							let previousHash = chain[i+1]['value'].previousBlockHash;
							if (blockHash!==previousHash) {
								errorLog.push(i);
							}
						}
				}
				if (errorLog.length>0) {
					console.log('Block errors = ' + errorLog.length);
					console.log('Blocks: '+errorLog);
				} else {
					console.log('No errors detected');
				}

			})
		}

}

module.exports = {
	Block,
	Blockchain
}
