
import initSdk, { SdkInstance, SafeListeners, SafeInfo, TxConfirmationEvent, RequestId } from '@gnosis.pm/safe-apps-sdk'
import { v4 as uuidv4 } from 'uuid'; 

export interface Safe {
    activate(onSafeInfo: (info: SafeInfo) => void): void
    deactivate(): void
    sendTransactions(txs: any[]): void
    asyncSendTransactions(txs: any[]): Promise<String>
    isConnected(): boolean
    getSafeInfo(): SafeInfo
}

class State implements Safe {
    sdk: SdkInstance
    info: SafeInfo | undefined
    callbacks = new Map<RequestId, (safeTxHash: String) => void>()

    constructor() {
        this.sdk = initSdk([/.*localhost.*/])
    }

    activate(
        onUpdate: (update: any) => void
    ) {
        const onSafeInfo = (info: SafeInfo) => {
            this.info = info
            console.log({info})
            onUpdate({})
        }
        const onTransactionConfirmation = (confirmation: TxConfirmationEvent) => {
            console.log({confirmation})
            const callback = this.callbacks.get(confirmation.requestId)
            if (callback) {
                this.callbacks.delete(confirmation.requestId)
                callback(confirmation.safeTxHash)
            }
        }
        this.sdk.addListeners({ onSafeInfo, onTransactionConfirmation })
    }

    deactivate() {
        this.sdk.removeListeners()
    }

    sendTransactions(txs: any[]) {
        this.sdk.sendTransactions(txs)
    }

    asyncSendTransactions(txs: any[]): Promise<String> {
        const callback = new Promise<String>( (resolutionFunc) => {
            const requestId = uuidv4()
            this.callbacks.set(requestId, resolutionFunc)
            this.sdk.sendTransactions(txs, requestId)
        });
        return callback;
    }

    isConnected(): boolean {
        return this.info !== undefined
    }
    
    getSafeInfo(): SafeInfo {
        const info = this.info
        if (info === undefined) throw Error("Not connected to a Safe")
        return info
    }
}

const connectSafe = (): Safe => {
    return new State()
}

export default connectSafe