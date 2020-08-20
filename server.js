const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const userLoader = require('./dataloader');
const { MemcachedCache } = require('apollo-server-cache-memcached');

require('dotenv').config();

const { findOrCreateUser } = require('./controllers/UserController');
mongoose.set('debug', true);
mongoose.set('useFindAndModify', false);
mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => console.log('DB Connectd'))
	.catch((e) => console.log(e));

const authContext = (connection, req) => {
	let authToken = null;
	let currenttUser = null;
	if (connection) {
		connection.connect;
	} else {
		try {
			authToken = req.headers.authorization;
			if (authToken) {
				{
					/* find a user or create a user */
					currenttUser = findOrCreateUser(authToken);
				}
			}
		} catch (err) {
			console.error(`Unable to authenticate user with token ${authToken}`, err);
		}
		return { currenttUser };
	}
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
	onHealthCheck: () => {
		return new Promise((resolve, reject) => {
			// Replace the `true` in this conditional with more specific checks!
			if (false) {
				resolve();
			} else {
				reject();
			}
		});
	},
	context: async ({ req, connection }) => ({
		...authContext(connection, req),
		loaders: { userLoader }
	}),
	cors: {
		credentials: true,
		origin: (origin, callback) => {
			const whitelist = [
				'http://localhost:3000',
				'https://geopins.ashokhein.me',
				'https://geopins-62q92papc.vercel.app'
			];

			if (whitelist.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		}
	}
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
	console.log(`Server is listening on ${url}`);
});
