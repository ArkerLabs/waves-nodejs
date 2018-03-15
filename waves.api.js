'use strict'

require("./lib/converters.js");
var http = require("./http");
var Waves = require("./waves");
var converters = require('./lib/converters');

Waves.api = {}

Waves.api.assetTransfer = function(nodeUrl, assetId, seed, recipient, amount, fee, feeAssetId, attachment, testnet = false) {
    return new Promise(function(resolve, reject) {   

        const regex = /(3P|3N)[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]*/g;
        if (!regex.test(recipient)) {
            recipient = "alias:W:" + recipient
            if (testnet)
                recipient = "alias:T:" + recipient
        }

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

        var dataToSign = Waves.signatureAssetTransfer(
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

Waves.api.lease = function(nodeUrl, seed, recipient, amount, fee, testnet = false) {
    return new Promise(function(resolve, reject) {   

        const regex = /(3P|3N)[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]*/g;
        if (!regex.test(recipient)) {
            recipient = "alias:W:" + recipient
            if (testnet)
                recipient = "alias:T:" + recipient
        }

        var timestamp = Date.now();
        var transferData = {
            "senderPublicKey": Waves.getPublicKey(seed),
            "amount": parseInt(amount),
            "fee": fee,
            "recipient": recipient,
            "timestamp": timestamp
        };

        var dataToSign = Waves.signatureLease(
            transferData['senderPublicKey'],
            transferData['recipient'],
            transferData['amount'],
            transferData['fee'],
            transferData['timestamp']
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

            http.post(nodeUrl+'/leasing/broadcast/lease', headers, JSON.stringify(dataToSend)).then(resolve, reject);
        });
    });  
}

Waves.api.cancelLease = function(nodeUrl, txId, seed, fee) {
    return new Promise(function(resolve, reject) {   

        var timestamp = Date.now();
        var cancelData = {
              "senderPublicKey": Waves.getPublicKey(seed),
              "txId": txId,
              "timestamp": timestamp,
              "fee": fee
        };

        var dataToSign = Waves.signatureCancelLease(
            cancelData['senderPublicKey'],
            cancelData['fee'],
            cancelData['timestamp'],
            cancelData['txId']
        );

        var privateKeyBytes = Base58.decode(Waves.getPrivateKey(seed));

        const crypto = require('crypto');
        crypto.randomBytes(64, (err, buf) => {
            if (err) throw err;
            var signature = Base58.encode(curve25519.sign(privateKeyBytes, new Uint8Array(dataToSign), new Uint8Array(buf)));
            
            var dataToSend = cancelData;
            dataToSend['signature'] = signature;
        
            var headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(dataToSend))
            };

            http.post(nodeUrl+'/leasing/broadcast/cancel', headers, JSON.stringify(dataToSend)).then(resolve, reject);
        });
    }); 
}

Waves.api.generateAddress = function(senderPublicKey, testnet = false) {
    var version = [0x01];
    var scheme  = [0x57];

    if (testnet) 
        scheme = [0x54];

    var keyHash = Waves.keccakHash(Waves.blake2bHash(new Uint8Array(Waves.base58StringToByteArray(senderPublicKey)))).slice(0, 20);
    var checksum = Waves.keccakHash(Waves.blake2bHash(new Uint8Array([].concat(
        version,
        scheme,
        keyHash
    )))).slice(0, 4);

    var address = [].concat(
        version,
        scheme,
        keyHash,
        checksum
    );

    return Base58.encode(address);
};

module.exports = Waves;