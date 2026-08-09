import mongoose from "mongoose";
import { generateBookingReference } from "../../utils";
import { IBooking } from "./booking.interface";
import BookingModel from "./booking.model";
import Razorpay from "razorpay";
import { config } from "../../config/config";
import { updateSeatStatus } from "../show/show.service";
import path from "path";


export const createBooking = async (bookingData: IBooking, userId: string) => {

    // 🔹 1. Basic validation
    if(!bookingData.showId || !bookingData.seats || bookingData.seats.length === 0 || !bookingData.paymentId || !bookingData.bookingFee) {
        throw new Error(`Invalid booking data!`)
    }
    
    // 🔹 2. Destructure all properties from body
    const { showId, seats, paymentId, bookingFee } = bookingData;

    // 🔹 3. Generate unique booking reference
    const bookingRef = generateBookingReference();

    // 🔹 4. Start Transaction if supported (Replica Set mode)
    let session: mongoose.ClientSession | null = null;
    let useTransaction = false;

    const topologyType = (mongoose.connection as any)?.topology?.description?.type;
    const isReplicaSet = topologyType && topologyType !== "Single" && topologyType !== "Unknown";

    if (isReplicaSet) {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
            useTransaction = true;
        } catch (sessionErr) {
            if (session) {
                try { (session as mongoose.ClientSession).endSession(); } catch (e) {}
            }
            session = null;
            useTransaction = false;
        }
    }

    try {
        // 🔹 5. Critical Query (Check if ANY of the requested seats are already booked)
        const existingBooking = await BookingModel.findOne({
                showId, status : "CONFIRMED", seats: { $in: seats }
            }).session(session);
        
        if(existingBooking){
            throw new Error(`One or more of the requested seats are already booked!`);
        }  
        
        // 🔹 6. Verify Payment
        let paymentMethodUsed = "DEMO_PAYMENT";
        if (paymentId && !paymentId.startsWith("PAY_") && config.razorpayKey && config.razorpaySecret) {
            try {
                const razorpay = new Razorpay({
                    key_id : config.razorpayKey,
                    key_secret : config.razorpaySecret
                });

                const paymentDetails = await razorpay.payments.fetch(paymentId);

                if(paymentDetails.status !== "captured") {
                    throw new Error(`Payment not successful!`);
                }
                paymentMethodUsed = paymentDetails.method || "RAZORPAY";
            } catch (err: any) {
                if (!paymentId.startsWith("PAY_")) {
                    throw err;
                }
            }
        }

        // 🔹 7. Create Booking
        const bookingPayload = {
            bookingRef,
            userId,
            showId,
            seats,
            status: "CONFIRMED",
            paymentId,
            paymentMethod: paymentMethodUsed,
            bookingFee,
        };

        let booking;
        if (useTransaction && session) {
            const [created] = await BookingModel.create([bookingPayload], { session });
            booking = created;
        } else {
            booking = await BookingModel.create(bookingPayload);
        }

         // 🔹 8. Update Seat Availability in Show Document
         await updateSeatStatus(showId, seats, "BOOKED", session as any);

         // 🔹 9. Commit Transaction if active
        if (useTransaction && session) {
            await session.commitTransaction();
            session.endSession();
        }

        return booking;
        

    } catch (error) {
        if (useTransaction && session) {
            await session.abortTransaction();
            session.endSession();
        }
        throw error;
    }


};

export const getAllBookings = async (userId : string) => {
    return await BookingModel.find({userId})
    .populate(
        {
            path : "showId",
            populate : [
                {
                path : "movie",
                select : "title posterUrl duration format"
            },
            {
                path : "theater",
                select : "name location city state"
            }
            ]
        }
    ).sort({ createdAt : -1 }); // latest booking first
}