import axios from 'axios';

const Price = require('ilp-price');
const { exchangeRates } = require('../config/pricing.json');

const exchangeRate = async (clientCurrency: string, clientPaymentPointer: string, hostCurrency: string, hostPaymentPointer: string): Promise<number> =>
{
    if (clientPaymentPointer && clientCurrency !== 'USD')
    {
        // No way to find the exact exchange rate currently...
        // const [clientExchangeRate, hostExchangeRate]: Array<number> = await Promise.all([
        //     determineExchangeRate(clientCurrency, clientPaymentPointer),
        //     determineExchangeRate(hostCurrency, hostPaymentPointer)
        // ]);

        //return clientExchangeRate / hostExchangeRate;
        return determineExchangeRate(clientCurrency, hostCurrency);
    }
    else if (clientCurrency === 'USD')
    {
        return exchangeRates[clientCurrency];
    }
    else
    {
        console.error('The client SPSP server is not running!');
        return await -1;
    }
}

// const determineExchangeRate = async (currency: string, paymentPointer: string): Promise<any> =>
// {
//     // ILP-price doesn't work -- only local currencies work due to PSK deprecation and local is retrieved with ILDCP

//     // No choice but to just call some API...
//     const response = await axios.get('https://api.cryptonator.com/api/ticker/xrp-usd');
//     const price = new Price({
//         landmarks: {
//             "g.": {
//                 [currency]: [
//                     paymentPointer
//                 ]
//             }
//         }
//     });

//     const rate = await price.fetch(currency, 1);
//     console.log('Rate to ' + currency + ' is ' + rate);
//     return rate;
// }

// Technically not the correct way to determine the rate, but it will work as a stop gap
// Bad, since provides a point of failure
const determineExchangeRate = async (clientCurrency: string, baseCurrency: string): Promise<any> =>
{
    try
    {
        const response = await axios.get(`https://api.cryptonator.com/api/ticker/${baseCurrency}-${clientCurrency}`);
        console.log(response);

        return Number(response.data.ticker.price);
    }
    catch (error)
    {
        console.error(error);
    }
}

export const paymentService = {
    exchangeRate: exchangeRate
}