/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const levelup = require('levelup')
const leveldown = require('leveldown')
const encode = require('encoding-down')
const chainDB = './chaindata';
const db = levelup(encode(leveldown('./chaindata'), { valueEncoding: 'json' }))

// Add data to levelDB with key/value pair
let addLevelDBData = function(key,value){
  db.put(key, value, function(err) {
    if (err) return console.log('Block ' + key + ' submission failed', err);
  })
}

// Get data from levelDB with key
let getLevelDBData = function(key){
  return new Promise(resolve => {
    db.get(key, function(err, value) {
      if (err) return console.log('Not found!', err);
      // console.log('Value = ' + value);
      resolve(value)
    })
  })
}

// Add data to levelDB with value
let addDataToLevelDB = function(value) {
    let i = 0;
    db.createReadStream().on('data', function(data) {
          i++;
        }).on('error', function(err) {
            return console.log('Unable to read data stream!', err)
        }).on('close', function() {
          console.log('Block #' + i);
          addLevelDBData(i, value);
        });
}

let getAllData = function(){
  return new Promise (resolve => {
    let blocks = [];
    db.createReadStream()
    .on('data', function (data) { blocks.push(data)})
    .on('close', function (err) { resolve(blocks) })
  })
}

let getChain = function(){
  return new Promise (resolve => {
    let blocks = [];
    db.createReadStream()
    .on('data', function (data) { blocks.push(data)})
    .on('end', function (err) { resolve(blocks) })
  }).then(chain => console.log(chain))
}

module.exports = {
  getChain,
  getAllData,
  addLevelDBData,
  getLevelDBData
}

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/


// (function theLoop (i) {
//   setTimeout(function () {
//     addDataToLevelDB('Testing data');
//     if (--i) theLoop(i);
//   }, 100);
// })(10);
