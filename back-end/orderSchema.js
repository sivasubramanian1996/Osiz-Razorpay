const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  order_id: {
    type:String,
    required: true
  },
  payment_id:{
    type:String,
    required: true
  },
  razorpay_signature:{
    type:String,
    required: true
  },
});

module.exports = mongoose.model("Order", orderSchema);