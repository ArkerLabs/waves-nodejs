'use strict'

var http = require("./http");
var Waves = require("./waves");

Waves.api = {}

Waves.api.sendAsset = function(node, apiKey, assetId, seed, recipient, amount) {
    return new Promise(function(resolve, reject) {        
        var timestamp = Date.now();
        var transferData = {
            "senderPublicKey": Waves.getPublicKey(seed),
            "assetId": assetId,
            "timestamp": timestamp,
            "amount": amount,
            "fee": 100000,
            "recipient": recipient, // address
            "attachment": ""
        };
        
        // Sign Array
        var dataToSign = Waves.signatureAssetData(
            transferData['senderPublicKey'],
            transferData['assetId'],
            null,
            transferData['timestamp'],
            transferData['amount'],
            transferData['fee'],
            transferData['recipient'],
            transferData['attachment']
        );
        // Get Private Key
        var privateKeyBytes = Base58.decode(Waves.getPrivateKey(seed));
        const crypto = require('crypto');
        crypto.randomBytes(64, (err, buf) => {
            if (err) throw err;
            var signature = Base58.encode(curve25519.sign(privateKeyBytes, new Uint8Array(dataToSign), new Uint8Array(buf)));
            // Data to send
            var dataToSend = transferData;
            dataToSend['signature'] = signature;
        
            var headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(dataToSend))
            };

            if (apiKey) {
                headers['X-API-Key'] = apiKey;
            }

            http.post(node+'/assets/broadcast/transfer', headers, JSON.stringify(dataToSend)).then(resolve, reject);
        });
    }); 
}

module.exports = Waves;