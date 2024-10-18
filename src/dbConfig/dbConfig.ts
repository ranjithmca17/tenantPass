// import mongoose from "mongoose";

// export async function connect() {
//     try {
//         mongoose.connect(process.env.MONGO_URI!);
//         console.log('Database is connected');
//         const connection = mongoose.connection;
//         connection.on('connected', () => {
//             console.log("MongoDB connected Successfully");
//         })

//         connection.on('error', (err) =>{
//             console.log('MongoDB connection error. Please Make sure MongoDB is running. '+ err);
//             process.exit();
//         })

//     } catch (error) {
//         console.log("Something Went Wrong!");
//         console.log(error);
//     }
// }



import mongoose from "mongoose";

let isConnected = false; 

export async function connect(tenantId: string) {
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
