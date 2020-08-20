const { AuthenticationError, PubSub } = require('apollo-server');
const Pin = require('./models/Pin');
const _ = require('lodash');

const authenticated = (next) => async (root, args, ctx, info) => {
	const isLoggedIn = await ctx.currenttUser;
	console.log(isLoggedIn)
	if (!isLoggedIn) {
		throw new AuthenticationError('You must be logged');
	}
	return next(root, args, ctx, info);
};

const pubSub = new PubSub();

const PIN_ADDED = 'PIN_ADDED';
const PIN_UPDATED = 'PIN_UPDATED';
const PIN_DELETED = 'PIN_DELETED';

module.exports = {
	Comment: {
		author: async (parent, _, ctx) => {
			return await ctx.loaders.userLoader.load(parent.author._id.toString());
		}
	},
	Pin: {
		author: async (parent, _, ctx) => {
			return await ctx.loaders.userLoader.load(parent.author._id.toString());
		}
	},
	Query: {
		me: authenticated((root, args, ctx) => ctx.currenttUser),
		getPins: async (root, args, ctx, info) => {
			const pins = await Pin.find({});
			return pins;
		}
	},
	Mutation: {
		createPin: authenticated(async (root, args, ctx) => {
			const newPin = await new Pin({
				...args.input,
				author: await ctx.currenttUser._id
			}).save();
			const pinAdded = await Pin.populate(newPin, 'author');
			pubSub.publish(PIN_ADDED, { pinAdded });
			return pinAdded;
		}),

		deletePin: authenticated(async (root, args, ctx) => {
			const pinDeleted = await Pin.findOneAndDelete({ _id: args.pinId }).exec();
			pubSub.publish(PIN_DELETED, { pinDeleted });
			return pinDeleted;
		}),

		createComment: authenticated(async (root, args, ctx) => {
			console.log(ctx.currenttUser)
			const newComment = { text: args.text, author: await ctx.currenttUser._id };
			const pinUpdated = await Pin.findOneAndUpdate(
				{ _id: args.pinId },
				{ $push: { comments: newComment } },
				{ new: true }
			);
			pubSub.publish(PIN_UPDATED, { pinUpdated });
			return pinUpdated;
		})
	},
	Subscription: {
		pinAdded: {
			subscribe: () => pubSub.asyncIterator(PIN_ADDED)
		},
		pinUpdated: {
			subscribe: () => pubSub.asyncIterator(PIN_UPDATED)
		},
		pinDeleted: {
			subscribe: () => pubSub.asyncIterator(PIN_DELETED)
		}
	}
};
