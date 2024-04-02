// create a module with dayjs and duration plugin extended

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

// eslint-disable-next-line import/no-default-export
export default dayjs;
