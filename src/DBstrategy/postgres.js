import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;

dotenv.config();

// const connection = new Pool({

// host : process.env.HOST_POSTGRES,
// port : process.env.PORT_POSTGRES,
// user : process.env.USER_POSTGRES,
// password : process.env.PASSWORD_POSTGRES,
// database : process.env.DATABASE_URL
// });

const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default connection;
