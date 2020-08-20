import React, { useContext } from 'react';
import { GoogleLogin } from 'react-google-login';
import { GraphQLClient } from 'graphql-request';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { BASE_URL } from './../../client'
import Context from './../../context';
import { ME_QUERY } from './../../graphql/queries';
import Captcha from './Captcha';

const Login = ({ classes }) => {
	const { dispatch } = useContext(Context);
	const onSuccess = async (googleuser) => {
		try {
			const idToken = googleuser.getAuthResponse().id_token;
			const client = new GraphQLClient(BASE_URL, {
				headers: { authorization: idToken }
			});
			const { me } = await client.request(ME_QUERY);
			dispatch({ type: 'LOGIN_USER', payload: me });
			dispatch({ type: 'IS_LOGGED_IN', payload: googleuser.isSignedIn() });
		} catch (err) {
			onFailure(err);
		}
	};

	const onFailure = (err) => {
		console.error(err)
		dispatch({ type: 'IS_LOGGED_IN', payload: false });
	};

	return (
		<div className={classes.root}>
			<Typography component="h1" variant="h3" gutterBottom noWrap style={{ color: 'rgb(66,133,244)' }}>
				Welcome
			</Typography>
			<GoogleLogin
				clientId="939029934612-6udt591hgrnpcq7rr7inhikhi7k7v14a.apps.googleusercontent.com"
				onSuccess={onSuccess}
				onFailure={onFailure}
				isSignedIn={true}
				theme="dark"
				buttonText="Login with Google"
			/>
			<Captcha /> 
		</div>
	);
};

const styles = {
	root: {
		height: '100vh',
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'column',
		alignItems: 'center'
	}
};

export default withStyles(styles)(Login);
