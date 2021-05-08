import { computed, makeAutoObservable, observable } from 'mobx';
import { TModal } from '../../interfaces';

export class LayoutStore {
	@observable
	private _currentModal: TModal;

	constructor() {
		this._currentModal = TModal.MANAGE_LIQUIDITY;
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
