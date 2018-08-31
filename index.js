const express = require('express');
const app = express();
const levelSandbox = require('./levelSandbox');
const simpleChain = require('./simpleChain');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

app.use(express.json());
app.use(express.urlencoded());

class BlockchainIDValidation{
  constructor(){
    this.requests = {}
  }

  addRequests(address, requestTimeStamp, validationWindow, message){
    this.requests[address] = {
      address: address,
      requestTimeStamp: requestTimeStamp,
      validationWindow:validationWindow,
      message: message
    }
  }
}

class ValidationWindow{
  constructor(){
    this.timeLeft = 600
  }

  startCountdown(){
      let timerId = setInterval(()=>{
        console.log(this.timeLeft);
        if(this.timeLeft > 0){
          this.timeLeft--
        }else{
          this.timeLeft=0;
          clearInterval(timerId)
        }
      }, 1000);
  }
}

let newReq = new BlockchainIDValidation();

function timeExpire(res, timeLeft){
  res.send({
    error:'Youre time validationWindow has ran out, Please start again',
    validationWindow:timeLeft
  })
}

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

  let requestTimeStamp = new Date().getTime().toString().slice(0,-3);

  let newValidationWindow = new ValidationWindow()
  newValidationWindow.startCountdown()

  newReq.addRequests(req.body.address, requestTimeStamp, newValidationWindow, `${req.body.address}:${requestTimeStamp}:starRegistry`)

  res.send({
    message:`${req.body.address}:${requestTimeStamp}:starRegistry`,
    requestTimeStamp,
    validationWindow:newValidationWindow.timeLeft
  })
})

app.post('/message-signature/validate',(req, res) => {
    let request = newReq.requests[req.body.address]

    let verified = bitcoinMessage.verify(request.message, req.body.address, req.body.signature)

    if(request.validationWindow.timeLeft > 0){
      res.send({
        registerStar: verified ? true : false,
        status:{
          address: req.body.address,
          requestTimeStamp: request.requestTimeStamp,
          message:request.message,
          validationWindow: request.validationWindow.timeLeft,
          messageSignature: verified ? 'valid' : 'invalid'
        }
      })
    } else {
      delete newReq[req.body.address]
      timeExpire(res, request.validationWindow.timeLeft);
    }
})

app.post('/requestValidation', (req, res) => {
  let request = newReq.requests[req.body.address]

  if(request.validationWindow.timeLeft > 0){
    res.send({
      address:request.address,
      requestTimeStamp:request.requestTimeStamp,
      message:request.message,
      validationWindow:request.validationWindow.timeLeft
    })
  } else {
    delete newReq[req.body.address]
    timeExpire(res, request.validationWindow.timeLeft);
  }
})

app.listen(8000, () => console.log('Example app listening on port 8000!'))
