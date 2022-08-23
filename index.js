const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
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
        // authentication with jwt
        app.post('/createJWT', (req, res) => {
            const email = req.body;
            const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })
        // product
        app.get('/products', async (req, res) => {
            const currentPage = req.query.currentPage;
            const query = {};
            const cursor = productCollection.find(query);
            let products;
            if (currentPage) {
                products = await cursor.skip(currentPage * 5).limit(5).sort({ _id: -1 }).toArray();
            }
            else {
                products = await cursor.sort({ _id: -1 }).toArray();
            }
            res.send(products)
        })
        // get my order with email
        app.get('/myorder', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email };
                const cursor = productCollection.find(query);
                const products = await cursor.toArray();
                res.send(products)
            }
            else {
                res.status(403).send({ message: 'Forbidden' });
            }

        })
        // get a single a product
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        })
        // product search by supplier
        app.get('/productBySupplier', async (req, res) => {
            const supplierName = req.query.supplier;
            const query = { supplier: { $regex: supplierName, $options: '$i' } };
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        // add post
        app.post('/product', async (req, res) => {
            const body = req.body;
            const result = await productCollection.insertOne(body);
            res.send(result)
        })

        // update post
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: body
            }
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        // delete api
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })


        // product quantity
        app.get('/productCount', async (req, res) => {
            const count = await productCollection.estimatedDocumentCount();
            res.send({ count });
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