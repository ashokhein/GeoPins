import React, { useState, useEffect, useContext } from 'react';
import ReactMapGL, { NavigationControl, Marker, Popup } from 'react-map-gl';
import { withStyles } from '@material-ui/core/styles';
import PinIcon from './PinIcon';
import Context from './../context';
import Blog from './Blog';
import { useClient } from './../client';
import { GET_PINS_QUERY } from './../graphql/queries';
import { DELETE_PIN_MUTATION } from './../graphql/mutations';
import differenceInMinutes from 'date-fns/difference_in_minutes';
import { unstable_useMediaQuery as useMediaQuery  } from "@material-ui/core/useMediaQuery";
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/DeleteTwoTone';

import { PIN_ADDED_SUBSCRIPTION, PIN_UPDATED_SUBSCRIPTION, PIN_DELETED_SUBSCRIPTION } from './../graphql/subscriptions';

import { Subscription } from 'react-apollo';

const INITIAL_VIEWPORT = {
	latitude: 51.5584,
	longtitude: -1.786,
	zoom: 13
};

const Map = ({ classes }) => {
	const { state, dispatch } = useContext(Context);
	const [ viewPort, setViewport ] = useState(INITIAL_VIEWPORT);
	const [ userPosition, setUserPosition ] = useState(null);
	const client = useClient();
	const [ popup, setPopup ] = useState(null);

	const mobileSize = useMediaQuery("(max-width: 650px)")

	useEffect(() => {
		getUserPosition();
	}, []);

	useEffect(() => {
		getPins();
	}, []);

	useEffect(() =>{
		const pinExist = popup && state.pins.findIndex(pin => pin._id === popup._id ) > -1 
		if(!pinExist) {
			setPopup(null)
		}
	},[state.pins.length])

	const getPins = async () => {
		const { getPins } = await client.request(GET_PINS_QUERY);
		dispatch({ type: 'GET_PINS', payload: getPins });
	};

	const getUserPosition = () => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition((position) => {
				const { latitude, longitude } = position.coords;
				setViewport({ ...viewPort, latitude, longitude });
				setUserPosition({ latitude, longitude });
			});
		}
	};

	const handleMapClick = ({ lngLat, leftButton }) => {
		const [ longitude, latitude ] = lngLat;
		if (!leftButton) return;
		if (!state.draftPin) dispatch({ type: 'CREATE_DRAFT',payload: { longitude, latitude }});
		dispatch({
			type: 'UPDATE_DRAFT_LOCATION',
			payload: {
				longitude,
				latitude
			}
		});
	};

	const highlightNewPin = (pin) => {
		const isNewPin = differenceInMinutes(Date.now(), Number(pin.createdAt)) <= 15;
		return isNewPin ? 'limegreen' : 'darkblue';
	};

	const handleSelectPin = (pin) => {
		setPopup(pin);
		dispatch({ type: 'SET_PIN', payload: pin });
	};

	const isAuthUser = () => state.currentUser._id === popup.author._id;

	const handleDeletePin = async (pin) => {
		await client.request(DELETE_PIN_MUTATION, { pinId: pin._id });
		// dispatch({ type: 'DELETED_PIN', payload: deletePin });
		setPopup(null);
	};

	return (
		<div className={mobileSize ? classes.rootMobile : classes.root	 }>
			<ReactMapGL
				mapboxApiAccessToken="pk.eyJ1IjoiYXNob2toZWluIiwiYSI6ImNrYzgwdTFtODE2bm4zMWxtdGNkcTNmNXgifQ.bsASvfhlySVjiVohK53glg"
				width="100vw"
				height="calc(100vh - 64px)"
				mapStyle="mapbox://styles/mapbox/streets-v9"
				{...viewPort}
				onViewStateChange={(newViewPort) => {setViewport({...newViewPort.viewState, width: "100vw"})}}
				onClick={handleMapClick}
				scrollZoom={!mobileSize}
				doubleClickZoom={true}
			>
				<div className={classes.navigationControl}>
					<NavigationControl onViewStateChange={(newViewPort) => {setViewport({...newViewPort.viewState, width: "100vw"})}} />
				</div>

				{userPosition && (
					<Marker
						latitude={userPosition.latitude}
						longitude={userPosition.longitude}
						offsetLeft={-19}
						offsetTop={-37}
					>
						<PinIcon size={40} color="red" />
					</Marker>
				)}

				{state.draftPin && (
					<Marker
						latitude={state.draftPin.latitude}
						longitude={state.draftPin.longitude}
						offsetLeft={-19}
						offsetTop={-37}
					>
						<PinIcon size={40} color="hotpink" />
					</Marker>
				)}

				{state.pins.map((pin) => (
					<Marker
						key={pin._id}
						latitude={pin.latitude}
						longitude={pin.longitude}
						offsetLeft={-19}
						offsetTop={-37}
					>
						<PinIcon size={40} color={highlightNewPin(pin)} onClick={() => handleSelectPin(pin)} />
					</Marker>
				))}

				{popup && (
					<Popup
						anchor="top"
						latitude={popup.latitude}
						longitude={popup.longitude}
						closeOnClick={false}
						onClose={() => setPopup(null)}
					>
						<img src={popup.image} alt={popup.title} className={classes.popupImage} />
						<div className={classes.popupTab}>
							<Typography>
								{popup.latitude.toFixed(6)},{popup.longitude.toFixed(6)}
							</Typography>
							{isAuthUser() && (
								<Button onClick={() => handleDeletePin(popup)}>
									<DeleteIcon className={classes.deleteIcon} />
								</Button>
							)}
						</div>
					</Popup>
				)}
			</ReactMapGL>

			{/* Subscription for Adding / Updating / Removing pins */}

			<Subscription
				subscription={PIN_ADDED_SUBSCRIPTION}
				onSubscriptionData={({ subscriptionData }) => {
					const { pinAdded } = subscriptionData.data;
					dispatch({ type: 'CREATE_PIN', payload: pinAdded });
				}}
			/>

			<Subscription
				subscription={PIN_DELETED_SUBSCRIPTION}
				onSubscriptionData={({ subscriptionData }) => {
					const { pinDeleted } = subscriptionData.data;
					dispatch({ type: 'DELETE_PIN', payload: pinDeleted });
				}}
			/>

			<Subscription
				subscription={PIN_UPDATED_SUBSCRIPTION}
				onSubscriptionData={({ subscriptionData }) => {
					const { pinUpdated } = subscriptionData.data;
					dispatch({ type: 'CREATE_COMMENT', payload: pinUpdated });
				}}
			/>
			<Blog />
		</div>
	);
};

const styles = {
	root: {
		display: 'flex'
	},
	rootMobile: {
		display: 'flex',
		flexDirection: 'column-reverse'

	},
	navigationControl: {
		position: 'absolute',
		top: 0,
		left: 0,
		margin: '1em'
	},
	deleteIcon: {
		color: 'red'
	},
	popupImage: {
		padding: '0.4em',
		height: 200,
		width: 200,
		objectFit: 'cover'
	},
	popupTab: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column'
	}
};

export default withStyles(styles)(Map);
