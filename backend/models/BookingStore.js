const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DATA_FILE = path.join(__dirname, "..", "data", "bookings.json");

class BookingStore {
  constructor(filePath = DATA_FILE) {
    this.filePath = filePath;
  }

  // This repository boundary is the intended swap point for DynamoDB later.
  async findAll() {
    return this.#read();
  }

  async findById(bookingId) {
    const bookings = await this.#read();
    return bookings.find((booking) => booking.bookingId === bookingId);
  }

  async findByUser(userId) {
    const bookings = await this.#read();
    return bookings.filter((booking) => booking.userId === userId);
  }

  async create(payload) {
    const bookings = await this.#read();
    const booking = {
      bookingId: `BHB-${uuidv4().slice(0, 8).toUpperCase()}`,
      userId: payload.userId || null,
      customerName: payload.customerName,
      email: payload.email,
      phone: payload.phone,
      roomType: payload.roomType,
      guests: Number(payload.guests),
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      bedPreference: payload.bedPreference,
      airportPickup: Boolean(payload.airportPickup),
      specialRequests: payload.specialRequests || "",
      bookingStatus: "Confirmed",
      createdAt: new Date().toISOString()
    };

    bookings.unshift(booking);
    await this.#write(bookings);
    return booking;
  }

  async update(bookingId, payload) {
    const bookings = await this.#read();
    const index = bookings.findIndex((booking) => booking.bookingId === bookingId);
    if (index === -1) return null;
    if (bookings[index].bookingStatus === "Cancelled") return { cancelled: true, booking: bookings[index] };
    if (payload.userId && bookings[index].userId && bookings[index].userId !== payload.userId) return { forbidden: true };

    bookings[index] = {
      ...bookings[index],
      ...payload,
      bookingId,
      userId: bookings[index].userId,
      guests: payload.guests ? Number(payload.guests) : bookings[index].guests,
      airportPickup:
        typeof payload.airportPickup === "boolean"
          ? payload.airportPickup
          : bookings[index].airportPickup,
      updatedAt: new Date().toISOString()
    };

    await this.#write(bookings);
    return bookings[index];
  }

  async cancel(bookingId) {
    const bookings = await this.#read();
    const index = bookings.findIndex((booking) => booking.bookingId === bookingId);
    if (index === -1) return null;

    bookings[index] = {
      ...bookings[index],
      bookingStatus: "Cancelled",
      cancelledAt: new Date().toISOString()
    };

    await this.#write(bookings);
    return bookings[index];
  }

  async #read() {
    const content = await fs.readFile(this.filePath, "utf8");
    return JSON.parse(content);
  }

  async #write(bookings) {
    await fs.writeFile(this.filePath, JSON.stringify(bookings, null, 2));
  }
}

module.exports = BookingStore;
