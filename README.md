<!-- <div align="center">
  <img style="width: 70%" src="./assets/anpan-logo.png" alt="anpan logo">
</div> -->

![anpan logo](https://raw.githubusercontent.com/oslabs-beta/anpan/dev/assets/anpan-logo.png 'anpan logo')

<h1 align="center">anpan</h1>

<div align="center">A Redis OM for Bun</div>
<br>
<div align="center"><a href="">Visit our Website</a></div>
<br>
<div align="center"><a href="">Read our Medium Launch Article</a></div>
<br>

## Table of Contents

1. [Description](#description)
2. [Getting Started](#get-started)
3. any key points or link to the wiki
4. [Authors](#authors)
5. [License](#license)

## <a name='description'></a> Description

<strong>anpan</strong> is a lightweight Redis Object Mapper (OM) library built for the Bun runtime.

## <a name='get-started'></a> Getting Started
Be sure that you have the [Bun](https://bun.sh/docs/installation) runtime installed and configured.

### Quick Start
In your application, install the package from the NPM [module](https://www.npmjs.com/package/@breadisbuns/anpan).
```bash
bun i @breadisbuns/anpan
```
Next, require in the anpan module.
```typescript
const { Schema, Repository } = require('@breadisbuns/anpan');
```

### Connect to your Database
Open a connection by requiring in createClient from Redis, and using your URI string.
```typescript
const { createClient } = require('redis');

const { client } = createClient({
  password: 'YOUR PASSWORD HERE',
  socket: {
    host: 'LINK TO CLOUD',
    port: 12179,
  },
});

await client.connect().then(console.log('Connected to Redis'));
```

### Define Your Schema
Now, you can define your schema: 
```typescript
const bakerySchema = new Schema('bakery', {
  name: { type: 'string', isRequired: true },
  owner: { type: 'string', isRequired: true },
  dateCreated: { type: 'date' },
  bakeryNum: { type: 'number' },
  location: { type: 'point' },
  bunsOffered: { type: 'string[]' },
});
```
Valid Datatypes include:
- boolean
- date
- number
- number[]
- point
- string
- string[]
- text

### Create Your Repository

### Make a Query

## <a name='authors'></a> Authors

- [May Wilcher](https://github.com/rehcliw)
- [Kellsy Nava-López](https://github.com/kelsIam)
- [Dillon Hale](https://github.com/HailsD)
- [Kevin Murphy](https://github.com/murph212)

## <a name='license'></a> License

This product is licensed under the MIT License - see the LICENSE file for details.

This is an open-source product.

This product is accelerated by <a href="https://opensourcelabs.io/">OS Labs.</a>
