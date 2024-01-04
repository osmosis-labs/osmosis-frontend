// describe("getPoolsFromNode (mainnet)", () => {
//   it("works with caching", async () => {
//     const start1 = Date.now();
//     const pools1 = await getPoolsFromNode();
//     const end1 = Date.now();
//     const duration1 = end1 - start1;

//     const start2 = Date.now();
//     const pools2 = await getPoolsFromNode();
//     const end2 = Date.now();
//     const duration2 = end2 - start2;

//     console.log(`First call to getPoolsFromNode took ${duration1} ms`);
//     console.log(`Second call to getPoolsFromNode took ${duration2} ms`);

//     expect(pools1).toBeTruthy();
//     expect(pools2).toBeTruthy();
//   });
// });
