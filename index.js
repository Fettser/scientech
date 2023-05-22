require('dotenv').config()
const express = require('express')
const {google} = require('googleapis')
const cors = require('cors')
const credentials = require('./credentials')
const helmet = require('helmet')

const PORT = process.env.PORT
const SPREADSHEET_ID = process.env.SPREADSHEET_ID

let client
let googleSheet

const app = express()

const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: "https://www.googleapis.com/auth/spreadsheets"
})

app.use(cors({origin: 'http://127.0.0.1:5500'}))
app.use(helmet())
app.use(express.json())

app.post('/form', async (req, res) => {
    try {
        const {fullname, email, telegram, program, group, contest, link} = req.body
        console.log(req.body)

        await googleSheet.spreadsheets.values.append({
            auth,
            spreadsheetId: SPREADSHEET_ID,
            range: "Data!A:G",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[fullname, email, telegram, program, group, contest, link]],
            }
        })

        return res.status(200).json({status: "Success"})
    } catch (e) {
        console.log(e)
        return res.status(500).json({status: "Internal server error"})
    }
})

async function initialize () {
    client = await auth.getClient()
    googleSheet = google.sheets({version: 'v4', auth: client})
}

async function start() {
    try {
        await initialize()
        app.listen(PORT, () => console.log('App is working...'))
    } catch (e) {
        console.log(e)
        process.exit(1)
    }
}

start()
