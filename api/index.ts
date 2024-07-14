import express, { Request, Response } from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import watcher from './file-watcher';
// import patientRoute from './controller/patient.controller';


const app = express();
app.use(express.json());


app.use(express.urlencoded({ extended: true }));
app.use(express.static('app'));
app.use(cors());

dotenv.config();

// Default Route
app.get('/', async (_, res) => {
    res.send('Hello from Express!');
});

console.log(process.env.WATCH_PATH);

// app.use('/api', patientRoute);

watcher(process.env.WATCH_PATH);

app.listen(3002, () => {
    console.log('Express server is running on port 3002');
});

export default app;
