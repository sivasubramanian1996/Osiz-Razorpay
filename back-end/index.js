require('dotenv').config()
const express = require("express")
const app = express()
const Razorpay = require("razorpay")
const cors = require("cors")
const shortId = require("shortid")
const mongoose = require("mongoose")
const orderSch = require("./orderSchema");
const path = require("path");

const url = "mongodb://localhost/razorpay"

mongoose.connect(url,{ useUnifiedTopology: true },
    { useNewUrlParser: true } )
                    
const con = mongoose.connection

con.on("open", function(){
    console.log("DB connected")
})

app.use(cors())
app.use(express.json());

app.listen(2000, () => (
    console.log("Listening on 2000")
))

app.get("/logo.jpg", (req,res)=>{
    res.sendFile(path.join(__dirname,"logo.jpg"))
})

const razorpay = new Razorpay({ key_id:process.env.MY_KEY_ID, key_secret:process.env.MY_SECRET_KEY  })



app.post("/razorpay", async (req,res) => {
    const payment_capture = 1
    const amount = 500
    const currency = "INR"

    const options = {
        amount:((amount*100).toString()), 
        currency,
        receipt:shortId.generate(),
        payment_capture
    }
    try {
        const response = await razorpay.orders.create(options)
    console.log(response)
    res.json({
        id:response.id,
        currency:response.currency,
        amount:response.amount,
    })

    }catch(err){
        console.log(err)
    }
    
})


app.post("/verify" , async (req,res)=>{
    const {orderId,paymentId,razorpaySignature,id} = req.body
    const crypto = require("crypto");
    const hmac = crypto.createHmac('sha256', process.env.MY_SECRET_KEY);
    hmac.update(id + "|" + paymentId);
    let generatedSignature = hmac.digest('hex');

    let isSignatureValid = generatedSignature == razorpaySignature;
    if (isSignatureValid){
        const order = new orderSch({
            order_id: orderId,
            payment_id:paymentId,
            razorpay_signature:razorpaySignature
          });
          
        try{
            const dbReturn = await order.save()
            console.log(dbReturn)
            res.json(dbReturn)
        }catch(err){
            console.log(err)
            res.send("Error"+err)
        }
    }else{
        console.log("Not matched")
    }
})

