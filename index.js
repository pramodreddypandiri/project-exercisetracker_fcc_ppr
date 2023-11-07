const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))
//connection to database
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//error handling in DB connecions
const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error'))
connection.once('open', () => {
  console.log("Database successfully connected")
})
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
const Schema = mongoose.Schema;
//user schema
const userSchema = new Schema({
  username: {
            type: String, 
            required: true,
            unique: true
            
            },
  count : Number,
});
//exercise schema
const exerciseSchema = new mongoose.Schema({
  userId: String,
  username : String,
  description : {
    type : String,
    required: true
  },
  duration : {
    type : Number,
    required : true
  },
  date : { type: Date, default: Date.now }
})
// model for user schema
const User = mongoose.model('User', userSchema)
//model for exercise
const Exercise = mongoose.model('Exercise', exerciseSchema)
//for posting a user
app.post('/api/users', async (req, res) => {
  const username = req.body.username;
  const foundUser = await User.findOne({username: username});
  if (foundUser){
    res.json(foundUser)
  }
  const user = new User({username});
  await user.save();
  res.json(user);

});
//for getting all users
app.get('/api/users' , async (req, res) => {
  const users = await User.find();
  res.json(users);

});
// {
//   username: "fcc_test",
//   count: 1,
//   _id: "5fb5853f734231456ccb3b05",
//   log: [{
//     description: "test",
//     duration: 60,
//     date: "Mon Jan 01 1990",
//   }]
// }
//add exercises
app.post('/api/users/:_id/exercises', async (req, res) => {
  const id = req.params._id;
  const description = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date ? new Date(req.body.date) : new Date();
  const user = await User.findById(id);
  if (!user){
    res.json({error: "user not found"})
  }
  const exercise = new Exercise({username: user.username, userId: user._id, description, duration, date});
  await exercise.save();
  res.json({
    username: exercise.username,
    description: exercise.description,
    duration : exercise.duration,
    date : exercise.date.toDateString(),
    _id: exercise.userId
  })
  
  
})

// get logs
app.get('/api/users/:_id/logs', async (req, res) => {
  const id = req.params._id;
  const user = await User.findById(id);
  const from = req.query.from;  
  const to = req.query.to;     
  const limit = req.query.limit;
  const fromDate = new Date(from);
  const toDate = new Date(to); 
  if (!user){
    res.json({error: "user not found"})
  }
  let query = {userId: id}
  // query.date =  {
  //     $gte: fromDate, // Greater than or equal to fromDate
  //     $lte: toDate    // Less than or equal to toDate
  //   }
  let exercises_in_DB;
  if (limit){
       exercises_in_DB = await Exercise.find(query).limit(limit);
  } else{
    exercises_in_DB = await Exercise.find(query);
  }
  
  const exercises = exercises_in_DB.map((exercise) => {
    return {
      description : exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    }
  })
  res.json({
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log: exercises
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
