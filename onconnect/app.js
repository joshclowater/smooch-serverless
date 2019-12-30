const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

  const { connectionId, domainName, stage } = event.requestContext;
  const type = event.queryStringParameters && event.queryStringParameters.type;
  const logContext = { connectionId, type };

  console.log('onconnect', logContext);

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: domainName + '/' + stage
  });

  if (type === 'host') {

    const name = makeId();
    logContext.name = name;
    await ddb.put({
      TableName: process.env.TABLE_NAME,
      Item: {
        name,
        gameStatus: 'waiting-for-players',
        host: connectionId,
        players: {},
        createdOn: Date.now()
      }
    }).promise();

    await apigwManagementApi.postToConnection({
      ConnectionId: connectionId,
      Data: { type: 'HOST/CONNECTED', gameId: gameName }
    }).promise();

    console.log('Host created game', logContext);

  } else if (type === 'player') {
    await apigwManagementApi.postToConnection({
      ConnectionId: connectionId,
      Data: { type: 'PLAYER/CONNECTED' }
    }).promise();

    console.log('Player connected');
  } else {
    console.warn('Tried to connect with invalid type', type);
    return { statusCode: 400, body: 'Tried to connect with invalid type ' + type };
  }
  return { statusCode: 200, body: 'Connected.' };
};

const makeId = () => {
  let id = '';
  const possible = 'abcdefghijklmnopqrstuvwxyz';
  for (var i = 0; i < 5; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return id;
};
