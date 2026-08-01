import mongoose, { ClientSession, mongo, Types } from "mongoose";
import { generateSeatLayout, groupShowsByTheatreAndMovie } from "../../utils";
import { IShow } from "./show.interface";
import { ShowModel } from "./show.model";
import { TheaterModel } from "../theater/theater.model";

//1. Create a show
export const createShow = async (showData: IShow) => {
  const seatLayout = generateSeatLayout();
  const showToCreate = { ...showData, seatLayout };

  return await ShowModel.create(showToCreate);
};

const generatePriceMap = () =>
  new Map([
    ["PREMIUM", 510],
    ["EXECUTIVE", 290],
    ["NORMAL", 270],
  ]);

const formats = ["2D", "3D", "IMAX", "PVR PXL"];

const fixedTimeSlots = [
  { start: "09:00 AM", end: "11:30 AM" },
  { start: "12:30 PM", end: "03:00 PM" },
  { start: "04:00 PM", end: "06:30 PM" },
  { start: "07:30 PM", end: "10:00 PM" },
  { start: "10:30 PM", end: "01:00 AM" },
];

const autoGenerateShowsForDate = async (movieId: string, date: string, location?: string) => {
  const theaters = await TheaterModel.find();
  if (!theaters.length) return;

  const targetTheaters = location
    ? theaters.filter(
        (t) =>
          t.city?.toLowerCase().includes(location.toLowerCase()) ||
          t.state?.toLowerCase().includes(location.toLowerCase()) ||
          t.location?.toLowerCase().includes(location.toLowerCase())
      )
    : theaters;

  const theatersToUse = targetTheaters.length > 0 ? targetTheaters : theaters;

  const newShowsToInsert = [];
  for (const theatre of theatersToUse) {
    const numShows = Math.floor(Math.random() * 3) + 2;
    const selectedSlots = fixedTimeSlots.slice(0, numShows);

    for (const slot of selectedSlots) {
      newShowsToInsert.push({
        movie: new Types.ObjectId(movieId),
        theater: theatre._id,
        location: theatre.city || theatre.state || theatre.location,
        format: formats[Math.floor(Math.random() * formats.length)],
        audioType: "Dolby 7.1",
        startTime: slot.start,
        date: date,
        priceMap: generatePriceMap(),
        seatLayout: generateSeatLayout(),
      });
    }
  }

  if (newShowsToInsert.length > 0) {
    await ShowModel.insertMany(newShowsToInsert);
  }
};

//2. get shows by movie date and location
export const getShowsByMovieDateLocation = async (
  movieId: string,
  date: string,
  location: string
) => {
  const query: any = {
    movie: new Types.ObjectId(movieId),
  };

  if (date) {
    query.date = date;
  }

  let shows = await ShowModel.find(query)
    .populate("movie theater")
    .sort({ startTime: 1 });

  // Filter shows by location (matching theater city, state, or show location)
  let filteredShows = shows.filter((show: any) => {
    if (!location) return true;
    const locLower = location.toLowerCase();
    const showLoc = (show.location || "").toLowerCase();
    const theaterCity = (show.theater?.city || "").toLowerCase();
    const theaterState = (show.theater?.state || "").toLowerCase();
    return (
      showLoc.includes(locLower) ||
      theaterCity.includes(locLower) ||
      theaterState.includes(locLower)
    );
  });

  // If no shows exist for this date, automatically generate shows for this date on-demand!
  if (filteredShows.length === 0 && date) {
    await autoGenerateShowsForDate(movieId, date, location);

    shows = await ShowModel.find(query)
      .populate("movie theater")
      .sort({ startTime: 1 });

    filteredShows = shows.filter((show: any) => {
      if (!location) return true;
      const locLower = location.toLowerCase();
      const showLoc = (show.location || "").toLowerCase();
      const theaterCity = (show.theater?.city || "").toLowerCase();
      const theaterState = (show.theater?.state || "").toLowerCase();
      return (
        showLoc.includes(locLower) ||
        theaterCity.includes(locLower) ||
        theaterState.includes(locLower)
      );
    });
  }

  const groupedShows = groupShowsByTheatreAndMovie(filteredShows);

  return groupedShows;
};
//3. get show by id
export const getShowById = async (showId: string) => {
  return await ShowModel.findById(showId).populate("movie theater");
};

//4. update seat status
export const updateSeatStatus = async (
  showId: mongoose.Types.ObjectId,
  seats: string[],
  status: "AVAILABLE" | "BOOKED" | "BLOCKED",
  session: ClientSession
) => {
  
  const show = await ShowModel.findById(showId).session(session);
  if(!show) {
    throw new Error(`Show not found!`)
  }

  // Parse each seat string like "A1" into row and number
  const parsedSeats = seats.map((seat) => {
    const row = seat.charAt(0);
    const number = parseInt(seat.slice(1));
    return { row, number };
  });


  // Update the seat layout based on the parsed seats

  for(const parsedSeat of parsedSeats) {

    // Search the seatLayout array for a row whose "row" field matches e.g. "A1"
    // seatLayout = [{ row: "A", seats: [...] }, { row: "B", seats: [...] }]
    const row = show.seatLayout.find((r) => r.row === parsedSeat.row);

    if(!row) {
      throw new Error(`Invalid seat row: ${parsedSeat.row}`);
    }

    // Inside the found row, search the seats array for matching seat number
    // row.seats = [{ number: 1, status: "AVAILABLE" }, { number: 2, status: "AVAILABLE" }]
    const seat = row.seats.find((s) => s.number === parsedSeat.number);

    if(!seat) {
      throw new Error(`Invalid seat number: ${parsedSeat.number} in row ${parsedSeat.row}`);
    }

    // Guard: prevent double booking — if already BOOKED, reject the whole transaction
    if(seat.status === "BOOKED") {
      throw new Error(`Seat ${parsedSeat.row}${parsedSeat.number} is already booked!`);
    }

    seat.status = status; // Update the seat status to BOOKED or BLOCKED

  }

  show.markModified("seatLayout"); // Inform Mongoose that seatLayout has been modified

  await show.save({ session }); // Save the updated show document within the transaction session

}


