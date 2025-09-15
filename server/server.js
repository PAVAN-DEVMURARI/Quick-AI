import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import aiRouter from './routes/airoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';


const app = express();

await connectCloudinary();

//add middlewares 
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware())


//first route 
app.get('/' , (req, res) =>{
    res.send('Server is running');
})

//clerk middleware 
app.use('/api/ai', aiRouter);
app.use('/api/user' , userRouter);

// Simple central error handler (captures Multer errors too)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err) {
        console.error('Error:', err.message);
        res.status(400).json({ success: false, message: err.message });
    } else {
        next();
    }
});

//add port 
const port = process.env.PORT || 3000;

//start express app
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
