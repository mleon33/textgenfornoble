const { Client } = require('pg');

class DB {
	async DoQuery(stackId, sqlcmd) {
		console.log(`Received: stack=${stackId}, sqlcmd=${sqlcmd}`);
		
		const hostByStack = [			
			{
				id: 0,
				user: 'postgres',
				host: 'localhost',
				database: 'task',
				password: 'namaste',
				port: '5432'				 
			},
			{
				id: 1,
				user: 'tziconfig',
				host: 'secnblhost01001.intergies.co',
				database: 'task',
				password: '*8f!5Jb$W78R92zM',
				port: '5432'				 
			},
			{
				id: 2,
				user: 'tziconfig',
				host: 'secnblhost02001.intergies.co',
				database: 'task',
				password: '*8f!5Jb$W78R92zM',
				port: '5432'				 
			},
			{
				id: 3,
				user: 'tziconfig',
				host: 'secnblhost03001.intergies.co',
				database: 'task',
				password: '*8f!5Jb$W78R92zM',
				port: '5432'				 
			},
			{
				id: 4,
				user: 'tziconfig',
				host: 'secnblhost04001.intergies.co',
				database: 'task',
				password: '*8f!5Jb$W78R92zM',
				port: '5432'				 
			}	
		]

		console.log(hostByStack);
		
		console.log(`----Connected to Stack: ${stackId} / IP address: ${hostByStack[stackId].host}`);

		const client = new Client({
			user: hostByStack[stackId].user,
			host: hostByStack[stackId].host,
			database: hostByStack[stackId].database,
			password: hostByStack[stackId].password,
			port: hostByStack[stackId].port,
			ssl: {
				rejectUnauthorized : false
			}
		  });

		client.connect();

		const result = await client.query({
			rowMode: 'array',
			text: sqlcmd,
		  });
		  await client.end();

		  return result;
	}
}

module.exports.DB = DB;
