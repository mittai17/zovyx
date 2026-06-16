const path = require('path');
const rn_bridge = require('rn-bridge');

// This script acts as the entry point for the Zuvix Local Gateway on Mobile (Android/iOS)
// It will be executed natively in the background by nodejs-mobile-react-native.

rn_bridge.channel.on('message', (msg) => {
  if (msg === 'start_zuvix') {
    try {
      // In production, the built zuvix-agent bundles will be mapped here
      // For now, we simulate starting the local Zuvix gateway on localhost
      rn_bridge.channel.send("Zuvix Gateway Localhost Initialization Started...");
      
      // Simulate Express/Hono server start
      setTimeout(() => {
        rn_bridge.channel.send("Zuvix Gateway running locally at http://127.0.0.1:3000");
      }, 1000);

    } catch (e) {
      rn_bridge.channel.send(`Error starting Zuvix: ${e.message}`);
    }
  }
});

// Inform the RN side that the node process has started
rn_bridge.channel.send("NodeJS Runtime Initialized. Waiting for start_zuvix signal...");
