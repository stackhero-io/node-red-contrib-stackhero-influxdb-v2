module.exports = (RED) => {
  'use strict';

  function InfluxDbV2NodeWrite(config) {
    RED.nodes.createNode(this, config);
    this.serverConfig = RED.nodes.getNode(config.server);

    if (!this.serverConfig) {
      this.error('InfluxDB database not configured');
      return;
    }

    this.setState = (code, info) => {
      if (code === 'doing') {
        this.status({ fill: 'grey', shape: 'ring', text: 'doing...' });
      }
      else if (code === 'error') {
        this.status({ fill: 'red', shape: 'ring', text: info });
      }
      else if (code === 'done') {
        this.status({ fill: 'blue', shape: 'dot', text: 'done' });
      }
      else {
        this.status({});
      }
    };

    this.serverConfig.on('stateWrite', (code, info) => this.setState(code, info));

    this.on('input', async msg => {
      if (!msg.payload) {
        this.error('msg.payload should be an object containing the data argument, as an object or an array.');
        return;
      }

      if (!Array.isArray(msg.payload.data)) {
        msg.payload.data = [ msg.payload.data ];
      }

      clearTimeout(this.stateTimeout);
      try {
        this.setState('doing');
        const { bucket, precision, data } = msg.payload;
        const result = await this.serverConfig
          .write({ bucket, precision, data });
        msg.payload = result;
        this.send(msg);

        this.setState('done');
        this.stateTimeout = setTimeout(
          () => this.setState(),
          2 * 1000
        );
      }
      catch (error) {
        this.error(error, msg);
        this.setState('error', error.toString());
      }
    });

    this.on('close', async () => {
      clearTimeout(this.stateTimeout);
      this.serverConfig.removeAllListeners();
      this.setState();
    });
  }
  RED.nodes.registerType('Stackhero-InfluxDB-v2-write', InfluxDbV2NodeWrite);
};
