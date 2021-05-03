import { computed, makeAutoObservable, observable } from 'mobx';
import { TModal } from '../../interfaces';

export class LayoutStore {
	@observable
	private _currentModal: TModal;

	constructor() {
		// TODO : change to INIT
		this._currentModal = TModal.NEW_POOL;
		makeAutoObservable(this);
	}

	@computed
	get currentModal(): TModal {
		return this._currentModal;
	}

	public updateCurrentModal(newModal: TModal) {
		this._currentModal = newModal;
	}
}
