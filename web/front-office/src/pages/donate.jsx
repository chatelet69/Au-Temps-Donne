import React, { useEffect, useMemo, useState } from "react";
import StripeContainer from "../components/stripe/StripeContainer"

const Donate = () => {   
    
    return (
        <div className="donationBox">
            <StripeContainer />
        </div>
    );
};
 
export default Donate;