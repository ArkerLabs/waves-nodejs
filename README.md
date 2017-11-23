Waves Node JS API
=====
[![npm version](https://badge.fury.io/js/waves-nodejs.svg)](https://badge.fury.io/js/waves-nodejs)

A library to use [Waves](wavesplatform.com) blockchain from node.js based on [WavesDevKit](https://github.com/wavesplatform/WavesDevKit)

## Getting started
```bash
npm install waves-nodejs --save
```

## REST Methods
### Send asset transaction to a node
```javascript
var Waves = require('waves-nodejs');

Waves.api.sendAsset(
    'nodeUrl',
    'assetId', 
    'seed', 
    'recipient address', 
    1, // amount
    1, // fee
    'feeAssetId',
    'attachment'
).then(function(data) {
    console.log(data);
}, function(err) {
    console.error(err);
});
```

## API Methods
```javascript
var Waves = require('waves-nodejs');

Waves.getPublicKey(secretPhrase);

Waves.getPrivateKey(secretPhrase);

Waves.appendUint8Arrays(array1, array2);

Waves.appendNonce(originalSeed);

Waves.keccakHash(messageBytes);

Waves.blake2bHash(messageBytes);

Waves.hashChain(noncedSecretPhraseBytes);

Waves.sign(privateKey, dataToSign);

Waves.buildAccountSeedHash(seedBytes);

Waves.buildPublicKey(seedBytes);

Waves.buildPrivateKey(seedBytes);

Waves.shortToByteArray(value);

Waves.byteArrayWithSize(byteArray);

Waves.base58StringToByteArray(base58String);

Waves.longToByteArray(value);

Waves.signatureAssetData(senderPublicKey, assetId, feeAssetId, timestamp, amount, fee, recipient, attachment);
```
## TODO

Add all REST API methods