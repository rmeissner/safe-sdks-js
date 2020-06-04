require('dotenv').config()

import { ethers } from 'ethers'
import { Safe, makeSafeTransactionData, SafeTransaction, SafeSigner } from './lib'
import { EthersSafe, EthersSigner } from './lib/ethers'

const simple = async() => {
    // Owner account with Ethers
    const node = ethers.utils.HDNode.fromMnemonic(process.env.MNEMONIC!!).derivePath("m/44'/60'/0'/0/0")
    const signer: SafeSigner = new EthersSigner(ethers, new ethers.Wallet(node))

    // Safe with Ethers
    const provider = ethers.getDefaultProvider("rinkeby")
    const safe: Safe = new EthersSafe(ethers, provider, "0x61e35A476E10E4744ef3C051942bbD56620fc2ae")

    // Create tx
    const txData = makeSafeTransactionData({ to: "0x61e35A476E10E4744ef3C051942bbD56620fc2ae", value: "0", data: "0x", nonce: "0" })
    const tx: SafeTransaction = new SafeTransaction(safe, txData)

    // Confirm tx with signer
    await tx.confirm(signer)

    // Get data for Ethereum call (to simulate transaction)
    const ethTx = await tx.ethTransaction()
    console.log(await provider.call(ethTx))
}

const extended = async() => {
    const provider = ethers.getDefaultProvider("rinkeby")
    const mnemonic = process.env.MNEMONIC!!
    console.log(mnemonic)
    const safe: Safe = new EthersSafe(ethers, provider, "0x61e35A476E10E4744ef3C051942bbD56620fc2ae")
    console.log(safe.address())
    const txData = makeSafeTransactionData({ to: "0x61e35A476E10E4744ef3C051942bbD56620fc2ae", value: "0", data: "0x", nonce: "0" })
    console.log({txData})
    const tx: SafeTransaction = new SafeTransaction(safe, txData)
    console.log(await tx.hash())
    const node = ethers.utils.HDNode.fromMnemonic(mnemonic).derivePath("m/44'/60'/0'/0/0")
    console.log({node})
    console.log(node.address)
    const signer: SafeSigner = new EthersSigner(ethers, new ethers.Wallet(node))
    await tx.confirm(signer)
    console.log(await tx.encodedSignatures())
    const ethTx = await tx.ethTransaction()
    console.log(ethTx)
    console.log(await provider.call(ethTx))
}

simple()