require("./lib/converters.js");
converters = require('./lib/converters');
blake2b = require('./lib/blake2b');
sha3 = require('./lib/sha3');
SHA256_hash = require('./lib/jssha256');
curve25519 = require('./lib/curve25519');
Base58 = require('./lib/base58');

var Waves = {}
Waves.epoch = 1460678400;

//Returns publicKey built from string
Waves.getPublicKey = function(secretPhrase) {
    return this.buildPublicKey(converters.stringToByteArray(secretPhrase));
}

//Returns privateKey built from string
Waves.getPrivateKey = function(secretPhrase) {
    return this.buildPrivateKey(converters.stringToByteArray(secretPhrase));
}

Waves.appendUint8Arrays = function(array1, array2) {
    var tmp = new Uint8Array(array1.length + array2.length);
    tmp.set(array1, 0);
    tmp.set(array2, array1.length);
    return tmp;
}

Waves.appendNonce = function (originalSeed) {
    // change this is when nonce increment gets introduced
    var INITIAL_NONCE = 0;
    var nonce = new Uint8Array(converters.int32ToBytes(INITIAL_NONCE, true));

    return Waves.appendUint8Arrays(nonce, originalSeed);
}

 // keccak 256 hash algorithm
Waves.keccakHash = function(messageBytes) {
    return sha3.keccak_256.array(messageBytes);
}

Waves.blake2bHash = function(messageBytes) {
    return blake2b(messageBytes, null, 32);
}

Waves.hashChain = function(noncedSecretPhraseBytes) {
    return Waves.keccakHash(Waves.blake2bHash(new Uint8Array(noncedSecretPhraseBytes)));
}

// function accepts buffer with private key and an array with dataToSign
// returns buffer with signed data
Waves.sign = function(privateKey, dataToSign) {
    var signatureArrayBuffer = curve25519.sign(privateKey, new Uint8Array(dataToSign));

    return Base58.encode(new Uint8Array(signatureArrayBuffer));
}

Waves.buildAccountSeedHash = function(seedBytes) {
    var data = Waves.appendNonce(seedBytes);
    var seedHash = Waves.hashChain(data);
    var accountSeedHash = SHA256_hash(Array.prototype.slice.call(seedHash), true);

    return new Uint8Array(accountSeedHash);
}

Waves.buildPublicKey = function (seedBytes) {
    var accountSeedHash = Waves.buildAccountSeedHash(seedBytes);
    var p = curve25519.generateKeyPair(new Uint8Array(accountSeedHash.buffer));

    return Base58.encode(new Uint8Array(p.public));
}

Waves.buildPrivateKey = function (seedBytes) {
    var accountSeedHash = Waves.buildAccountSeedHash(seedBytes);
    var p = curve25519.generateKeyPair(new Uint8Array(accountSeedHash.buffer));

    return Base58.encode(new Uint8Array(p.private));
}

Waves.shortToByteArray = function (value) {
    return converters.int16ToBytes(value, true);
};

Waves.byteArrayWithSize = function (byteArray) {
    var result = Waves.shortToByteArray(byteArray.length);
    return result.concat(byteArray);
};

Waves.base58StringToByteArray = function (base58String) {
    var decoded = Base58.decode(base58String);
    var result = [];
    for (var i = 0; i < decoded.length; ++i) {
        result.push(decoded[i] & 0xff);
    }

    return result;
}

Waves.longToByteArray = function (value) {
    var bytes = new Array(7);
    for(var k=7;k>=0;k--) {
       bytes[k] = value & (255);
       value = value / 256;
    }
    return bytes;
}

Waves.stringToByteArrayWithSize = function (string) {
    var bytes = converters.stringToByteArray(string);
    return Waves.byteArrayWithSize(bytes);
}

Waves.signatureAssetData = function(senderPublicKey, assetId, feeAssetId, timestamp, amount, fee, recipient, attachment) {
    var transactionType = [4];
    var publicKeyBytes  = Waves.base58StringToByteArray(senderPublicKey);
    var assetIdBytes    = assetId ? [1].concat(Waves.base58StringToByteArray(assetId)) : [0];
    var feeAssetBytes   = feeAssetId ? [1].concat(Waves.base58StringToByteArray(feeAssetId)) : [0];
    var timestampBytes  = Waves.longToByteArray(timestamp);
    var amountBytes     = Waves.longToByteArray(amount);
    var feeBytes        = Waves.longToByteArray(fee);
    var attachmentBytes = Waves.byteArrayWithSize(converters.stringToByteArray(attachment));

    if (recipient.slice(0, 6) === 'alias:') {
        var recipientBytes = [].concat(
            [2], // ALIAS_VERSION
            [recipient.slice(6, 7).charCodeAt(0) & 0xFF],
            Waves.stringToByteArrayWithSize(recipient.slice(8))
        );
    } else {
        var recipientBytes  = Waves.base58StringToByteArray(recipient);
    }

    return [].concat(transactionType, publicKeyBytes, assetIdBytes, feeAssetBytes, timestampBytes, amountBytes, feeBytes, recipientBytes, attachmentBytes);
}

Waves.signatureCancelLeasing = function(senderPublicKey, fee, timestamp, txId) {
    var transactionType = [9];
    var publicKeyBytes  = Waves.base58StringToByteArray(senderPublicKey);
    var feeBytes        = Waves.longToByteArray(fee);
    var timestampBytes  = Waves.longToByteArray(timestamp);
    var txIdKeyBytes   = Waves.base58StringToByteArray(txId);

    return [].concat(transactionType, publicKeyBytes, feeBytes, timestampBytes, txIdKeyBytes);
}

module.exports = Waves;