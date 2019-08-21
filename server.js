const express = require('express')
const bodyParser = require('body-parser')
const formidable = require('formidable')
const fs = require('fs')
const app = express()
const router = express.Router()
app.use(bodyParser.json())
app.use(
bodyParser.urlencoded({
extended: false
})
)

app.all('*', function(req, res, next) {
res.header('Access-Control-Allow-Origin', '*')
res.header('Access-Control-Allow-Headers', 'content-type')
res.header('Access-Control-Allow-Methods', 'POST,GET')
if (req.method.toLowerCase() == 'options') res.send(200)
else next()
})

let output = []
let success = 0

app.post('/uploadVideo', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'POST,GET')
  res.header('Content-Type', 'application/json;charset=utf-8')

  var form = new formidable.IncomingForm()
  form.uploadDir = './file'
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if(err){
      res.send({
        success: false,
        msg: '未知错误'
      })
      console.log(err)
      return
    }
    if (Number(fields.index) === 0) {
      output.forEach(item=>{
        fs.unlinkSync(item.path)
      })
      output = []
      success = 0
    }
    if (output.length == 0) {
      output = new Array(fields.total)
    }
    output[fields.index] = files.data
    success++
    let process = (success / fields.total * 100).toFixed(2) + '%'
    if (success == fields.total) {
      function read(i) {
        var data = fs.readFileSync(output[i].path)
        fs.appendFileSync('./file/' + fields.filename, data)
        fs.unlinkSync(output[i].path)
        i++
        if (i < success) {
          read(i)
        } else {
          success = 0
          output = []
           res.send({
            success: true,
            msg: '上传成功',
            videoUrl: 'file/' + fields.filename
          })
          return
        }
      }
      read(0)
    } else {
      res.send({
          success: true,
          process
      })
    }
  })
})
// 文件管理结束

app.use('/', router)

app.listen('8090', () => {
console.log('http://127.0.0.1:8090')
})