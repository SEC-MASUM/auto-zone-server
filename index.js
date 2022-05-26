const express = require("express");
const app = express();
var cors = require("cors");
var jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
//*-------------Verify User using JWT---------------*//
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .send({ success: false, message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  // verify a token symmetric
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res
        .status(403)
        .send({ success: false, message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

//*-----------------run Function -------------------*//
async function run() {
  try {
    await client.connect();
    const userCollection = client.db("autoZone").collection("users");
    const reviewCollection = client.db("autoZone").collection("reviews");
    const productCollection = client.db("autoZone").collection("products");
    const orderCollection = client.db("autoZone").collection("orders");
    console.log("DB Connected");

    //*----------------Payment------------------*//
    app.post("/create-payment-intent", async (req, res) => {
      const { totalPrice } = req.body;
      //  Amount must be no more than $999,999.99
      let amount = totalPrice * 100;
      //! This code is not practical use case it is only for error handling in this project
      //TODO : Must remove this code in real project
      if (amount > 10000) {
        amount = parseInt(amount / 10000);
      }
      //!----------------------------------------------------------
      // console.log(amount);

      // if (amount > 99999900.99) {
      //   console.log(amount, 99999900.99);
      //   return res.status(425).send({
      //     success: false,
      //     message: "Amount must be no more than $999,999.99",
      //   });
      // }
      // console.log(amount);
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        description: "Car Parts  manufacturing",
        shipping: {
          name: "Jenny Rosen",
          address: {
            line1: "510 Townsend St",
            postal_code: "98140",
            city: "San Francisco",
            state: "CA",
            country: "US",
          },
        },
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      console.log(paymentIntent.client_secret);
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    //*-----------------Verify Admin------------------*//
    const verifyAdmin = async (req, res, next) => {
      const requesterEmail = req.decoded.email;
      const requesterData = await userCollection.findOne({
        email: requesterEmail,
      });
      if (requesterData.role === "admin") {
        next();
      } else {
        return res
          .status(403)
          .send({ success: false, message: "Forbidden access" });
      }
    };

    //*------------------Add Review-----------------*//
    app.post("/review", verifyJWT, async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
    //*------------------Order-----------------*//
    // Add order
    app.post("/order", verifyJWT, async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      // console.log(result);
      res.send(result);
    });
    // Get order by user email
    app.get("/order/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const orders = await orderCollection.find(query).toArray();
      // console.log(orders);
      res.send(orders);
    });
    // Get All order
    app.get("/order", verifyJWT, async (req, res) => {
      const orders = await orderCollection.find().toArray();
      // console.log(orders);
      res.send(orders);
    });

    // Get order by id
    app.get("/payment/order/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const filter = { _id: ObjectId(id) };
      const order = await orderCollection.findOne(filter);
      // console.log(order);
      res.send(order);
    });

    // Patch Order update when paid
    app.patch("/payment/order/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const order = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: order.status,
          transactionId: order.transactionId,
        },
      };

      const updatedOrder = await orderCollection.updateOne(filter, updateDoc);
      console.log(updatedOrder);

      res.send(updatedOrder);
    });

    // Delete order by id
    app.delete("/order/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    //*------------------Product-----------------*//
    // Add Product
    app.post("/product", verifyJWT, async (req, res) => {
      const product = req.body;
      // console.log(product);
      const result = await productCollection.insertOne(product);
      // console.log(result);
      res.send(result);
    });

    // Get All Product
    app.get("/product", verifyJWT, async (req, res) => {
      const products = await productCollection.find({}).toArray();
      res.send(products);
    });
    // Get Product by id
    app.get("/product/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });
    //Delete Product By Id
    app.delete("/product/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      // console.log(result);
      res.send(result);
    });

    //*------------------User-----------------*//
    // Load All user data
    app.get("/user", verifyJWT, async (req, res) => {
      const users = await userCollection.find({}).toArray();
      res.send(users);
    });

    // insert user email and send JWT to client
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const jwtToken = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      res.send({ result, accessToken: jwtToken });
    });

    // add user role as admin
    app.put("/user/admin/:email", verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      // console.log(result);
      res.send(result);
    });

    // remove user admin role
    app.put(
      "/user/removeAdmin/:email",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: { role: "" },
        };
        const result = await userCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        // console.log(result);
        res.send(result);
      }
    );
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
