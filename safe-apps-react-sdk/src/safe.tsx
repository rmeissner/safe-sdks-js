
import initSdk, { SafeListeners, SafeInfo } from '@gnosis.pm/safe-apps-sdk'

export interface Safe {
    activate(onSafeInfo: (info: SafeInfo) => void): void
    deactivate(): void
    sendTransactions(txs: any[]): void
    isConnected(): boolean
    getSafeInfo(): SafeInfo
}

class State implements Safe {
    sdk: {
        addListeners: ({ ...allListeners }: SafeListeners) => void,
        removeListeners: () => void,
        sendTransactions: (txs: any[]) => void;
    }

    info: SafeInfo | undefined

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
        this.sdk.addListeners({ onSafeInfo })
    }

    deactivate() {
        this.sdk.removeListeners()
    }

    sendTransactions(txs: any[]) {
        this.sdk.sendTransactions(txs)
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