export interface SafeSignature {
    signer: string,
    data: string

    staticPart(dynamicOffset: number): string
    dynamicPart(): string
}

export class EthSignSignature implements SafeSignature {
    signer: string
    data: string

    constructor(signer: string, signature: string) {
        this.signer = signer
        this.data = signature.replace("0x", "").replace(/00$/,"1f").replace(/1b$/,"1f").replace(/01$/,"20").replace(/1c$/,"20")
    }

    staticPart(dynamicOffset: number) {
        return this.data
    }

    dynamicPart() {
        return ""
    }
}

export interface SafeSigner {
    sign(hash: String): Promise<SafeSignature>
}

export const zeroAddress = `0x${'0'.repeat(40)}`
export const zeroNumber = "0"

export interface SafeTransactionData {
    readonly to: string
    readonly value: string 
    readonly data: string
    readonly operation: string
    readonly safeTxGas: string
    readonly baseGas: string
    readonly gasPrice: string
    readonly gasToken: string
    readonly refundReceiver: string
    readonly nonce: string
}

export interface SafeTransactionDataPartial {
    readonly to: string
    readonly value: string 
    readonly data: string
    readonly operation?: string
    readonly safeTxGas?: string
    readonly baseGas?: string
    readonly gasPrice?: string
    readonly gasToken?: string
    readonly refundReceiver?: string
    readonly nonce: string
}

export function makeSafeTransactionData({
    to,
    value,
    data,
    nonce,
    operation = zeroNumber,
    safeTxGas = zeroNumber,
    baseGas = zeroNumber,
    gasPrice = zeroNumber,
    gasToken = zeroAddress,
    refundReceiver = zeroAddress
}: SafeTransactionDataPartial): SafeTransactionData {
    return {
        to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, nonce
    }
}

export interface Safe {
    address(): string
    getTransactionHash(transaction: SafeTransactionData): Promise<string>
    encodeTransaction(transaction: SafeTransactionData, signatures: string): Promise<string>
    executeTransaction(transaction: SafeTransactionData, signatures: string): Promise<string>
}

export class SafeTransaction {
    
    readonly safe: Safe
    readonly data: SafeTransactionData
    readonly signatures: Map<string, SafeSignature> = new Map()
    dataHash: string | undefined

    constructor(safe: Safe, data: SafeTransactionData) {
        this.safe = safe
        this.data = data
    }

    async hash(): Promise<string> {
        if (!this.dataHash)
            this.dataHash = await this.safe.getTransactionHash(this.data)
        return this.dataHash
    }

    async confirm(signer: SafeSigner) {
        const hash = await this.hash()
        const signature = await signer.sign(hash)
        // TODO: check owners
        console.log({signature})
        this.signatures.set(signature.signer, signature)
    }

    encodedSignatures(): string {
        const signers = Array.from(this.signatures.keys()).sort()
        const baseOffset = signers.length * 130
        let staticParts = ""
        let dynamicParts = ""
        signers.forEach((signerAddress) => {
            const signer = this.signatures.get(signerAddress)!!
            staticParts += signer.staticPart(baseOffset + dynamicParts.length / 2)
            dynamicParts += signer.dynamicPart()
        })
        return "0x" + staticParts + dynamicParts
    }

    async ethTransaction(): Promise<{ to: string, data: string }> {
        const to = this.safe.address()
        const data = await this.safe.encodeTransaction(this.data, this.encodedSignatures())
        return { to, data }
    }

    async execute(): Promise<string> {
        return await this.safe.executeTransaction(this.data, this.encodedSignatures())
    }
}