// create a module with dayjs and duration plugin extended

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export { dayjs };
