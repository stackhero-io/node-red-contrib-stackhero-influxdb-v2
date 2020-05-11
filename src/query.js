module.exports = (RED) => {
  'use strict';

  function InfluxDbV2NodeQuery(config) {
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

    this.on('input', async msg => {
      if (!msg.topic) {
        this.error('msg.topic should be a string containing the Flux query.');
        return;
      }


      clearTimeout(this.stateTimeout);
      try {
        this.setState('doing');
        const result = await this.serverConfig
          .query(msg.topic);
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
  RED.nodes.registerType('Stackhero-InfluxDB-v2-query', InfluxDbV2NodeQuery);
};
