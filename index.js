const express = require("express");
const app = express();
var cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const host = "localhost";
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//*--------------- Database String Connection ----------------*//
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mdkfu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
//*-----------------run Function -------------------*//
async function run() {
  try {
    await client.connect();
    const userCollection = client.db("autoZone").collection("users");
    console.log("DB Connected");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Auto Zone Web Server is Running");
});

app.listen(port, () => {
  console.log(`Server is running at http://${host}:${port}`);
});
