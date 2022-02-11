const path = require('path');
module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: "development", 
  entry: './script.js',
  output: {
    path: path.resolve(__dirname, 'public'), 
    filename: 'bundle.js' 
  }
};