const express = require('express');
const app = express();
const levelSandbox = require('./levelSandbox');
const simpleChain = require('./simpleChain');

app.use(express.json());
app.use(express.urlencoded());

class BlockchainIDValidation{
  constructor(){
    this.requests = {}
  }

  addRequests(address, timestamp, validationWindow){
    this.requests[address] = {timeStamp:timestamp, window:validationWindow}
  }
}

class ValidationWindow{
  constructor(){
    this.timeLeft = 500
  }

  startCountdown(){
    if(this.timeLeft !== 0){
      setInterval(()=>this.timeLeft--, 1000);
    }
  }

}

let newReq = new BlockchainIDValidation();

app.get('/block/:blockHeight', (req, res) => {
  levelSandbox.getLevelDBData(req.params.blockHeight).then(block => {
    res.send(block)
  })
})

app.post('/block', (req, res) => {
  let newBlock = new simpleChain.Block(req.body.body);

  let blockChain = new simpleChain.Blockchain();

  blockChain.addBlock(newBlock).then(block => res.send(block))

})

app.post('/allow-user-request/', (req, res) => {
  let timeStamp = new Date().getTime().toString().slice(0,-3);
  let walletAddress = req.body.address

  let newValidationWindow = new ValidationWindow()
  newValidationWindow.startCountdown()

  newReq.addRequests(walletAddress, timeStamp, newValidationWindow)

  // setTimeout(()=>{
  //   console.log(newReq.requests[walletAddress].window.timeLeft)
  // },1000)
  res.send({
    message:`${walletAddress}:${timeStamp}:starRegistry`,
    requestTimestamp:timeStamp,
    validationWindow:newValidationWindow.timeLeft
  })
})

app.listen(8000, () => console.log('Example app listening on port 8000!'))
