const mongoose  = require('mongoose');
const express = require('express')
const cors = require('cors');
require('dotenv').config()
const ProductsModel = require('./models/Products');
const CartModel = require('./models/Cart');
const {UserModel, validateReg, validateLog, validateEmail} = require('./models/User')
const bcrypt = require('bcrypt')
const OrderModel = require('./models/Orders');
const sendEmail = require("./utils/sendEmail");
const mongodb = require('mongodb');
const Token = require("./models/Token");

const crypto = require("crypto");
const Joi = require('joi');

const app = express( )

app.use(cors())

app.use(express.json())
mongoose.connect(`mongodb+srv://arthurzhuravetskiy:arthurcodename@store.fnpzjaa.mongodb.net/`)
// mongodb://0.0.0.0:27017/store
const port = process.env.PORT || 3001

app.post('/getProducts', cors(),  async (req,res) => {
    try {
        const products = await ProductsModel.find()
        res.status(200).send(products)
        
    } catch (error) {
        console.log(error)
    }
})

app.post('/getOrders', cors(), async (req,res) => {
    try {
        const orders = await OrderModel.find()
        res.status(200).send(orders)
    } catch (error) {
       console.log(error) 
    }
    
})


app.post('/updateProduct', cors(), async(req, res) => {
    try {
        console.log(req.body)
        const replace = await ProductsModel.findOneAndReplace({_id: req.body._id}, req.body)
        res.status(200).send(replace)
    } catch (error) {
        console.log(error)
    }
})

app.post('/deleteProduct', cors(), async(req,res) => {
    const id = req.body._id;
    
    try {
        const deletedItem = await ProductsModel.deleteOne({_id: new mongodb.ObjectId(id)})
        res.status(200).send({data: deletedItem})
    } catch (error) {
        console.log(error)
    }
})


app.post('/getCartItems', cors(), async (req,res) => {
    try {
        const userId = req.body.userId
        const items = await CartModel.find({"userAdded":{"$in":  userId}})        
        res.status(200).send(items)  
    } catch (error) {
        console.log(error)
    }
})
app.post('/updateQuantity', cors(), async(req, res) => {
    try {
        console.log(req.body.quantity)
        console.log(req.body._id)
        const item = await CartModel.updateOne({_id : req.body._id}, {quantity: req.body.quantity})
        res.status(200).send(item)
    } catch (error) {
        console.log(error)
    }
})

app.post('/getUsers', cors(), async (req, res) => {
    try {
        const users = await UserModel.find()
        res.status(200).send(users)
        console.log(users)
    } catch (error) {
        console.log(error)
    }
})

app.post('/getCartItemsPrice', cors(), async (req,res) => {
    try {
        const userId = req.body.userId
        const docs = await CartModel.find({"userAdded":{"$in":  [userId]}})
            let prices = docs.map((item) =>  item.quantity * item.price);
            let cost = 0
            if(prices.length !== 0){
                cost = prices.reduce((acc, curr) => {
                    return acc + curr
                })
            }
            console.log(cost)
            res.status(200).json(cost)
    } catch (error) {
        console.log(error)
    }

})

app.post("/addtoCart",  async (req,res) => {
    try {
        const userId = req.body.userAdded
        const item = await  CartModel.find({_id: req.body._id});        
        req.body._id = new mongoose.Types.ObjectId()
        
        CartModel.create(req.body)
        res.status(200).send('HI')
    } catch (error) {
        console.log(error)
    }
     
})

app.post("/addtoProducts", async (req, res) => {
    try {
        req.body._id = new mongoose.Types.ObjectId()
        const product = await ProductsModel.create(req.body)
        res.status(200).send(product)
    } catch (error) {
        console.log(error)
    }
})

app.post("/registerUser",  async (req,res) => {
    console.log( req.body.userEmail)
    try {
        const {error} = validateReg(req.body)
        if (error)
            return res.status(400).send({message: error.details[0].message});
        const user = await UserModel.findOne({userEmail: req.body.userEmail});
        if (user)
            return res.status(409).send({message: "User with given email already exists!"})
        const salt = await bcrypt.genSalt((Number(process.env.SALT)));
        const hashPassword = await bcrypt.hash(req.body.userPassword, salt)
        await new UserModel({...req.body, userPassword: hashPassword}).save();
        res.status(201).send({message: "User created successfully"})
    } catch (error) {
        res.status(500).send({message: "Internal Sever Error"})
    }  
})

app.post("/forgotPassword", async (req,res) => {
    try {
        
        const {error} = validateEmail(req.body);
        if(error) return res.status(400).send({message: error.details[0].message})
        const user = await UserModel.findOne({userEmail: req.body.userEmail});
        if (!user)
        return res.status(400).send("user with given email doesn't exist");
        let token = await Token.findOne({userId: user._id})
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }
        const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`;
        await sendEmail(user.userEmail, "Password reset", link);
        
        res.send("password reset link sent to your email account");
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
})

app.post("/password-reset/:userId/:token", async (req, res) => {
    try {
        const schema = Joi.object({ password: Joi.string().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await UserModel.findOne({ _id: req.params.userId});
        if (!user) return res.status(400).send("invalid link or expired");

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send("Invalid link or expired");
        const salt = await bcrypt.genSalt((Number(process.env.SALT)));
        const hashPassword = await bcrypt.hash(req.body.password, salt)
        user.userPassword = hashPassword;
        await user.save();
        await token.deleteOne();

        res.send("password reset sucessfully.");
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
})

app.post("/logUser",  async (req,res) => {
    
    try {
        const {error} = validateLog(req.body);
        if (error)
            return res.status(400).send({message: error.details[0].message});

        const user = await UserModel.findOne({userEmail: req.body.userEmail});
        if(!user)
            return res.status(401).send({message: "Invalid Email or Password"})
        console.log(user)
        const validPassword = await bcrypt.compare(
            req.body.userPassword,
            user.userPassword
        );
        if(!validPassword)
            return res.status(401).send({message: "Invalid Email or Password"})

        const token = user.generateAuthToken()
        console.log(token)
        res.status(200).send({ data: token, message: "logged in successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
     
})

app.post("/deletefromCart",async  (req,res) => {
    const id = req.body._id;
    
    try {
        const deletedItem = await CartModel.deleteOne({_id: new mongodb.ObjectId(id)})
        res.status(200).send({data: deletedItem})
    } catch (error) {
        console.log(error)
    }
})

app.post('/addtoOrders', async(req,res) => {
    try {
        console.log(req.body)
        const items = await OrderModel.insertMany(req.body)
    res.status(200).send(items)
    } catch (error) {
        console.log(error)
    }
})

app.post('/getUserOrders', async(req,res) => {
    try {
        
        
        const userId = req.body.userId
       console.log(req.body)
        const orders = await OrderModel.find({userAdded: userId})
        console.log(orders)
        res.status(200).send(orders)

    } catch (error) {
        console.log(error)
    }
})

app.post('/getOrderItemsPrice', cors(), async (req,res) => {
    try {
        const userId = req.body.userId
        const docs = await OrderModel.find({userAdded: userId})
            let prices = docs.map((item) =>  item.quantity * item.price);
            let cost = 0
            if(prices.length !== 0){
                cost = prices.reduce((acc, curr) => {
                    return acc + curr
                })
            }
            console.log(cost)
            res.status(200).json(cost)
    } catch (error) {
        console.log(error)
    }

})

app.listen(3001, () => {
    console.log("Server is running")
})