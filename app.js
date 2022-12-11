const express = require("express");
const app = express();
const port = process.env.port || 2323;

// Declare constants for loanResult
const HEADERHTML = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                    <link rel="stylesheet" href="css/styles.css">
                    <body class="loanResultPage">`
const MINAMOUNT = 5000
const MAXAMOUNT = 1000000
const MINRATE = 1
const MAXRATE = 10

// Let program know about public folder
app.use(express.static("public"))
app.use(express.urlencoded({extended: false}))

// Definte routes
app.get("/", (req,res) => {
    res.sendFile(__dirname + "index.html");
})

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
})

app.get("/loanresult", (req,res) => {
    res.send(`<p>You reached this page in error.</p>`)
})

app.post("/loanresult", (req,res) => {
    res.send(getLoanResultString(req))
})

const getLoanResultString = (req) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let loanReason = req.body.loanReason;
    let interestRate = req.body.interestRate;
    let loanAmount = req.body.loanAmount;
    let loanYears = req.body.loanYears;

    console.log(interestRate, loanAmount, loanYears);

    let resultString = HEADERHTML;
    let keepGoing = true;

    // Check name fields are filled
    if (firstName == "" || lastName== "") {
        keepGoing = false;
        resultString += `<h1>Please fill out your full name.</h1>
                        <a href="/">Return to Home Page</a>`;
    }

    // Check that interest amount is within restraints
    if (keepGoing && (loanAmount < MINAMOUNT || loanAmount > MAXAMOUNT)) {
        keepGoing = false;
        resultString += `<h1>Please select an interest amount between ${MINAMOUNT} and ${MAXAMOUNT} dollars.</h1>
                        <a href="/">Return to Home Page</a>`;
    }
    else {
        loanAmount = parseFloat(loanAmount);
    }

    console.log(interestRate, loanAmount, loanYears);

    // Check that a reason is selected
    if (keepGoing && loanReason == "Loan Reason") {
        keepGoing = false;
        resultString += `<h1>Please select a loan reason.</h1>
                        <a href="/">Return to Home Page</a>`;
    }

    // Ensure interest rate is valid
    if (keepGoing && (interestRate < MINRATE || interestRate > MAXRATE)) {
        keepGoing = false;
        resultString += `<h1>Please select an interest rate between ${MINRATE} and ${MAXRATE}%.</h1>
                        <a href="/">Return to Home Page</a>`;
    }
    else {
        interestRate = parseFloat(interestRate);
    }

    console.log(interestRate, loanAmount, loanYears);

    // Make sure that the client has selected an amount of years
    if (keepGoing && loanYears == "Loan Years") {
        keepGoing = false;
        resultString += `<h1>Please select an amount of years to pay off your loan.</h1>
                        <a href="/">Return to Home Page</a>`;
    }
    else {
        loanYears = parseInt(loanYears);
    }

    console.log(interestRate, loanAmount, loanYears);

    // Inputs are valid
    if (keepGoing) {
        let loanMonthCount = loanYears * 12;
        let loanAfterInterest = loanAmount;
        let loanInterestRate = 1 + (interestRate *.01);


        console.log(interestRate, loanAmount, loanYears);

        for(let lcv = 0; lcv < loanYears; lcv++) {
            loanAfterInterest = loanAfterInterest * loanInterestRate;
        };
        
        console.log(interestRate, loanAmount, loanYears);

        let monthlyPayment = Math.round((loanAmount / loanMonthCount) * 10) / 10;
        let adjustedMonthlyPayment = Math.round((loanAfterInterest / loanMonthCount) * 10) / 10;

        console.log(interestRate, loanAmount, loanYears);

        resultString = `
        ${HEADERHTML}
        <h1>Loan Accepted!</h1><br><br>
        <h2>Your information:<h2>
        <p>You are ${firstName} ${lastName}. You've applied for a loan in the amount of $${loanAmount}
        for a brand new ${loanReason}. Your current interest rate is ${interestRate}% and you have ${loanYears}
        years to pay it off. To do this, you'll have to pay at least $${monthlyPayment} a month, or
        $${adjustedMonthlyPayment} a month to keep up with your interest rate.</p>
        <br><br>
        <h2>Loan Stats:</h2>
        <table class="table middleSmaller">
            <tbody>
                <tr>
                    <th scope="row">First Name</th>
                    <td>${firstName}</td>
                </tr>
                <tr>
                    <th scope="row">Last Name</th>
                    <td>${lastName}</td>
                </tr>
                <tr>
                    <th scope="row">Loan Amount</th>
                    <td>$${loanAmount}</td>
                </tr>
                <tr>
                    <th scope="row">Loan Reason</th>
                    <td>${loanReason}</td>
                </tr>
                <tr>
                    <th scope="row">Years to Pay Off</th>
                    <td>${loanYears}</td>
                </tr>
                <tr>
                    <th scope="row">Interest Rate</th>
                    <td>${interestRate}%</td>
                </tr>
                <tr>
                    <th scope="row">Monthly Payment</th>
                    <td>$${monthlyPayment}</td>
                </tr>
                <tr>
                    <th scope="row">Adjusted Monthly Payment</th>
                    <td>$${adjustedMonthlyPayment}</td>
                </tr>
            </tbody>
        </table>
        `;

        resultString += amort(loanAmount, (interestRate / 100), loanMonthCount)
    }
    

    return resultString += `</body>`;
}

function amort(balance, interestRate, terms)
    {
        let result = "";
        //Calculate the per month interest rate
        let monthlyRate = interestRate/12;
        
        //Calculate the payment
        let payment = balance * (monthlyRate/(1-Math.pow(
            1+monthlyRate, -terms)));
            
        //add header row for table to return string
        result += `
        <br><br>
        <h1>Amortization Table</h1>
        <br>
        <table  class="table middleSmaller"><tr><th>Month #</th><th>Balance</th>` + 
            "<th>Interest</th><th>Principal</th>";
        
        /**
         * Loop that calculates the monthly Loan amortization amounts then adds 
         * them to the return string 
         */
        for (let count = 0; count < terms; ++count)
        { 
            //in-loop interest amount holder
            let interest = 0;
            
            //in-loop monthly principal amount holder
            let monthlyPrincipal = 0;
            
            //start a new table row on each loop iteration
            result += "<tr align=center>";
            
            //display the month number in col 1 using the loop count variable
            result += "<td>" + (count + 1) + "</td>";
            
            
            //code for displaying in loop balance
            result += "<td> $" + balance.toFixed(2) + "</td>";
            
            //calc the in-loop interest amount and display
            interest = balance * monthlyRate;
            result += "<td> $" + interest.toFixed(2) + "</td>";
            
            //calc the in-loop monthly principal and display
            monthlyPrincipal = payment - interest;
            result += "<td> $" + monthlyPrincipal.toFixed(2) + "</td>";
            
            //end the table row on each iteration of the loop	
            result += "</tr>";
            
            //update the balance for each loop iteration
            balance = balance - monthlyPrincipal;		
        }
        
        //Final piece added to return string before returning it - closes the table
        result += "</table>";
        
        //returns the concatenated string to the page
        return result;
    }
