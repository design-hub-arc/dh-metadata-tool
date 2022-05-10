const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 5455
const fs = require('fs')
const http = require('http')
const { response } = require('express')
const { json } = require('express/lib/response')
const ExifTool = require('exiftool-vendored').ExifTool
const exiftool = new ExifTool({ taskTimeoutMillis: 5000 })
// const https = require('https')

// const key = 'path-to-key'
// const cert = 'path-to-cert'

// const serverOptions = ({
//   key: key,
//   cert: cert
// })

// const server = https.createServer(serverOptions, app)
const server = http.createServer(app)

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) => {
  res.sendFile('index.html')
})
// app.get('/validator', (req, res) => {
//   res.sendFile('validator.html')
// })
app.post('/meta-data', (req, res) => {
  exiftool
  .write(req.body.urlToFile, {Copyright: req.body.copyright, CopyrightNotice: req.body.copyright, Author: req.body.author, XPAuthor: req.body.author, XPComment: req.body.comments })
  .catch((err) => console.error("Something terrible happened: ", err))
  .finally(() => exiftool.end())

  let response = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="./index.css">
      <title>Design Hub Meta-Data Generator</title>
    </head>
    <body>
      <div class="container">
        <h1>Meta Data Success</h1>
        <h2>Content</h2>
        <ol>
          <li> Copyright: ${req.body.copyright}</li>
          <li> Author: ${req.body.author}</li>
          <li> Comments: ${req.body.comments}</li>
        </ol>
        <div class="success-message">
          <a href='/'>Add Data to another file</a>
          <a href='/validator.html'>Check meta-data</a>
      </div>
      </div>
    </body>
    </html>
    `
  return res.send(response)
})

app.post('/meta-read', (req, res) => {
  console.log(req.body.urlToFile)
  exiftool
    .read(req.body.urlToFile)
    .then((tags) => {
      const arr = Object.entries(tags)
      res.write(`<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="./index.css">
        <title>Design Hub Meta-Data Generator</title>
      </head>
      <body>
        <div class="container">
          <h1>Meta Data Success</h1>
          <div class="success-message">
            <a href='/validator.html'>Check another file</a>
          </div>
          <h2 class="meta-data-title">Data</h2>
        <ul class="meta-data-results">
        
        `)

        
        arr.forEach((tag) => {

          res.write(`
          <p><b>${tag[0]}:</b> ${tag[1]}</p>
          `)
        })

      res.write(`
      </ul>
      </div>
      </body>
      </html>
      `)  
      res.end()
    })
    .catch((err) => console.error(`Oops, something went horribly wrong: ${err}`))
    .finally(()=> exiftool.end())
})

server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))