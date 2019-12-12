import { useEffect, useState, useCallback } from "react";
import { Observable, Subscription } from "rxjs";
import { userQuery } from "../state/user/user.query";
import * as firebase from "firebase/app";
import "firebase/auth";
import { userService } from "../state/user/user.service";
import { User } from "../state/user/user.model";

interface UserState {
	user: User | null;
	isLoginShown: boolean;
	isLoginConfirmShown: boolean;
}

function onEmit<T>(
	source$: Observable<T>,
	nextFn: (value: T) => void
): Subscription {
	return source$.subscribe(nextFn, console.error);
}

function redirectHome() {
	window.history.pushState({}, "", "/");
}

/**
 * View Model for User view components
 */
export function useUserFacade(): [
	UserState,
	(email: string) => Promise<void>,
	Function,
	<T extends (...args: any[]) => any>(
		func: T
	) => (...funcArgs: Parameters<T>) => ReturnType<T> | void,
	(showLogin: boolean) => void,
	(showLoginConfirm: boolean) => void,
	(email: string) => Promise<void>
] {
	const [state, setState] = useState<UserState>({
		user: null,
		isLoginShown: false,
		isLoginConfirmShown: false
	});
	const login = async (email: string) => {
		const actionCodeSettings = {
			url: "https://movie-night.club",
			handleCodeInApp: true
		};
		if (email && email.length > 0) {
			await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
			window.localStorage.setItem("emailForSignIn", email);
		}
	};
	const loginConfirm = async (email: string) => {
		try {
			await firebase
				.auth()
				.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
			// The client SDK will parse the code from the link for you.
			const result = await firebase
				.auth()
				.signInWithEmailLink(email, window.location.href);
			// Clear email from storage.
			window.localStorage.removeItem("emailForSignIn");
			// You can access the new user via result.user
			// Additional user info profile not available via:
			// result.additionalUserInfo.profile == null
			// You can check if the user is new or existing:
			// result.additionalUserInfo.isNewUser
			if (result.user) {
				window.localStorage.setItem("uid", result.user.uid);
				userService.setUser({
					uid: result.user.uid
				});
			}
		} catch (error) {
			// Some error occurred, you can inspect the code: error.code
			// Common errors could be invalid email and invalid or expired OTPs.
			console.error(error);
		}
	};
	const logout = () => {
		window.localStorage.removeItem("emailForSignIn");
		window.localStorage.removeItem("uid");
		userService.setUser(null);
		redirectHome();
	};
	const showLogin = (show: boolean) => {
		return userService.showLogin(show);
	};
	const showLoginConfirm = (show: boolean) => {
		return userService.showLoginConfirm(show);
	};

	// Wrap a login-privileged function.
	// This will redirect to login if not logged in, otherwise it will call the function.
	function wrapLogin<T extends (...args: any[]) => any>(
		func: T
	): (...funcArgs: Parameters<T>) => ReturnType<T> | void {
		return (...args: Parameters<T>): ReturnType<T> | void => {
			if (state.user) {
				return func(...args);
			}
			return userService.showLogin(true);
		};
	}

	/**
	 * Manage subscriptions with auto-cleanup
	 */
	useEffect(() => {
		const subscriptions = [
			onEmit<User | null>(userQuery.user$, user =>
				setState(state => ({ ...state, user }))
			),
			onEmit<boolean>(userQuery.showLogin$, isLoginShown =>
				setState(state => ({ ...state, isLoginShown }))
			),
			onEmit<boolean>(userQuery.showLoginConfirm$, isLoginConfirmShown =>
				setState(state => ({ ...state, isLoginConfirmShown }))
			)
		];
		return () =>
			subscriptions.forEach(subscription => subscription.unsubscribe());
	}, []);

	return [
		state,
		login,
		logout,
		wrapLogin,
		showLogin,
		showLoginConfirm,
		loginConfirm
	];
}

export function useUserSetup() {
	const [, , , , , showLoginConfirm, loginConfirm] = useUserFacade();

	useEffect(() => {
		userService.setUser({
			uid: "whatever-faker"
		});
		if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
			// Additional state parameters can also be passed via URL.
			// This can be used to continue the user's intended action before triggering
			// the sign-in operation.
			// Get the email if available. This should be available if the user completes
			// the flow on the same device where they started it.
			const email = window.localStorage.getItem("emailForSignIn");
			if (email) {
				loginConfirm(email);
			} else {
				// User opened the link on a different device. To prevent session fixation
				// attacks, ask the user to provide the associated email again. For example:
				showLoginConfirm(true);
			}
		}
	}, []);
}
