const express = require('express');
const app = express();
const levelSandbox = require('./levelSandbox');
const simpleChain = require('./simpleChain');

app.use(express.json());      
app.use(express.urlencoded());


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

app.listen(8000, () => console.log('Example app listening on port 8000!'))
