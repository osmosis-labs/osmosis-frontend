import React, { FunctionComponent } from 'react';
import { displayToast, DisplayToast } from './toast';

export const ToastContext = React.createContext<DisplayToast | null>(null);

export const ToastProvider: FunctionComponent = ({ children }) => {
	return (
		<ToastContext.Provider
			value={{
				displayToast,
			}}>
			{children}
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const context = React.useContext(ToastContext);
	if (!context) {
		throw new Error('You have forgot to use ToastProvider');
	}
	return context;
};
