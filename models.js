const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// schema for all details of a user 
const userSchema = new Schema({
  username: {
            type: String, 
             required: true
            },
  count : Number,
  log: [{
    description: {
                type: String,
                required: true
                 },
    duration: {
        type: Number, 
        required: true},
    date: {type: Date}
  }]
});
// model for user schema
export default mongoose.model('User', userSchema)
