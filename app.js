const express = require('express');
const bodyParser = require('body-parser');// can de truy nhap url
const app = express();
const fs = require('fs'); // doc  file
const path = require('path');

var _ = require('lodash');
const JSONStream = require('JSONStream');
var engine = require('consolidate'); //de view

app.engine('hbs' ,engine.handlebars);
app.set('view engine','hbs')
//  app.set('view engine','ejs');
app.set('views','./views');
app.use('/profilepics', express.static('images'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.get('/',(req,res)=>{
  let users = [];
  fs.readdir('users',function(err,files){
      if(err) throw err;
      files.forEach(function(file){
          fs.readFile(path.join(__dirname,'users',file),{encoding:'utf8'},function(err,data){
              if(err) throw err;
                const user =JSON.parse(data);
              user.name.full = _.startCase(user.name.first+' '+ user.name.last);
              users.push(user);
              if(users.length === files.length)
                 res.render('index', {users: users})
          })
      })
  })
})
app.get('/:username', function (req, res) {
    var username = req.params.username
    var user = getUser(username)
    //res.send(user);
    res.render('user',{
        user: user,
        address: user.location
    })
})
function getUser(userName)
{
    var user = JSON.parse(fs.readFileSync(getUserFilePath(userName),{encoding:'utf8'}));
    user.name.full= _.startCase(user.name.first + ' ' + user.name.last)
    _.keys(user.location).forEach(function(key){
        user.location[key]=_.startCase(user.location[key])
    })
    return user;
}
function getUserFilePath(userName){
    return path.join(__dirname,'users',userName) + '.json';
}

app.put('/:username',(req,res)=>{
    var username = req.params.username
    var user = getUser(username)
     user.location= req.body
    saveUser(username,user)
    res.end()
})
function getUser(userName)
{
    var user =JSON.parse(fs.readFileSync(getUserFilePath(userName),{encoding:'utf8'}));
     user.name.full= _.startCase(user.name.first + ' ' + user.name.last)
    _.keys(user.location).forEach(function(key){
        user.location[key]=_.startCase(user.location[key])
    })
    return user;

}
  
function saveUser (username, data){
    var fp = getUserFilePath(username)
    fs.unlinkSync(fp)
    fs.writeFileSync(fp,JSON.stringify(data, null, 2),{encoding:'utf8'})
}
function getUserFilePath(userName){
    return path.join(__dirname,'users',userName) + '.json';
}
app.delete('/:username',function(req,res){
    var fp = getUserFilePath(req.params.username)
    fs.unlinkSync(fp)
    res.sendStatus(200)
})

 app.listen(3000,()=>{console.log("app running at port 3000");}) // host cong 3000 de chay