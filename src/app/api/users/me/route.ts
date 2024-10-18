// import { getDatafromToken } from "@/helpers/getDatafromToken";

// import { NextRequest, NextResponse } from "next/server";
// import User from '@/models/userModel.js';
// import {connect} from "@/dbConfig/dbConfig";

// connect(); 

// export async function GET(request: NextRequest) {
//     try {
//         const userId = await getDatafromToken(request);
//         const user = await User.findOne({_id: userId}).select('-password'); 
//         return NextResponse.json({
//             message: "User data fetched successfully",
//             data: user
//         })
//     } catch (error:any) {
//         return NextResponse.json({error: error.message},{status: 400});
//     }
// }



import { getDatafromToken } from "@/helpers/getDatafromToken";
import { NextRequest, NextResponse } from "next/server";
import User from '@/models/userModel.js';
import { connect } from "@/dbConfig/dbConfig";

export async function GET(request: NextRequest) {
    const { tenantId } = request.json(); // Extract tenantId from the request
    await connect(tenantId); // Connect to the correct tenant database

    try {
        const userId = await getDatafromToken(request);
        const user = await User.findOne({ _id: userId }).select('-password'); 
        return NextResponse.json({
            message: "User data fetched successfully",
            data: user
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
