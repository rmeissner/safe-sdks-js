import SafeAbi from '../abis/SafeAbi.json'
import { SafeSigner, Safe, SafeTransactionData, SafeSignature, EthSignSignature } from '..'

export class EthersSigner implements SafeSigner {
    ethers: any
    signer: any
    constructor(ethers: any, signer: any) {
        this.signer = signer
        this.ethers = ethers
    }

    async sign(hash: string): Promise<SafeSignature> {
        const address = await this.signer.address
        const signature = await this.signer.signMessage(this.ethers.utils.arrayify(hash))
        return new EthSignSignature(address, signature)
    }
}

export class EthersSafe implements Safe {

    contract: any

    constructor(ethers: any, provider: any, address: string) {
        this.contract = new ethers.Contract(address, SafeAbi, provider);
    }

    address(): string {
        return this.contract.address
    }

    async getTransactionHash(transaction: SafeTransactionData): Promise<string> {
        const hash = await this.contract.getTransactionHash(
            transaction.to,
            transaction.value, 
            transaction.data,
            transaction.operation,
            transaction.safeTxGas,
            transaction.baseGas,
            transaction.gasPrice,
            transaction.gasToken,
            transaction.refundReceiver,
            transaction.nonce
        )
        return hash
    }

    async encodeTransaction(transaction: SafeTransactionData, signatures: string): Promise<string> {
        console.log(await this.contract.nonce())
        return await this.contract.interface.functions.execTransaction.encode([
            transaction.to,
            transaction.value, 
            transaction.data,
            transaction.operation,
            transaction.safeTxGas,
            transaction.baseGas,
            transaction.gasPrice,
            transaction.gasToken,
            transaction.refundReceiver,
            signatures
        ])
    }

    async executeTransaction(transaction: SafeTransactionData, signatures: string): Promise<string> {
        // TODO check nonce
        const txHash = await this.contract.execTransaction(
            transaction.to,
            transaction.value, 
            transaction.data,
            transaction.operation,
            transaction.safeTxGas,
            transaction.baseGas,
            transaction.gasPrice,
            transaction.gasToken,
            transaction.refundReceiver,
            signatures
        )
        return txHash
    }
}