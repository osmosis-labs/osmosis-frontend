function createIntersectionObserverMock() {
  return {
    observe: () => jest.fn(),
    disconnect: () => jest.fn(),
    unobserve: () => jest.fn(),
  };
}

if (typeof window !== "undefined") {
  window.IntersectionObserver = jest
    .fn()
    .mockImplementation(createIntersectionObserverMock);
}

export {};
