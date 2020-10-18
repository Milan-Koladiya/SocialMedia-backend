const express = require('express')
const app = express()
const chalk = require('chalk')
const userAPI = require('./API/user')
const postAPI = require('./API/post')
const cors = require('cors')

app.use(express.json())

app.use(cors())

app.use(userAPI)
app.use(postAPI)

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(chalk.bgGreen(`connected to port ${PORT}`))
})