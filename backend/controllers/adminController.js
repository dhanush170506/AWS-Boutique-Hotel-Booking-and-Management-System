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

function toMonthKey(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 7);
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-");
  const monthIndex = Number(month) - 1;
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[monthIndex] || month} ${year}`;
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
      const dateKey = toDateKey(booking.createdAt || booking.checkInDate);
      return dateKey?.startsWith(thisMonthKey);
    }).length;

    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(
      (booking) => booking.bookingStatus !== "Cancelled",
    ).length;
    const cancelledBookings = bookings.filter(
      (booking) => booking.bookingStatus === "Cancelled",
    ).length;

    const revenue = bookings.reduce((sum, booking) => {
      if (booking.bookingStatus === "Cancelled") return sum;
      return sum + Number(booking.roomPrice || 0) * Number(booking.guests || 1);
    }, 0);

    const averageRevenuePerBooking =
      totalBookings > 0 ? revenue / totalBookings : 0;

    const occupancyPercent =
      availableRooms + occupiedRooms > 0
        ? Math.round((occupiedRooms / (availableRooms + occupiedRooms)) * 100)
        : 0;

    const monthlyBookingsSeries = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      const monthKey = date.toISOString().slice(0, 7);
      const label = formatMonthLabel(monthKey);
      const count = bookings.filter((booking) => {
        const bookingMonth = toMonthKey(
          booking.createdAt || booking.checkInDate,
        );
        return bookingMonth === monthKey;
      }).length;
      return { month: label, bookings: count };
    });

    const monthlyRevenueSeries = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      const monthKey = date.toISOString().slice(0, 7);
      const label = formatMonthLabel(monthKey);
      const monthRevenue = bookings.reduce((sum, booking) => {
        if (booking.bookingStatus === "Cancelled") return sum;
        const bookingMonth = toMonthKey(
          booking.createdAt || booking.checkInDate,
        );
        if (bookingMonth !== monthKey) return sum;
        return (
          sum + Number(booking.roomPrice || 0) * Number(booking.guests || 1)
        );
      }, 0);
      return { month: label, revenue: monthRevenue };
    });

    const occupancyData = [
      { name: "Occupied", value: occupiedRooms },
      { name: "Available", value: availableRooms },
    ];

    const roomTypeDistribution = Object.entries(
      rooms.reduce((acc, room) => {
        const roomType = room.roomType || room.type || "Unspecified";
        acc[roomType] = (acc[roomType] || 0) + 1;
        return acc;
      }, {}),
    ).map(([name, value]) => ({ name, value }));

    res.json({
      totalUsers,
      totalRooms,
      availableRooms,
      occupiedRooms,
      todaysBookings,
      monthlyBookings,
      totalBookings,
      activeBookings,
      cancelledBookings,
      revenue,
      averageRevenuePerBooking,
      occupancyPercent,
      monthlyBookingsSeries,
      monthlyRevenueSeries,
      occupancyData,
      roomTypeDistribution,
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
