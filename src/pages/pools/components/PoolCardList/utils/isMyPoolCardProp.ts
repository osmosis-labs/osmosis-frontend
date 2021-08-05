import { IncentivizedPoolCardProp, MyPoolCardProp } from 'src/pages/pools/models/poolCardProps';
import { Optional } from 'utility-types';

export function isMyPoolCardProp(
	props: IncentivizedPoolCardProp | Optional<MyPoolCardProp, 'myLiquidity'>
): props is MyPoolCardProp {
	return 'myLiquidity' in props && props.myLiquidity != null;
}
