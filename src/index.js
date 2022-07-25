import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import CategoriesRouter from './Routers/CategoriesRouter.js';
import CustomersRouter from './Routers/CustomersRouter.js'
import RentalsRouter from './Routers/RentalsRouter.js';
import GamesRouter from './Routers/GamesRouter.js';

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());

app.use(CategoriesRouter);
app.use(GamesRouter)
app.use(CustomersRouter)
app.use(RentalsRouter)



app.listen(4000)

// const port = process.env.PORT;
// app.listen(port, () => console.log(chalk.white.bold.bgGreenBright("Server run in PORT " + port)));