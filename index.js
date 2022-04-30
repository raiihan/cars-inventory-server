const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewere
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send({ message: 'Unathorized Access' });
    }
    const token = authHeader.split(" ")[1];
    const accessToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            res.status(403).send({ message: 'Forbidden' });
        }
        else {
            req.decoded = decoded;
            next();
        }
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ck7gi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const productCollection = client.db("productInventory").collection('products');

        app.get('/products', async (req, res) => {
            res.send({ me: 'hello' })
        })

        // add post
        app.post('/product', async (req, res) => {
            const body = req.body;
            const result = await productCollection.insertOne(body);
            res.send(result)
        })
    }
    finally { }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("hello world")
})

app.listen(port, () => {
    console.log('Listening Port is', port);
})