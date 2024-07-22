const mongoose = require('mongoose');

// const mongoURI = 'mongodb+srv://ohadtaizi111:ohad0412@cluster0.krcfarr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const mongoURI = 'mongodb+srv://ohadtaizi111:Ohad0412@cluster0.krcfarr.mongodb.net/myStore?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));
  
  module.exports = mongoose;