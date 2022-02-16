# fastify-supabase

[![NPM version](https://img.shields.io/npm/v/fastify-supabase.svg?style=flat)](https://www.npmjs.com/package/fastify-supabase)
[![GitHub CI](https://github.com/coopflow/fastify-supabase/workflows/GitHub%20CI/badge.svg)](https://github.com/coopflow/fastify-supabase/actions?workflow=GitHub+CI)
[![Coverage Status](https://coveralls.io/repos/github/coopflow/fastify-supabase/badge.svg?branch=main)](https://coveralls.io/github/coopflow/fastify-supabase?branch=main)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

[Supabase client](https://github.com/supabase/supabase-js) initialization and encapsulation in [fastify](https://github.com/fastify/fastify) framework.

## Install

Install the package with:
```sh
npm i fastify-supabase --save
```


## Usage

The package needs to be added to your project with `register` and you must at least configure your Supabase API key and your Supabase URL wich are available in your Supabase project settings then call the Supabase API and you are done.
```js
const fastify = require('fastify')({ logger: true })

fastify.register(require('fastify-supabase'), {
  supabaseKey: 'public-anon-key',
  supabaseUrl: 'https://xyzcompany.supabase.co'
})

fastify.get('/read', async (request, reply) => {
  const { supabase } = fastify

  const { data, error } = await supabase.from('cities').select()

  return { data, error }
})

fastify.listen(3000, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
```

### Options

* `supabaseKey` **[ required ]** `<string>`: The unique Supabase Key which is supplied when you create a new project in your project dashboard.

* `supabaseUrl` **[ required ]** `<string>`: The unique Supabase URL which is supplied when you create a new project in your project dashboard.

* `namespace` **[ optional ]** `<string>`: Through this option `fastify-supabase` lets you define multiple Supabase singular instances (with different options parameters if you wish) that you can later use in your application.
```js
const fastify = require('fastify')({ logger: true })

fastify.register(require('fastify-supabase'), {
  namespace: 'one',
  supabaseKey: 'public-anon-key-one',
  supabaseUrl: 'https://xyzcompanyprojectone.supabase.co'
})

fastify.register(require('fastify-supabase'), {
  namespace: 'two',
  supabaseKey: 'public-anon-key-two',
  supabaseUrl: 'https://xyzcompanyprojecttwo.supabase.co'
})

fastify.get('/fetch-from-one', async (request, reply) => {
  const { supabase } = fastify

  const { data, error } = await supabase.one.from('project_one_table').select()

  return { data, error }
})

fastify.get('/fetch-from-two', async (request, reply) => {
  const { supabase } = fastify

  const { data, error } = await supabase.two.from('project_two_table').select()

  return { data, error }
})

fastify.listen(3000, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
```

* `schema` **[ optional ]** `<string>`: The Postgres schema which your tables belong to. Must be on the list of exposed schemas in Supabase. Defaults to 'public'.

* `headers` **[ optional ]** `<{ [key: string]: string }>`: Optional headers for initializing the client.

* `autoRefreshToken` **[ optional ]** `<boolean>`: Automatically refreshes the token for logged in users.

* `persistSession` **[ optional ]** `<boolean>`: Whether to persist a logged in session to storage.

* `detectSessionInUrl` **[ optional ]** `<boolean>`: Detect a session from the URL. Used for OAuth login callbacks.

* `localStorage` **[ optional ]** `<SupabaseAuthClientOptions['localStorage']>`: A storage provider. Used to store the logged in session.

* `realtime` **[ optional ]** `<RealtimeClientOptions>`: Options passed to the realtime-js instance.

*__Note for TypeScript users__: If you are a TypeScript user, take a look at [Supabase Generating Types documentation](https://supabase.io/docs/reference/javascript/generating-types).*

## Documentation

See the [Supabase reference documentation](https://supabase.io/docs/reference/javascript/supabase-client).

## Testing

- Create a test table in your [Supabase](https://app.supabase.io) project database with:
```SQL
CREATE TABLE "public"."fastify_supabase_test" (
  "id" uuid DEFAULT GEN_RANDOM_UUID() NOT NULL,
  "job" uuid NOT NULL,
  "name" character varying NOT NULL,
  "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "fastify_supabase_test_id__pkey" PRIMARY KEY ("id")
) WITH (oids = false);
```
- Create a file named `.env` (at the root of this project) providing your `supabaseKey` and `supabaseUrl`:
```sh
SUPABASE_API_KEY=public-anon-key-of-your-project
SUPABASE_PROJECT_URL=https://xyzcompany.supabase.co
```
- Finally run tests with:
```sh
npm run test
```

## Acknowledgements

- [Ruan Martinelli](https://ruanmartinelli.com/) for kindly transferring the ownership of the package name.
- This project is kindly sponsored by [coopflow](https://www.coopflow.com).


## License

Licensed under [MIT](https://github.com/coopflow/fastify-supabase/blob/main/LICENSE)
