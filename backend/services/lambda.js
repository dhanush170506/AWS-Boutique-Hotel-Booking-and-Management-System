const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const client = new LambdaClient({
  region: process.env.AWS_REGION,
});

async function invokeBookingLambda(payload) {
  const command = new InvokeCommand({
    FunctionName: process.env.LAMBDA_FUNCTION_NAME,
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  return client.send(command);
}

module.exports = {
  invokeBookingLambda,
};
