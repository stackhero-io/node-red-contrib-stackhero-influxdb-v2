# node-red-contrib-stackhero-influxdb-v2

[Node-RED](https://nodered.org) node to read and write to an InfluxDB v2 database.

**Remember: if you like it, please star it! 🥰**

Official repository: [https://github.com/stackhero-io/node-red-contrib-stackhero-influxdb-v2](https://github.com/stackhero-io/node-red-contrib-stackhero-influxdb-v2)


## Sponsors

`node-red-contrib-stackhero-influxdb-v2` is developed by [Stackhero](https://www.stackhero.io/).
If you are looking for powerful managed services, like InfluxDB, you should seriously consider Stackhero 🤓


## Usage

We have 2 nodes here. A `write` node, to send data to InfluxDB and a `query` node, to retrieve data using the Flux language.


### Write data

The write node requires a payload object like this one:
```javascript
msg.payload = {
  // You bucket
  // Optional (it can be defined in the node credentials settings)
  bucket: 'myBucket',

  // Precision of timestamp
  // Optional
  // Can be `ns` (nanoseconds),
  //        `us` (microseconds),
  //        `ms` (milliseconds),
  //        `s` (seconds).
  // The default is `ns`
  // Note: if you set the `timestamp` field to `Date.now()`, you have to set the `precision` to `ms`
  precision: 'ms',

  // Data to send to InfluxDB
  // Can be an array of objects or only one object
  data: [
    {
      measurement: 'machinerySensor',

      tags: {
        deviceId: 'gyh43',
        hardwareVersion: '1.0.2',
        softwareVersion: '2.5.1',
        location: 'factory-1'
      },

      fields: {
        temperature: 12,
        humidity: 46,
        vibrations: 18,
        batteryVoltage: 3.6
      },

      timestamp: Date.now()
    },

    // More data can be send here, simply re add an object
    // { ... },
  ]
};

return msg;
```

![Example of the write node](https://raw.githubusercontent.com/stackhero-io/node-red-contrib-stackhero-influxdb-v2/master/assets/screenshotWrite.png)


### Query data

The query node requires a topic string containing a Flux query.
```javascript
msg.topic = 'from(bucket: "myBucket") |> range(start: -1h)';
return msg;
```

You can write multiple lines queries like this:
```javascript
msg.topic = [
  'from(bucket: "myBucket")',
  '  |> range(start: -1d, stop: now)',
  '  |> filter(fn: (r) => r._measurement == "machinerySensor")',
  '  |> filter(fn: (r) => r._field == "vibrations")',
  '  |> aggregateWindow(every: 1h, fn: mean)',
  '  |> yield(name: "mean")',

  'from(bucket: "myBucket")',
  '  |> range(start: -1d, stop: now)',
  '  |> filter(fn: (r) => r._measurement == "machinerySensor")',
  '  |> filter(fn: (r) => r._field == "vibrations")',
  '  |> aggregateWindow(every: 1h, fn: max)',
  '  |> yield(name: "max")',
].join('\n');

return msg;
```

![Example of the query node](https://raw.githubusercontent.com/stackhero-io/node-red-contrib-stackhero-influxdb-v2/master/assets/screenshotQuery.png)

