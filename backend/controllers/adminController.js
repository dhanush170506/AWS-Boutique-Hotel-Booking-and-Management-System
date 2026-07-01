const { UserStore } = require("../models/UserStore");
const RoomStore = require("../models/RoomStore");
const BookingStore = require("../models/BookingStore");

const userStore = new UserStore();
const roomStore = new RoomStore();
const bookingStore = new BookingStore();

function toDateKey(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

async function getAnalytics(_req, res, next) {
  try {
    const [users, rooms, bookings] = await Promise.all([
      userStore.findAll(),
      roomStore.findAll(),
      bookingStore.findAll(),
    ]);

    const totalUsers = users.length;
    const totalRooms = rooms.length;
    const availableRooms = rooms.reduce(
      (sum, room) => sum + Number(room.availableRooms || 0),
      0,
    );
    const occupiedRooms = rooms.reduce(
      (sum, room) =>
        sum + (Number(room.totalRooms || 0) - Number(room.availableRooms || 0)),
      0,
    );

    const todayKey = new Date().toISOString().slice(0, 10);
    const thisMonthKey = new Date().toISOString().slice(0, 7);

    const todaysBookings = bookings.filter((booking) => {
      const dateKey = toDateKey(booking.checkInDate);
      return dateKey === todayKey;
    }).length;

    const monthlyBookings = bookings.filter((booking) => {
      const dateKey = toDateKey(booking.createdAt);
      return dateKey?.startsWith(thisMonthKey);
    }).length;

    const revenue = bookings.reduce((sum, booking) => {
      if (booking.bookingStatus === "Cancelled") return sum;
      return sum + Number(booking.roomPrice || 0) * Number(booking.guests || 1);
    }, 0);

    const occupancyPercent =
      totalRooms > 0
        ? Math.round((occupiedRooms / (availableRooms + occupiedRooms)) * 100)
        : 0;

    res.json({
      totalUsers,
      totalRooms,
      availableRooms,
      occupiedRooms,
      todaysBookings,
      monthlyBookings,
      revenue,
      occupancyPercent,
      bookingCounts: bookings.reduce((acc, booking) => {
        const status = booking.bookingStatus || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAnalytics };
