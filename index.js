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

function timeExpire(res, timeLeft, newReq, address){
  delete newReq.requests[address]
  res.send({
    error:'Youre time validationWindow has ran out, Please start again',
    validationWindow:timeLeft
  })
}


// Step1: Configure Blockchain ID validation => Requirement 1: Allow User Request
// User posts to this endpoint to recieve message to sign
app.post('/allow-user-request', (req, res) => {

  let requestTimeStamp = new Date().getTime().toString().slice(0,-3);

  let newValidationWindow = new ValidationWindow()
  newValidationWindow.startCountdown()

  newReq.addRequests(req.body.address, requestTimeStamp, newValidationWindow, `${req.body.address}:${requestTimeStamp}:starRegistry`)

// Step1: Configure Blockchain ID validation => Requirement 2: Deliver User Response
// Mesage details, Request Timestamp, Time remaining for validation window
  res.send({
    requestTimeStamp,
    message:`${req.body.address}:${requestTimeStamp}:starRegistry`,
    validationWindow:newValidationWindow.timeLeft
  })
})

// Step1:Configure Blockchain ID validation => Requirement 3: Allow User Message signature
// Post to this endpoint with Wallet Address and Message signature payload to be verified
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
      timeExpire(res, request.validationWindow.timeLeft, newReq, req.body.address);
    }
})

// Step1:Configure Blockchain ID validation => Requirement 4: Validate User Request
// With signature verified, user should be granted access to register a single star
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
    timeExpire(res, request.validationWindow.timeLeft, newReq, req.body.address);
  }
})

// Step 2: Configure Star Registration Endpoint
// story is Hex encoded
app.post('/block', (req, res) => {

  let body = {
    ...req.body,
    star:{
      ...req.body.star,
      story:new Buffer(req.body.star.story).toString('hex')
    }
  }

  let newBlock = new simpleChain.Block(body);

  let blockChain = new simpleChain.Blockchain();

  blockChain.addBlock(newBlock).then(block => res.send(block))

})

// Step 3: Configure Star Lookup => Requirement 1: Blockchain Wallet Address
app.get('/stars/address::address',(req, res) => {
  let address = req.params.address
  levelSandbox.getAllData().then(chain => {
    let stars = chain.filter((block, index) => block.value.body.address === address)
    res.send(stars)
  })
})

// Step 3: Configure Star Lookup => Requirement 1: Star Block Hash
app.get('/stars/hash::hash',(req, res) => {
  let hash = req.params.hash
  levelSandbox.getAllData().then(chain => {
    let star = chain.filter((block, index) => block.value.hash === hash)
    res.send(star[0])
  })
})

// Step 3: Configure Star Lookup => Requirement 3: Star Block Height
app.get('/block/:blockHeight', (req, res) => {
  levelSandbox.getLevelDBData(req.params.blockHeight).then(block => {
    res.send(block)
  })
})

app.listen(8000, () => console.log('Example app listening on port 8000!'))
