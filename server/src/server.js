// server entry point
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectToDb = require('./config/db');

connectToDb();
console.log(process.env.MONGODB_URI,"..port")
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
})