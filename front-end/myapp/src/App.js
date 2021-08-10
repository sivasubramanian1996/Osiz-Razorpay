
import './App.css';



function loadScript(source){
  return new Promise((resolve)=>{
    const script = document.createElement("script")
    script.src=source
    script.onload=()=>{
      resolve(true)
    }
    script.onerror = () =>{
      resolve(false)
    }
    document.body.appendChild(script)
  })
}


function App() {
    
    async function displayRazorpay () {

    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res){
      alert("Razorpay SDK failed to load")
      return
    }

    const data = await fetch("http://localhost:2000/razorpay", { method : "POST" }).then((t)=>
        t.json()
      )

    console.log(data)
    var options = {
      "key": "rzp_test_ikJRA0aP0hsb8R",
      "currency":data.currency,
      "amount":data.amount.toString(),
      "order_id":data.id,
      "name": "Pay",
      "description": "Happy shopping",
      "image": "http://localhost:2000/logo.jpg",
      "handler": async function result(response){
          alert(response.razorpay_payment_id);
          alert(response.razorpay_order_id);
          alert(response.razorpay_signature)
          const dbObject = {
            orderId:response.razorpay_order_id,
            paymentId:response.razorpay_payment_id,
            razorpaySignature:response.razorpay_signature,
            id:data.id
          }

          const dbSave = await fetch("http://localhost:2000/verify", { method : "POST",
          headers:{
            "content-type":"application/json"
          },
          body: JSON.stringify(dbObject) })
          console.log(dbSave)
      },
      "prefill": {
          "name": "Siva Subramanian",
          "email": "siva.developer@example.com",
          "contact": "5555555555"
      },
      "notes": {
          "address": "Razorpay Corporate Office"
      },
      "theme": {
          "color": "#3399cc"
      }
  };
  var paymentObject = new window.Razorpay(options)
  paymentObject.open()
  }
  
  
  return (
    <div className = "product-container-bg">
      <div className = "product-container">
        <img src = "https://res.cloudinary.com/backenddev/image/upload/v1628435064/product-shoe-image_i4kb9b.jpg" 
        alt="shoe" className="product-image"/>
        <div className = "product-details-container">
          <p className = "shoe-details">Causal wear Shoes</p>
          <p className = "amount-inr">Rs.500</p>
          <button className = "pay-btn" onClick={displayRazorpay}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
