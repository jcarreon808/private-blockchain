#Overview

- Notarize : Users will be able to notarize star ownership using their blockchain identity.

- Verify Wallet Address	: Application will provide a message to your user allowing them to verify their wallet address with a message signature.

- Register a Star	: Once a user verifies their wallet address, they have the right to register the star.

- Share a Story	: Once registered, each star has the ability to share a story.

- Star Lookup	: Users will be able to look up their star by hash, block height, or wallet address.

# GET/POST Blockchain Data using Express.js

# Step1: Configure Blockchain ID validation

1. Allow User Request
User posts to this endpoint to receive message to sign

The Web API will allows users to submit their request using their wallet address.

  - Endpoint to post to with wallet address payload: 'http://localhost:8000/allow-user-request'
  - Ex.
  curl -X "POST" "http://localhost:8000/allow-user-request" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{ "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ" }'


 2. User Response
 Mesage details, Request Timestamp, Time remaining for validation window

  - JSON Response Example from 'http://localhost:8000/allow-user-request'
  - {
      "requestTimeStamp": "1535843579",
      "message": "1N8ZqQ4uYvoDinyEFA75KQkdDjaoJztnSc:1535843579:starRegistry",
      "validationWindow": 600
    }
  - With this response, a request will be made to the user to provide a signature using their wallet.

  3. Allow User Message Signature
  After receiving the response, users will prove their blockchain identity by signing a message with their wallet. Once they sign this message, the application will validate their request and grant access to register a star.

  - http://localhost:8000//message-signature/validate

  Post validation with curl
  curl -X "POST" "http://localhost:8000/message-signature/validate" \
       -H 'Content-Type: application/json; charset=utf-8' \
       -d $'{
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
  }'

  JSON Response Example
  {
    "registerStar": true,
    "status": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "requestTimeStamp": "1532296090",
      "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
      "validationWindow": 193,
      "messageSignature": "valid"
    }
  }

  4. Validate User Request

  - Enpoint : http://localhost:8000/requestValidation

  - Here is an example post request using curl.

    curl -X "POST" "http://localhost:8000/requestValidation" \
         -H 'Content-Type: application/json; charset=utf-8' \
         -d $'{
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
    }'

  - Example: JSON response
    Application will provide a JSON response to users. Here is an example of this response.

    {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "requestTimeStamp": "1532296090",
      "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
      "validationWindow": 300
    }

# Step 2: Configure Star Registration Endpoint
Requirements for registering star

- URL
This functionality should be provided at the following URL.

http://localhost:8000/block

- Payload
Wallet address (blockchain identity), star object with the following properties.

Requires address [Wallet address]

Requires star object with properties

right_ascension

declination

magnitude [optional]

constellation [optional]

star_story [Hex encoded Ascii string limited to 250 words/500 bytes]

JSON Response

block object

Example: Block with star object endpoint
Post block with curl

curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "star": {
    "dec": "-26° 29' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}'
JSON Response Example
{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}

# Step 3: Configure Star Lookup
1. Blockchain Wallet Address
Details
Get endpoint with URL parameter for wallet address
JSON Response
Star block objects
URL
http://localhost:8000/stars/address:[ADDRESS]

Payload
URL parameter with wallet address.

Example: stars/address:[address] endpoint

Get request with curl
curl "http://localhost:8000/stars/address:142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
Example: JSON response
[
  {
    "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
    "height": 1,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "16h 29m 1.0s",
        "dec": "-26° 29' 24.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532296234",
    "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
  },
  {
    "hash": "6ef99fc533b9725bf194c18bdf79065d64a971fa41b25f098ff4dff29ee531d0",
    "height": 2,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "17h 22m 13.1s",
        "dec": "-27° 14' 8.2",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532330848",
    "previousBlockHash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
  }
]

2. Star Block Hash
Get endpoint with URL parameter for star block hash JSON Response

Star block object
URL
http://localhost:8000/stars/hash:[HASH]

Payload
URL parameter with star block hash.

Example: stars/hash:[hash] endpoint

Get request with curl
curl "http://localhost:8000/stars/hash:a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
Example: JSON response
{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}

3. Star Block Height
Details
Get endpoint with URL parameter for star block height
JSON Response
Star block object
URL
http://localhost:8000/block/[HEIGHT]

Payload
URL parameter with block height.

Example: stars/address:[address] endpoint

Get request with curl
curl "http://localhost:8000/block/1"
Example: JSON response
{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}

# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```

## Testing

To test code:
1: Open a command prompt or shell terminal after install node.js.
2: Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
```
node
```
3: Copy and paste your code into your node session
4: Instantiate blockchain with blockchain variable
```
let blockchain = new Blockchain();
```
5: Generate 10 blocks using a for loop
```
for (var i = 0; i <= 10; i++) {
  blockchain.addBlock(new Block("test data "+i));
}
```
6: Validate blockchain
```
blockchain.validateChain();
```
7: Induce errors by changing block data
```
let inducedErrorBlocks = [2,4,7];
for (var i = 0; i < inducedErrorBlocks.length; i++) {
  blockchain.chain[inducedErrorBlocks[i]].data='induced chain error';
}
```
8: Validate blockchain. The chain should now fail with blocks 2,4, and 7.
```
blockchain.validateChain();
```
# private-blockchain
# private-blockchain
