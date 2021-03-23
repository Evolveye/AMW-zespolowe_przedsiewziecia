
class WS extends WebSocket {
    #listeners = new Map()
    #defaultListener = () => { }

    constructor( ...data ) {
      super( ...data )

      this.onmessage = this.#onmessage
    }

    emit(event, data) {
        const msg = data ? { event, data } : event
        const send = () => this.send(JSON.stringify(msg))

        if (this.readyState !== 1) {
            this.addEventListener(`open`, send)
        } else {
            send()
        }
    }

    on(event, listener) {
        this.#listeners.set(event, listener)
    }

    //onmessage = data => console.log( data )
    #onmessage = ({ data }) => {
        let jsonData

        try {
            jsonData = JSON.parse(data)
        } catch {
            jsonData = data
        }



      //  console.log( 'WS REQUEST 1 =>',{ data, jsonData })

        if (typeof jsonData === `object` && `event` in jsonData && `data` in jsonData) {
            const { event, data } = jsonData

            //console.log( 'WS REQUEST 2 =>',{ event, data })

            if (this.#listeners.has(event)) this.#listeners.get(event)(data)
            else console.warn(`Unhandled event: ${event}`)
        } else if (typeof jsonData === `string` && this.#listeners.has(jsonData)) {
            this.#listeners.get(jsonData)(jsonData)
        } else this.#defaultListener(jsonData)
    }

    setDefaultListener(listener) {
        if (typeof listener != `function`) throw new Error(`Listener should be the function type`)

        this.#defaultListener = listener
    }
}


ws = new WS( `ws://localhost:3000` )


ws.emit('authenticate', token.toString())

ws.on( `api.get.users.me`, console.log )
ws.emit( `api.get.users.me` )
ws.on("not authenticated",console.log)

//ws.on('message',(event)=>{console.log(event.data)})
