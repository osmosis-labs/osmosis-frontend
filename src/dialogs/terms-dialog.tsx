import React, { ReactNode, useState } from 'react';
import { wrapBaseDialog } from './base';

export const TermsDialog = wrapBaseDialog(
	({ title, children, onAgree }: { title: string; children?: React.ReactNode; onAgree: () => void }) => {
		const [isChecked, setIsChecked] = useState(false);

		return (
			<div className="max-w-modal">
				<h4 className="text-white-high mb-6 text-lg md:text-2xl">{title}</h4>
				<div className="bg-background rounded-2xl p-5 text-white-mid text-xs md:text-sm mb-6">{children}</div>
				<div className="flex justify-center items-center text-white-high text-sm md:text-base mb-6">
					<input
						className="mr-5 md:mr-1"
						type="checkbox"
						checked={isChecked}
						onChange={() => {
							setIsChecked(value => !value);
						}}
					/>
					<div
						className="cursor-pointer"
						onClick={e => {
							e.preventDefault();

							setIsChecked(value => !value);
						}}>
						I understand the risks and would like to proceed.
					</div>
				</div>
				<div className="w-full flex justify-center">
					<button
						onClick={e => {
							e.preventDefault();

							onAgree();
						}}
						disabled={!isChecked}
						className="bg-primary-200 px-8 md:px-12.5 py-4 text-base md:text-lg text-white-high flex justify-center items-center rounded-lg hover:opacity-75 disabled:opacity-50">
						Proceed
					</button>
				</div>
			</div>
		);
	}
);
