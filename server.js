var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var Message = require('./models/chat');
var db = require('./models/db');
var events = require('./models/events');




//mongoose.Promise = global.Promise;
mongoose.connect(db.conStr, { useNewUrlParser: true }).then(
  () => {console.log('Database is now connected') },
  err => { console.log('Can not connect to the database '+ err)}
);


var server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});


app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})


app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})


app.post('/messages', async (req, res) => {
  try{
    var message = new Message(req.body);

    var savedMessage = await message.save()
      console.log('saved');
      //events.save(`Messaged saved to DB, Time: ${new Date($.now())}`)

    var censored = await Message.findOne({message:'badword'});
      if(censored)
        await Message.remove({_id: censored.id})
      else
        io.emit('message', req.body);
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('error',error);
  }
  finally{
    console.log('Message Posted')
    //events.save(`Messaged posted to DOM, Time: ${new Date($.now())}`)
  }

})

//events.save(function (err, event) {
 // if (err) return console.error(err);
 // events.event()
//});


io.sockets.on('connection', (socket) =>{
  console.log('a user is connected')
  //events.save(`a user connected, Time: ${new Date($.now())}`)
})