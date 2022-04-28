const express = require('express');
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

// async function run() {
//     try {
//         await client.connect()
//     }
//     finally { }
// }
// run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("hello world")
})

app.listen(port, () => {
    console.log('Listening Port is', port);
})