import * as Koa from "koa";
import * as combineRouters from "koa-combine-routers";
import { DrinkPaymentRouter, ContractInfoRouter, DeviceSetupRouter } from "./routers";
import { SPSPServer } from './paymentReceivers';
import * as CORS from "@koa/cors";
import * as serve from "koa-static";
import { orderService } from "./services";

let path: any = require("path");
let bodyParser: any = require('koa-bodyparser');

// Set the port to listen on -- may want to make this more customizable
const PORT: number = 8080;

export default class Server
{
    public app : Koa

    public constructor()
    {
        // Create an ExpressJS application instance
        this.app = new Koa();

        // Configure the application
        this.Configure();

        // Add the routes
        this.Routes();
    }

    public async Configure()
    {
        // Add static paths -- needs to be updated for the different frontend methods
        this.app.use(bodyParser());

        // Add error handling
        this.app.on("error", console.error);

        // Create the SPSP receiver -- does this need to be awaited?
        await SPSPServer.run(orderService.order);

        // Listen on a port
        this.app.listen(PORT);
    }

    private Routes()
    {
        // Attach all the routers
        const combinedRouter = combineRouters(
            new ContractInfoRouter("This is the router for contract information").router,
            new DrinkPaymentRouter("This is the router to send payed requests to the device").router,
            new DeviceSetupRouter('This is the device setup router', '/device').router
        );

        const corsOptions: any = {
            origin: '*'
        };
        
        // Use the router middleware -- combine all the routers
        this.app.use(CORS(corsOptions));
        this.app.use(serve(__dirname + '/assets'));
        this.app.use(combinedRouter());
    }
}