import dotenv from "dotenv";
import express from 'express';
import http from 'http';
import bodyparser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import router from './router';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyparser.json());

const server = http.createServer(app);

server.listen(port, () => {
    console.log("Server running on port:" + port);
});

const MONGO_URL = 'mongodb+srv://emailplayg1:EebG9dZAXUXvYyK5@retodo.hwamy2h.mongodb.net/RTD?retryWrites=true&w=majority&appName=ReToDo'
mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on('error', (error: Error) => console.log(error));


app.get('/', (req: express.Request, res: express.Response) => {
    let msg  =  {
        message: 'Sounds Good!'
    }
    return res.status(200).json(msg)
})
app.use('/api/v1', router());