module.exports = (RED) => {
  'use strict';

  const Influxdb = require('influxdb-v2');

  function InfluxDbV2Node(config) {
    RED.nodes.createNode(this, config);

    this.connection = async () => {
      this.influxdb = new Influxdb({
        host: config.host,
        port: config.port,
        protocol: config.tls ? 'https' : 'http',
        token: this.credentials.token
      });
    };

    this.query = async query => {
      await this.connection();
      return await this.influxdb.query(
        { org: this.credentials.organization },
        { query }
      );
    };

    this.write = async ({ bucket = this.credentials.bucket, precision = 'ns', data }) => {
      await this.connection();
      return await this.influxdb.write(
        {
          org: this.credentials.organization,
          bucket,
          precision
        },
        data
      );
    };

    this.on('close', async done => {
      if (this.stateTimeout) {
        clearTimeout(this.stateTimeout);
      }
      done();
    });
  }
  RED.nodes.registerType(
    'Stackhero-InfluxDB-v2-Server',
    InfluxDbV2Node,
    {
      credentials: {
        token: { type: 'text' },
        organization: { type: 'text' },
        bucket: { type: 'text' }
      }
    }
  );
};
