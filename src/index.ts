import express from 'express';
import http from 'http';
import bodyparser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import router from './router';

const app = express();
const port = 8080;

app.use(cors({
    credentials: true
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyparser.json());

const server = http.createServer(app);

server.listen(port, () => {
    console.log("Server running");
});

const MONGO_URL = 'mongodb+srv://emailplayg1:EebG9dZAXUXvYyK5@retodo.hwamy2h.mongodb.net/?retryWrites=true&w=majority'
mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on('error', (error: Error) => console.log(error));


app.get('/', (req: express.Request, res: express.Response) => {
    let msg  =  {
        message: 'ok! Deployed'
    }
    return res.status(200).json(msg)
})
app.use('/api', router());