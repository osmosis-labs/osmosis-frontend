import { Buffer } from 'buffer';
import { Hash } from '@keplr-wallet/crypto';

// TODO: IBC minimal denom을 만들어주는 api를 케플러 패키지에 넣는 것도 좋을듯...
export function makeIBCMinimalDenom(sourceChannelId: string, coinMinimalDenom: string): string {
	return (
		'ibc/' +
		Buffer.from(Hash.sha256(Buffer.from(`transfer/${sourceChannelId}/${coinMinimalDenom}`)))
			.toString('hex')
			.toUpperCase()
	);
}
