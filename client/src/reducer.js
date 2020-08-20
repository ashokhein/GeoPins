export default function reducer(state, { type, payload }) {
	switch (type) {
		case 'LOGIN_USER':
			return {
				...state,
				currentUser: payload
			};
		case 'IS_LOGGED_IN':
			return {
				...state,
				isAuth: payload
			};
		case 'LOGOUT':
			return {
				...state,
				currentUser: null,
				isAuth: false
			};
		case 'CREATE_DRAFT':
			return {
				...state,
				draftPin: payload,
				currentPin: null
			};
		case 'UPDATE_DRAFT_LOCATION':
			return {
				...state,
				draftPin: payload
			};
		case 'DELETE_DRAFT_LOCATION':
			return {
				...state,
				draftPin: null
			};
		case 'GET_PINS': {
			return {
				...state,
				pins: payload
			};
		}
		case 'CREATE_PIN': {
			const newPin = payload;
			const previousPin = state.pins.filter((pin) => pin._id !== newPin._id);
			return {
				...state,
				pins: [ ...previousPin, newPin ]
			};
		}
		case 'DELETE_PIN': {
			const deletePin = payload;
			const previousPin = state.pins.filter((pin) => pin._id !== deletePin._id);
			if (state.currentPin) {
				if (state.currentPin._id === deletePin._id) {
					return {
						...state,
						pins: previousPin,
						currentPin: null
					};
				}
			}
			return {
				...state,
				pins: previousPin
			};
		}
		case 'SET_PIN': {
			return {
				...state,
				currentPin: payload,
				draftPin: null
			};
		}
		case 'CREATE_COMMENT': {
			const updatedCurrentPin = payload;
			const updatedPins = state.pins.map((pin) => (pin._id === updatedCurrentPin._id ? updatedCurrentPin : pin));
			if (state.currentPin) {
				if (state.currentPin._id === updatedCurrentPin._id) {
					return {
						...state,
						pins: updatedPins,
						currentPin: updatedCurrentPin
					};
				}
			}
			return {
				...state,
				pins: updatedPins
			};
		}
		default:
			return state;
	}
}
