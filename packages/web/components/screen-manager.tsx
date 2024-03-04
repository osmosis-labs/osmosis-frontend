import classNames from "classnames";
import { useCallback, useMemo } from "react";

import { Icon } from "~/components/assets";
import IconButton from "~/components/buttons/icon-button";
import { useControllableState } from "~/hooks/use-controllable-state";
import { useStack } from "~/hooks/use-stack";
import { runIfFn } from "~/utils/function";
import { createContext } from "~/utils/react-context";

export interface ScreenManagerState {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  goBack: () => void;
  canGoBack: boolean;
}

export const [ScreenManagerProvider, useScreenManager] =
  createContext<ScreenManagerState>({
    strict: true,
    name: "ScreenManager",
  });

interface ScreenManagerProps {
  defaultScreen?: string;
  currentScreen?: string;
  children: React.ReactNode | ((arg: ScreenManagerState) => React.ReactNode);
}

/**
 * `ScreenManager` provides a context for managing screens within a React application,
 * facilitating screen transitions, backward navigation, and the ability to check
 * if backward navigation is possible. It leverages a stack to maintain the history of screens,
 * making it particularly useful for workflows such as multi-step forms or navigation-based interfaces.
 *
 * Props:
 * - `defaultScreen` (optional): Specifies the initial screen to be displayed.
 * - `currentScreen` (optional): Controls the current screen. When provided, this prop turns the component into a controlled component.
 * - `children`: Either the content to be rendered or a function that returns content, based on the `ScreenManagerState`.
 *
 * @example
 *
 * ```jsx
 * const App = () => (
 *   <ScreenManager defaultScreen="home">
 *     <Screen screenName="home">
 *       {({ setCurrentScreen }) => (
 *         <>
 *           Home Screen
 *           <button onClick={() => setCurrentScreen("about")}>Go to About</button>
 *         </>
 *       )}
 *     </Screen>
 *     <Screen screenName="about">
 *       {({ goBack }) => (
 *         <>
 *           About Screen
 *           <button onClick={goBack}>Go Back</button>
 *         </>
 *       )}
 *     </Screen>
 *   </ScreenManager>
 * );
 * ```
 *
 * In this example, `ScreenManager` is utilized to manage two screens, "home" and "about",
 * displaying only the content of the active screen and allowing the content to be rendered
 * via a function that receives the `ScreenManagerState`.
 */
export const ScreenManager = ({
  defaultScreen,
  currentScreen: currentScreenProp,
  ...otherProps
}: ScreenManagerProps) => {
  const [history, { push, pop, peek }] = useStack<string>();
  const [currentScreen, setCurrentScreen] = useControllableState({
    defaultValue: defaultScreen,
    value: currentScreenProp,
    onChange: () => {
      push(currentScreen);
    },
  });

  const goBack = useCallback(() => {
    const previousScreen = peek();
    if (previousScreen) {
      setCurrentScreen(previousScreen);
      pop();
    }
  }, [peek, pop, setCurrentScreen]);

  const canGoBack = useMemo(() => history.length > 0, [history.length]);

  const context = useMemo(
    () => ({ currentScreen, setCurrentScreen, goBack, canGoBack }),
    [canGoBack, currentScreen, goBack, setCurrentScreen]
  );

  return (
    <ScreenManagerProvider value={context} {...otherProps}>
      {runIfFn(otherProps.children, context)}
    </ScreenManagerProvider>
  );
};

interface ScreenProps {
  screenName: string;
  children: React.ReactNode | ((arg: ScreenManagerState) => React.ReactNode);
}

/**
 * `Screen` is a component that works in conjunction with `ScreenManager` to conditionally
 * render its children based on the current active screen within a React application.
 * It accepts a `screenName` prop, which it compares against the current screen managed by
 * `ScreenManager`, and only renders its children if the names match.
 *
 * Props:
 * - `screenName`: A string that identifies the screen. This name is used to determine if the `Screen` should render its children.
 * - `children`: The content to be rendered when this `Screen` is active, or a function that returns content and receives the `ScreenManagerState` as an argument.
 */
export const Screen = ({ children, screenName }: ScreenProps) => {
  const screenManagerContext = useScreenManager();

  return (
    <>
      {screenName === screenManagerContext.currentScreen
        ? runIfFn(children, screenManagerContext)
        : null}
    </>
  );
};

interface ScreenGoBackButtonProps {
  className?: string;
  onClick?: () => void;
}

export const ScreenGoBackButton = ({
  className,
  onClick: onClickProp,
}: ScreenGoBackButtonProps) => {
  const { goBack, canGoBack } = useScreenManager();

  if (!canGoBack) return null;

  return (
    <IconButton
      onClick={() => {
        onClickProp?.();
        goBack();
      }}
      className={classNames(
        "w-fit text-osmoverse-400 hover:text-osmoverse-100",
        className
      )}
      icon={<Icon id="chevron-left" width={16} height={16} />}
      aria-label="Go Back"
      mode="unstyled"
    />
  );
};
