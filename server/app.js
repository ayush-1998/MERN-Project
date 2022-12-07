const dotenv = require('dotenv')
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())

dotenv.config({path:'./config.env'})
require('./db/conn')
const User = require('./model/userSchema')

app.use(express.json())
app.use(require('./router/auth'))

const PORT = process.env.PORT

app.listen(8000, () => {
    console.log(`Server is running at port ${PORT}`); 
})