import { comparePassword, hashPassword } from "../helpers/authhelper.js";
import userModel from "../models/userModel.js";
import JWT from 'jsonwebtoken';

export const registerController = async (req, res) => {
    try{
        const {name, email, password, phone, address, question} = req.body;
        if(!name){
            return res.send({message: 'Name is required'});
        }
        if(!email){
            return res.send({message: 'Email is required'});
        }
        if(!password){
            return res.send({message: 'Password is required'});
        }
        if(!phone){
            return res.send({message: 'Phone is required'});
        }
        if(!address){
            return res.send({message: 'Address is required'});
        }
        if(!question){
            return res.send({message: 'Question is required'});
        }

        const existingUser = await userModel.findOne({ email });
        if(existingUser){
            res.status(200).send({
                success:false,
                message:'Already Registered, Please LogIn'
            })
        }
        const hashedPassword = await hashPassword(password);
        const user = await new userModel({name, email, phone, address ,password:hashedPassword, question}).save()

        res.status(201).send({
            success: true,
            message: 'User Registered Successfully',
            user
        })


    }catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in registration',
            error
        })
    }
};

export const loginController = async (req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            res.status(404).send({
                success:false,
                message:'Invalid Email or Password'
            })
        }
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(404).send({
                success:false,
                message:'Email is not registered'
            })
        }
        const match = await comparePassword(password, user.password);
        if(!match){
            return res.status(200).send({
                success:false,
                message:'Invalid Password'
            })
        }
        const token = await JWT.sign({_id:user._id}, process.env.JWT_SECRET, {expiresIn:'7d'});
        res.status(200).send({
            success:true,
            message:'Logged in successfully',
            user:{
                name:user.name,
                email:user.email,
                phone:user.phone,
                address:user.address,
                role:user.role
            },
            token
        })
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error in login',
            error
        })
    }
}

export const forgotPasswordController = async (req, res) => {
    try{
        const {email, question, newPassword} = req.body;
        if(!email){
            res.status(400).send({
                message:'Email is required'
            })
        }
        if(!question){
            res.status(400).send({
                message:'Question is required'
            })
        }
        if(!newPassword){
            res.status(400).send({
                message:'New password is required'
            })
        }
        //check
        const user = await userModel.findOne({email, question});
        if(!user){
            return res.status(404).send({
                success:false,
                message:'Wrong email or answer',
            })
        }
        const hashed = await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id,{password:hashed});
        res.status(200).send({
            success:true,
            message:'Password reset successful',
        })
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Something went wrong',
            error
        })
    }
}

export const testController = (req, res) => {
    res.send("Protected Route");
}


export const updateProfileController = async (req, res) => {
    try{
        const {name, email, address, password, phone} = req.body;
        const user = await userModel.findById(req.user._id);

        if(password && password.length<6){
            return res.json({
                error:'Password is required and 6 characters long',
            })
        }
        const hashedPassword = password ? await hashPassword(password) : undefined
        const updatedUser = await userModel.findByIdAndUpdate(req.user._id,{
            name: name || user.name,
            password: hashedPassword || user.password,
            phone: phone || user.phone,
            address: address || user.address,
        },{new:true})
        res.status(200).send({
            success:true,
            message:'Profile updated successfully',
            updatedUser
        })
    }catch(error){
        console.log(error)
        res.status(400).send({
            success:false,
            message:'Error in update profile controller',
            error
        })
    }
}