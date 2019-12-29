const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

  const { connectionId } = event.requestContext;
  const type = event.queryStringParameters && event.queryStringParameters.type;
  const logContext = { connectionId, type };

  console.log('onconnect', logContext);

  try {
    await ddb.put({
      TableName: process.env.TABLE_NAME,
      Item: {
        connectionId
      }
    }).promise();
  } catch (e) {
    console.error('An error occured saving the connection', { error: e, ...logContext });
    return { statusCode: 500, body: 'Failed to connect.' };
  }

  return { statusCode: 200, body: 'Connected.' };
};
