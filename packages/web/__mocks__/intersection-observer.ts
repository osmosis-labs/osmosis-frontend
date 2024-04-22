function createIntersectionObserverMock() {
  return {
    observe: () => jest.fn(),
    disconnect: () => jest.fn(),
    unobserve: () => jest.fn(),
  };
}

window.IntersectionObserver = jest
  .fn()
  .mockImplementation(createIntersectionObserverMock);

export {};
