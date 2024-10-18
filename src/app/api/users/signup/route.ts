// import { connect } from "@/dbConfig/dbConfig";
// import User from "@/models/userModel";
// import { NextRequest, NextResponse } from "next/server";
// import bcryptjs from "bcryptjs";
// import { sendEmail } from "@/helpers/mailer";

// connect();

// export async function POST(request: NextRequest) {
//   try {
//     const reqBody = await request.json();
//     const { username, email, password } = reqBody;

//     console.log(reqBody);

//     // Check if user already exists
//     const user = await User.findOne({ email });

//     if (user) {
//       return NextResponse.json(
//         { error: "User already exists" },
//         { status: 400 }
//       );
//     }

//     // Hash password
//     const salt = await bcryptjs.genSalt(10);
//     const hashedPassword = await bcryptjs.hash(password, salt);

//     const newUser = new User({
//       username,
//       email,
//       password: hashedPassword,
//     });

//     const savedUser = await newUser.save();
//     console.log(savedUser);

//     await sendEmail({email, emailType: "VERIFY", userId: savedUser._id})


//     return NextResponse.json(
//       { message: "User created successfully" },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }



import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";

export async function POST(request: NextRequest) {
    // const { tenantId } = request.json();
    // await connect(tenantId); 

    try {
        const reqBody = await request.json();
        const { username, email, password,tenantId } = reqBody;
console.log("tenantId the tenant Id Is : ",tenantId);

        if (!tenantId) {
          return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 });
      }

      await connect(tenantId);
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
            tenantId // Include tenantId here
        });

        const savedUser = await newUser.save();
        await sendEmail({ email, emailType: "VERIFY", userId: savedUser._id });

        return NextResponse.json(
            { message: "User created successfully" },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
