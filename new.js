analys all codes
this is model.js 
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please Provide a Username"],
    unique: true,
  },

  email: {
    type: String,
    required: [true, "Please Provide a Email"],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Please Provide a Password"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
  verifyToken: String,
  verifyTokenExpiry: Date,
});

// const User = mongoose.model.users || mongoose.model("users", userSchema);
let User;
if (mongoose.modelNames().includes('users')) {
  // If it exists, retrieve the existing model
  User = mongoose.model('users');
} else {
  // If it doesn't exist, define the "users" model
  User = mongoose.model('users', userSchema);
}


export default User;
and sign.ts is 
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { username, email, password } = reqBody;

    console.log(reqBody);

    // Check if user already exists
    const user = await User.findOne({ email });

    if (user) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    console.log(savedUser);

    await sendEmail({email, emailType: "VERIFY", userId: savedUser._id})


    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
and this is me.ts
import { getDatafromToken } from "@/helpers/getDatafromToken";

import { NextRequest, NextResponse } from "next/server";
import User from '@/models/userModel.js';
import {connect} from "@/dbConfig/dbConfig";

connect(); 

export async function GET(request: NextRequest) {
    try {
        const userId = await getDatafromToken(request);
        const user = await User.findOne({_id: userId}).select('-password'); 
        return NextResponse.json({
            message: "User data fetched successfully",
            data: user
        })
    } catch (error:any) {
        return NextResponse.json({error: error.message},{status: 400});
    }
}
and this is login .ts 
import { connect } from "@/dbConfig/dbConfig";
// import User from "@/models/userModel";

import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";

connect();

export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json();
        const {email,password} = reqBody;
        console.log(reqBody);

        const user = await User.findOne({email});
        if(!user){
            return NextResponse.json({error:"User does not exist"},{status:400})
        }

        const validPassword = await bcryptjs.compare(password,user.password);
        if(!validPassword){
            return NextResponse.json({error:"Invalid password"},{status:400})
        }

        const tokendata = {
            id : user._id,
            email: user.email,
            username: user.username,

        }
        const token = jwt.sign(tokendata, process.env.TOKEN_SECRET!,{expiresIn:"1h"});

        const response = NextResponse.json({message:"Login successful",token},{status:200});

        response.cookies.set("token", token, {
            httpOnly: true,

        })
        return response;

    } catch (error: any) {
        return NextResponse.json({error:error.message},{status:500})
    }

}

and this is singup.tsx 
"use client";

import React, {useEffect} from "react";
import Link from "next/link";
import axios from 'axios';
import {useRouter} from 'next/navigation';
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = React.useState({
    email: "",
    username: "",
    password: "",
  });
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSignup = async () => {

    try {
      setLoading(true);
      const response = await axios.post('/api/users/signup', user);
      console.log("SignUP Response", response.data);
      router.push('/login');
      
    } catch (error:any) {
      console.log(error);
      toast.error(error.message);
      
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    if(user.email.length > 0 && user.password.length > 0 && user.username.length > 0){
      setButtonDisabled(false);
    }
    else{
      setButtonDisabled(true);
    }
  },[user]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1>{loading ? "Processing" : "SignUp"}</h1>
      <hr />
      <label htmlFor="username">Username</label>
      <input
        className="p-1 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-600 text-black"
        id="username"
        type="text"
        value={user.username}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
        placeholder="Username"
      />

      <label htmlFor="email">Email</label>
      <input
        className="p-1 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-600 text-black"
        id="email"
        type="text"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        placeholder="Email"
      />

      <label htmlFor="password">Password</label>
      <input
        className="p-1 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-600 text-black"
        id="password"
        type="password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
        placeholder="Password"
      />
      <br />
      <button
        onClick={onSignup}
        className="p-2 border border-gray-300 mb-4 bg-blue-500 text-white rounded-lg "
      >{buttonDisabled ? "Disabled" : "Signup"}
      </button>
      <Link href="/login">Visit Login</Link>

      
    </div>
  );
}
and this is login.tsx 
"use client";
import React, { useEffect } from "react";
// import { Link } from 'react-router-dom';
import Link from "next/link";
import axios from 'axios';
import {useRouter} from 'next/navigation';
import toast from "react-hot-toast";
// import router from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = React.useState({
    email: "",
    password: "",
  });

  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/users/login', user);
      console.log("Login Response", response.data);
      router.push('/profile');
    } catch (error:any) {
      console.log("Login failed", error);
      toast.error(error.message);
    }finally{
      setLoading(false);
    }
  };


  useEffect(() => {
    if(user.email.length > 0 && user.password.length > 0){
      setButtonDisabled(false);
    }
    else{
      setButtonDisabled(true);
    }
  }, [user]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1>{loading ? "Processing" : "Login"}</h1>
      <hr />
      <label htmlFor="email">Email</label>
      <input
        className="p-1 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-600 text-black"
        id="username"
        type="text"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        placeholder="Email"
      />

      <label htmlFor="password">Password</label>
      <input
        className="p-1 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-600 text-black"
        id="password"
        type="password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
        placeholder="Password"
      />
      <br />
      <button
        onClick={onLogin}
        className="p-2 border border-gray-300 mb-4 bg-blue-500 text-white rounded-lg "
      >
        Login Here
      </button>
      <Link href="/signup">Visit SignUp</Link>
      <Link href="/forgotpassword">Forgot Password?</Link>
    </div>
  );
}
and this is debConfig.ts 
import mongoose from "mongoose";

export async function connect() {
    try {
        mongoose.connect(process.env.MONGO_URI!);
        console.log('Database is connected');
        const connection = mongoose.connection;
        connection.on('connected', () => {
            console.log("MongoDB connected Successfully");
        })

        connection.on('error', (err) =>{
            console.log('MongoDB connection error. Please Make sure MongoDB is running. '+ err);
            process.exit();
        })
        
    } catch (error) {
        console.log("Something Went Wrong!");
        console.log(error);
    }
}

rewrite this all files add tenantId the tenantId is a dataBase name example this 

// dbConfig.js
const mongoose = require('mongoose');

let isConnected = false; // Connection state

async function Connect(tenantId) {
    const MONGO_URI = `mongodb+srv://ranjithdevwemo2:ranjithdevwemo2@cluster0.3ckmctb.mongodb.net/${tenantId}`;

    if (isConnected) {
        console.log(`Already connected to database: ${tenantId}`);
        return;
    }

    try {
        await mongoose.connect(MONGO_URI);
        isConnected = true;
        console.log(`MongoDB connected successfully to database: ${tenantId}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

module.exports ={Connect};
