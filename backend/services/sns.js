const { PublishCommand, SNSClient } = require("@aws-sdk/client-sns");

const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
const TOPIC_ARN =
  process.env.SNS_TOPIC_ARN ||
  "arn:aws:sns:us-east-1:840868617113:HotelBookingNotifications";

const snsClient = new SNSClient({ region: REGION });

function buildBookingConfirmationMessage(booking) {
  return [
    "A new hotel booking has been created.",
    "",
    `Customer Name: ${booking.customerName}`,
    `Customer Email: ${booking.email}`,
    `Room Name: ${booking.roomName || booking.roomType}`,
    `Check-in Date: ${booking.checkInDate}`,
    `Check-out Date: ${booking.checkOutDate}`,
    `Booking ID: ${booking.bookingId}`,
  ].join("\n");
}

async function publishBookingConfirmation(booking) {
  if (!TOPIC_ARN) {
    console.warn("SNS_TOPIC_ARN is not configured. Skipping booking notification.");
    return null;
  }

  return snsClient.send(
    new PublishCommand({
      TopicArn: TOPIC_ARN,
      Subject: "Hotel Booking Confirmation",
      Message: buildBookingConfirmationMessage(booking),
    }),
  );
}

module.exports = { publishBookingConfirmation };
