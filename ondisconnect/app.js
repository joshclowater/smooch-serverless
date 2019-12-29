const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

  const { connectionId } = event.requestContext;
  const logContext = { connectionId };

  console.log('ondisconnect', logContext);

  try {
    await ddb.delete({
      TableName: process.env.TABLE_NAME,
      Key: {
        connectionId: event.requestContext.connectionId
      }
    }).promise();
  } catch (e) {
    console.error('An error occured deleting the connection', { error: e, ...logContext });
    return { statusCode: 500, body: 'Failed to disconnect.' };
  }

  return { statusCode: 200, body: 'Disconnected.' };
};