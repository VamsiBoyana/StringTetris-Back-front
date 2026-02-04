// const express = require('express')    
// const dotenv = require('dotenv')
// const connectToDb = require('./config/db')
// const router = require('./routes/authRoutes')
// const bot = require("./teleBot/bot");
// const cors = require("cors");




// const app = express()
// dotenv.config()
// app.use(cors());



// connectToDb()

// // Middleware
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }));
// app.use("/api/auth", router);


// // Start the server
// app.listen(process.env.PORT, () => {
//     console.log(`Server running successfully on ${process.env.PORT}`);
// });

const express = require('express')
const dotenv = require('dotenv')
const connectToDb = require('./config/db')
const router = require('./routes/authRoutes')
const bot = require("./teleBot/bot");
const cors = require("cors");
const mongoose = require('mongoose');
const GameHistory = require('./models/gameHistorySchema'); // adjust path as needed
const cron = require('node-cron');
 
const app = express()
dotenv.config()
// app.use(cors());
// app.use(cors(corsOptions));

app.use(
      cors({
        allowedHeaders: "*",
        exposedHeaders: ["token", "authorization"],
        origin: [ 'https://stringtetris.com',
  'https://stradmin.stringtetris.com',
  'https://stringwithdrawadmin.stringgames.io',
  'https://stringwithdraw.stringgames.io',
],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
      }),
    );
 
connectToDb()
 
// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use("/backapi/api/auth", router);
 
const SESSION_TIMEOUT_MINUTES = 3; // set your timeout here
 
cron.schedule('* * * * *', async () => { // Runs every minute
  const timeoutDate = new Date(Date.now() - SESSION_TIMEOUT_MINUTES * 60 * 1000);
 
  try {
    const result = await GameHistory.updateMany(
      {
        playedStatus: "PENDING",
        createdAt: { $lt: timeoutDate }
      },
      { $set: { playedStatus: "EXPIRED" } }
    );
    if (result.nModified > 0) {
      console.log(`Expired ${result.nModified} old pending games.`);
    }
  } catch (err) {
    console.error("Error expiring old pending games:", err);
  }
});
 
// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server running successfully on ${process.env.PORT}`);
});

