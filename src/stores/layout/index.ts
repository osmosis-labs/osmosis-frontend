import { computed, makeObservable, observable } from 'mobx';

export class LayoutStore {
	@observable
	private _currentModal = '';

	constructor() {
		makeObservable(this);
	}

	@computed
	get currentModal(): string {
		return this._currentModal;
	}
}
