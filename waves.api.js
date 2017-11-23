'use strict'

require("./lib/converters.js");
var http = require("./http");
var Waves = require("./waves");
var converters = require('./lib/converters');

Waves.api = {}

Waves.api.sendAsset = function(nodeUrl, assetId, seed, recipient, amount, fee, feeAssetId, attachment) {
    return new Promise(function(resolve, reject) {   

        var timestamp = Date.now();
        var transferData = {
            "senderPublicKey": Waves.getPublicKey(seed),
            "assetId": assetId,
            "timestamp": timestamp,
            "amount": parseInt(amount),
            "fee": fee,
            "feeAssetId": feeAssetId,
            "recipient": recipient,
            "attachment": Base58.encode(converters.stringToByteArray(attachment))
        };

        var dataToSign = Waves.signatureAssetData(
            transferData['senderPublicKey'],
            transferData['assetId'],
            transferData['feeAssetId'],
            transferData['timestamp'],
            transferData['amount'],
            transferData['fee'],
            transferData['recipient'],
            attachment
        );

        var privateKeyBytes = Base58.decode(Waves.getPrivateKey(seed));

        const crypto = require('crypto');
        crypto.randomBytes(64, (err, buf) => {
            if (err) throw err;
            var signature = Base58.encode(curve25519.sign(privateKeyBytes, new Uint8Array(dataToSign), new Uint8Array(buf)));
            
            var dataToSend = transferData;
            dataToSend['signature'] = signature;
        
            var headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(dataToSend))
            };

            http.post(nodeUrl+'/assets/broadcast/transfer', headers, JSON.stringify(dataToSend)).then(resolve, reject);
        });
    }); 
}

module.exports = Waves;