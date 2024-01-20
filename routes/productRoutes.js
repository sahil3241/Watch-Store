import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { braintreePaymentController, braintreeTokenController, createProductController, deleteProductController, getProductController, getSingleProductController, productCategoryController, productCountController, productFilterController, productListController, productPhotoController, searchProductController, updateProductController } from "../controllers/productController.js";
import formidable from "express-formidable";

const router = express.Router();

router.post('/create-product', requireSignIn, isAdmin, formidable() ,createProductController);

router.get('/get-product', getProductController);

router.get('/get-product/:slug', getSingleProductController);

router.get('/product-photo/:pid', productPhotoController);

router.delete('/product/:pid', deleteProductController);

router.put('/update-product/:pid', requireSignIn, isAdmin, formidable() ,updateProductController);

router.post('/product-filters', productFilterController);

router.get('/product-count', productCountController);

router.get('/product-list/:page', productListController);

router.get('/search/:keyword', searchProductController);

router.get('/product-category/:slug', productCategoryController);

router.get('/braintree/token', braintreeTokenController);

router.post('/braintree/payment', requireSignIn, braintreePaymentController);

export default router