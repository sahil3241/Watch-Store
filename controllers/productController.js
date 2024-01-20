import slugify from "slugify";
import productModel from "../models/productModel.js";
import categoryModel from '../models/categoryModel.js';
import fs from 'fs';
import dotenv from 'dotenv';
import braintree from "braintree";
import OrderModel from "../models/OrderModel.js";

dotenv.config();

var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
  });



export const createProductController = async (req, res) => {
    try{
        const {name ,description, price, category, quantity} = req.fields;
        const {photo} = req.files;
        switch(true){
            case !name:
                return res.status(500).send({error:'Name is required'});
            case !description:
                return res.status(500).send({error:'Description is required'});
            case !price:
                return res.status(500).send({error:'Price is required'});
            case !category:
                return res.status(500).send({error:'Category is required'});
            case !quantity:
                return res.status(500).send({error:'Quantity is required'});
            case photo && photo.size > 1000000:
                return res.status(500).send({error:'Photo is required and should be less than 1mb'});
        }
        const products = new productModel({...req.fields, slug:slugify(name)})
        if(photo){
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
            success:true,
            message:'Product created successfully',
            products,
        });
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error in product controller',
            error
        })
    }
}

export const getProductController = async (req, res) => {
    try{
        const product = await productModel.find({}).populate('category').select('-photo').limit(12).sort({createdAt:-1});
        res.status(200).send({
            success:true,
            message:'All products ',
            product,
            total: product.length,
        })
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error in product controller',
            error
        })
    }
}

export const getSingleProductController = async (req, res) => {
    try{
        const product = await productModel.findOne({slug:req.params.slug}).select('-photo').populate('category');
        res.status(200).send({
            success:true,
            message:'Single product fetched',
            product
        })
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error while getting single product',
            error
        })
    }
}

export const productPhotoController = async (req, res) => {
    try{
        const product = await productModel.findById(req.params.pid).select('photo');
        if(product.photo.data){
            res.set('Content-type', product.photo.contentType);
            return res.status(200).send(product.photo.data);
        }
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error in product photo controller',
            error
        })
    }
}

export const deleteProductController = async (req, res) => {
    try{
        await productModel.findByIdAndDelete(req.params.pid).select('-photo');
        res.status(200).send({
            success:true,
            message:'Product Deleted Successfully'
        })
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error in deleting product',
            error
        })
    }
}

export const updateProductController = async (req, res) => {
    try{
        const {name ,description, price, category, quantity} = req.fields;
        const {photo} = req.files;
        switch(true){
            case !name:
                return res.status(500).send({error:'Name is required'});
            case !description:
                return res.status(500).send({error:'Description is required'});
            case !price:
                return res.status(500).send({error:'Price is required'});
            case !category:
                return res.status(500).send({error:'Category is required'});
            case !quantity:
                return res.status(500).send({error:'Quantity is required'});
            case photo && photo.size > 1000000:
                return res.status(500).send({error:'Photo is required and should be less than 1mb'});
        }
        const products = await productModel.findByIdAndUpdate(req.params.pid,{
            ...req.fields, slug:slugify(name)},{new:true});
        if(photo){
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
            success:true,
            message:'Product updated successfully',
            products,
        });
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error in updating product',
            error
        })
    }
}

export const productFilterController = async (req, res) => {
    try {
        const { checked, radio } = req.body;
        let args = {};

        if (checked.length > 0) {
            args.category = checked;
        }

        if (radio.length) {
            args.price = {
                $gte: parseFloat(radio[0]), 
                $lte: parseFloat(radio[1]),
            };
        }

        const products = await productModel.find(args);

        res.status(200).send({
            success: true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: 'Error in product filter controller',
            error,
        });
    }
};

export const productCountController =  async (req, res) => {
    try{
        const total = await productModel.find({}).estimatedDocumentCount() 
        res.status(200).send({
            success:true,
            total
        })
    }catch(error){
        res.status(400).send({
            success:false,
            message:'Error in product count'
        })
    }
}

export const productListController = async (req, res) => {
    try{
        const perPage = 2
        const page = req.params.page ? req.params.page : 1
        const products = await productModel.find({}).select('-photo').skip((page-1)*perPage).limit(perPage).sort({createdAt:-1});
        res.status(200).send({
            success:true,
            products
        })

    }catch(error){
        console.log(error);
        res.status(400).send({
            success:false,
            message:'Error in product list controller'
        })
    }
}

export const searchProductController = async (req, res) => {
    try{
        const {keyword} = req.params
        const result =  await productModel.find({
            $or: [
                {name: {$regex: keyword, $options:'i'}},
                {description: {$regex: keyword, $options:'i'}}
            ]
        }).select('-photo')
        res.json({result})
    }catch(error){
        console.log(error);
        res.status(400).send({
            success:false,
            message:'Error in search controller',
            error
        })
    }
}

export const productCategoryController = async (req, res) => {
    try{
        const category = await categoryModel.findOne({
            slug:req.params.slug
        })
        const product = await categoryModel.find({category}).populate('category')
        res.status(200).send({
            success:true,
            category,
            product,
        })
    }catch(error){
        console.log(error);
        res.status(400).send({
            success:false,
            message:'Error in product category controller',
            error
        })
    }
}

export const braintreeTokenController = async (req, res) => {
    try{
        gateway.clientToken.generate({}, function(err, response){
            if(err){
                res.status(500).send(err)
            }else{
                res.send(response);
            }
        })
    }catch(error){
        console.log(error);
    }
}

export const braintreePaymentController = async (req, res) => {
    try{
        const {cart, nonce} = req.body;
        let total = 0;
        cart.map( i => {total += i.price});
        let newTransaction = gateway.transaction.sale({
            amount:total,
            paymentMethodNonce: nonce,
            options:{
                submitForSettlement:true
            }
        },
        function(error, result){
            if(result){
                const order = new OrderModel({
                    products:cart,
                    payment:result,
                    buyer:req.user._id
                }).save()
                res.JSON({ok:true})
            }else{
                res.status(500).send(error)
            }
        }
        )

    }catch(error){
        console.log(error)
    }
}