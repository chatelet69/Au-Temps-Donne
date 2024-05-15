import React from "react";
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckOutContainer from "./CheckOutContainer";
const PUBLIC_KEY = require('../../config.json').stripePublicKey;
const PRIVATE_KEY = require('../../config.json').stripePrivateKey;

const stripeTestPromise = loadStripe(PUBLIC_KEY);

const StripeContainer = () =>{
        
    return(
        <Elements stripe={stripeTestPromise} >
            <CheckOutContainer />
        </Elements>
    )
}

export default StripeContainer