
import { osmosis } from '../../src/codegen';

it('toJSON', () => {
    expect(Object.keys(osmosis.gamm.v1beta1.MessageComposer.toJSON)).toMatchSnapshot();
});

it('fromJSON', () => {
    expect(Object.keys(osmosis.gamm.v1beta1.MessageComposer.fromJSON)).toMatchSnapshot();
});

it('encoded', () => {
    expect(Object.keys(osmosis.gamm.v1beta1.MessageComposer.encoded)).toMatchSnapshot();
});
