const {
  GetCommand,
  PutCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { docClient, scanAll, tables } = require("../services/dynamoDb");

class BookingStore {
  constructor(tableName = tables.bookings) {
    this.tableName = tableName;
  }

  async findAll() {
    const bookings = await scanAll({
      TableName: this.tableName,
    });
    return this.#sortNewest(bookings);
  }

  async findById(bookingId) {
    const result = await docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { bookingId },
      }),
    );
    return result.Item || null;
  }

  async findByUser(userId) {
    const bookings = await scanAll({
      TableName: this.tableName,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    });
    return this.#sortNewest(bookings);
  }

  async create(payload) {
    const booking = {
      bookingId: `BHB-${uuidv4().slice(0, 8).toUpperCase()}`,
      userId: payload.userId || null,
      customerName: payload.customerName,
      email: payload.email,
      phone: payload.phone,
      roomId: payload.roomId || null,
      roomType: payload.roomType,
      roomName: payload.roomName || payload.roomType,
      roomPrice:
        payload.roomPrice !== undefined ? Number(payload.roomPrice) : null,
      guests: Number(payload.guests),
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      bedPreference: payload.bedPreference,
      airportPickup: Boolean(payload.airportPickup),
      specialRequests: payload.specialRequests || "",
      bookingStatus: payload.bookingStatus || "Confirmed",
      paymentStatus: payload.paymentStatus || "Pending",
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: booking,
        ConditionExpression: "attribute_not_exists(bookingId)",
      }),
    );
    return booking;
  }

  async update(bookingId, payload) {
    const existing = await this.findById(bookingId);
    if (!existing) return null;
    if (existing.bookingStatus === "Cancelled")
      return { cancelled: true, booking: existing };
    if (payload.userId && existing.userId && existing.userId !== payload.userId)
      return { forbidden: true };

    const updated = {
      ...existing,
      ...payload,
      bookingId,
      userId: existing.userId,
      roomId: payload.roomId || existing.roomId,
      roomType: payload.roomType || existing.roomType,
      roomName: payload.roomName || existing.roomName || existing.roomType,
      roomPrice:
        payload.roomPrice !== undefined
          ? Number(payload.roomPrice)
          : existing.roomPrice,
      guests:
        payload.guests !== undefined ? Number(payload.guests) : existing.guests,
      airportPickup:
        typeof payload.airportPickup === "boolean"
          ? payload.airportPickup
          : existing.airportPickup,
      paymentStatus:
        payload.paymentStatus || existing.paymentStatus || "Pending",
      bookingStatus: payload.bookingStatus || existing.bookingStatus,
      updatedAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updated,
      }),
    );
    return updated;
  }

  async cancel(bookingId) {
    const existing = await this.findById(bookingId);
    if (!existing) return null;

    const updated = {
      ...existing,
      bookingStatus: "Cancelled",
      paymentStatus: existing.paymentStatus || "Refunded",
      cancelledAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updated,
      }),
    );
    return updated;
  }

  async delete(bookingId) {
    const existing = await this.findById(bookingId);
    if (!existing) return null;

    await docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { bookingId },
      }),
    );

    return existing;
  }

  async findByRoom(roomId) {
    const bookings = await scanAll({
      TableName: this.tableName,
      FilterExpression: "roomId = :roomId",
      ExpressionAttributeValues: {
        ":roomId": roomId,
      },
    });
    return this.#sortNewest(bookings);
  }

  #sortNewest(bookings) {
    return bookings.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
  }
}

module.exports = BookingStore;
