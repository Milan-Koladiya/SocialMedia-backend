const mongoose = require('mongoose')
const chalk = require('chalk')
const connect = 'mongodb+srv://test:test123@cluster0.vdwtb.mongodb.net/Facebook-clone?retryWrites=true&w=majority';

const connection = mongoose.connect(connect, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }).then(() => {
    console.log(chalk.bold.green('Databse connecticon successfully'))
}).catch((err) => {
    console.log("Database connection faild")
})
module.exports = connection