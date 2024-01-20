import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cors from 'cors';
import path from 'path';

dotenv.config()

connectDB();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, './myapp/build')))

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/products', productRoutes);

//rest api
app.use('*', function(req, res){
    res.sendFile(path.join(__dirname, './myapp/build/index.html'))
})

app.get('/', (req, res) => {
    res.send('<h1>Welcome</h1>');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Server Running on ' + PORT);
})