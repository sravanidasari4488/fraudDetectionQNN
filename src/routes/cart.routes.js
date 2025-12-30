import { Router } from "express";
import protectedMiddleware from "../middleware/protected.middleware.js";
import { addtocart, removeOneFromCart, addOneInCart, removeAllFromCart, confirmBookings } from "../controllers/cart.controller.js";

const cartRouter = Router();

cartRouter.post('/addtocart', protectedMiddleware, addtocart);

cartRouter.post('/removefromcart', protectedMiddleware, removeOneFromCart)

cartRouter.post('/addoneincart', protectedMiddleware, addOneInCart);

cartRouter.post('/removeallfromcart', protectedMiddleware, removeAllFromCart)

cartRouter.post('/confirmbookings', protectedMiddleware, confirmBookings)

export default cartRouter;