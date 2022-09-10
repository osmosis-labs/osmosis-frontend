import { join } from 'path';
import telescope from '@osmonauts/telescope';

const protoDirs = [join(__dirname, '/../proto')];
const outPath = join(__dirname, '/../src/codegen');

telescope({
  protoDirs,
  outPath,
  options: {
    prototypes: {
      typingsFormat: {
        duration: 'duration',
        timestamp: 'date',
        useExact: false
      }
    },
    aminoEncoding: {
      enabled: true
    },
    lcdClients: {
      enabled: false
    },
    rpcClients: {
      enabled: true,
      camelCase: true
    }
  }
})
  .then(() => {
    process.stdout.write('✨ all done!\n');
  })
  .catch((e) => {
    process.stdout.write(e + '\n');
    process.exit(1);
  });
