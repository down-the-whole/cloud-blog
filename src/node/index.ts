import { promisify } from 'util'
import express from 'express'
import portscanner from 'portscanner'

import todayByVolume from './market-watch'

const main = async () => {
    const findPortAsync = promisify(portscanner.findAPortNotInUse)

    let port

    try {
        port = await findPortAsync(
            8000,
            9000,
            '127.0.0.1'
        )
    } catch (e) {
        console.error(e)
    }

    const app = express()

    app.get(
        '/',
        todayByVolume,
    )

    app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
}

main()
