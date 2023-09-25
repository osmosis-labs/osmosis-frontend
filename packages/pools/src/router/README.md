# Router

The goal of the router is take the fact that someone wants to trade X for Y, and split this up across pools.

Right now we need to fix a few things:

- This is really slow, and makes the UI feel sluggish
- Its estimating price depth wrong
- Preferred pools is forcing trades that are worse for the user
- If theres an error, its not isolated and may fail to route at all
