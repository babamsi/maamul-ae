const bcrypt = require('bcryptjs')

const password = '123456'
const saltRounds = 12

const hashedPassword = bcrypt.hash(password, saltRounds)
console.log(hashedPassword.then(console.log))