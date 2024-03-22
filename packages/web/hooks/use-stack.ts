import { useCallback, useState } from "react";

interface Actions<T> {
  push: (element: T) => void;
  pop: () => void;
  peek: () => T;
  setStack: React.Dispatch<React.SetStateAction<T[]>>;
}

/**
 * A custom React hook for managing a stack data structure.
 *
 * @param initialStack - An optional initial stack array of type T.
 * @returns A tuple containing the current stack array and an object of actions to manipulate the stack.
 *
 * @example usage:
 * ```typescript
 * const [stack, { push, pop, peek }] = useStack<number>([]);
 *
 * // Push elements onto the stack
 * push(1);
 * push(2);
 *
 * // Peek at the top element of the stack (2)
 * console.log(peek());
 *
 * // Pop the top element off the stack
 * pop();
 *
 * // The stack now contains [1]
 * console.log(stack);
 * ```
 *
 */
export function useStack<T>(initialStack: T[] = []): [T[], Actions<T>] {
  const [stack, setStack] = useState(initialStack);

  const push = useCallback(
    (element: T) => {
      const stackCopy = [...stack];
      stackCopy.push(element);
      setStack(stackCopy);
    },
    [stack]
  );

  const pop = useCallback(() => {
    const stackCopy = [...stack];
    stackCopy.pop();
    setStack(stackCopy);
  }, [stack]);

  const peek = useCallback(() => {
    return stack[stack.length - 1];
  }, [stack]);

  return [stack, { peek, pop, push, setStack }];
}
