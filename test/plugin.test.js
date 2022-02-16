'use strict'

const { randomUUID } = require('crypto')
const { beforeEach, test } = require('tap')
const Fastify = require('fastify')
const fastifySupabase = require('../plugin')

require('dotenv').config()

const uuid = randomUUID()

beforeEach(async () => {
  const fastify = Fastify()

  fastify.register(fastifySupabase, {
    supabaseKey: process.env.SUPABASE_API_KEY,
    supabaseUrl: process.env.SUPABASE_PROJECT_URL
  })

  await fastify.ready()
  await fastify.supabase.from('fastify_supabase_test')
    .delete()
    .eq('job', uuid)
  await fastify.close()
})

test('fastify.supabase namespace should exist', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify.register(fastifySupabase, {
    supabaseKey: process.env.SUPABASE_API_KEY,
    supabaseUrl: process.env.SUPABASE_PROJECT_URL
  })

  await fastify.ready()

  t.ok(fastify.supabase)
})

test('fastify.supabase.test namespace should exist', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify.register(fastifySupabase, {
    namespace: 'test',
    supabaseKey: process.env.SUPABASE_API_KEY,
    supabaseUrl: process.env.SUPABASE_PROJECT_URL
  })

  await fastify.ready()

  t.ok(fastify.supabase)
  t.ok(fastify.supabase.test)
})

test('fastify-supabase should be able to access Supabase functionalities when registered without a namespaced instance', async (t) => {
  t.plan(5)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify.register(fastifySupabase, {
    supabaseKey: process.env.SUPABASE_API_KEY,
    supabaseUrl: process.env.SUPABASE_PROJECT_URL
  })

  await fastify.ready()

  t.ok(fastify.supabase)

  const {
    data: insertedData,
    error: insertError
  } = await fastify.supabase.from('fastify_supabase_test')
    .insert({
      job: uuid,
      name: `01-coopflow:${uuid}`
    })
  t.equal(insertError, null)
  t.equal(insertedData[0].name, `01-coopflow:${uuid}`)

  const {
    data: selectedData,
    error: selectError
  } = await fastify.supabase.from('fastify_supabase_test')
    .select('name')
    .eq('job', uuid)
  t.equal(selectError, null)
  t.equal(selectedData[0].name, `01-coopflow:${uuid}`)
})

test('fastify-supabase should be able to access Supabase functionalities within multiple namespaced Supabase instance', async (t) => {
  t.plan(6)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify.register(fastifySupabase, {
    namespace: 'prod',
    supabaseKey: process.env.SUPABASE_API_KEY,
    supabaseUrl: process.env.SUPABASE_PROJECT_URL
  })

  await fastify.register(fastifySupabase, {
    namespace: 'test',
    supabaseKey: process.env.SUPABASE_API_KEY,
    supabaseUrl: process.env.SUPABASE_PROJECT_URL
  })

  await fastify.ready()

  t.ok(fastify.supabase)
  t.ok(fastify.supabase.test.auth)

  const {
    data: insertedData,
    error: insertError
  } = await fastify.supabase.prod.from('fastify_supabase_test')
    .insert({
      job: uuid,
      name: `02-coopflow:${uuid}`
    })
  t.equal(insertError, null)
  t.equal(insertedData[0].name, `02-coopflow:${uuid}`)

  const {
    data: selectedData,
    error: selectError
  } = await fastify.supabase.test.from('fastify_supabase_test')
    .select('name')
    .eq('job', uuid)
  t.equal(selectError, null)
  t.equal(selectedData[0].name, `02-coopflow:${uuid}`)
})

test('fastify-supabase should throw if registered without an API key', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(fastifySupabase, { supabaseUrl: process.env.SUPABASE_PROJECT_URL })

  try {
    await fastify.ready()
  } catch (err) {
    t.ok(err)
    t.equal(err.message, 'You must provide a Supabase API key')
  }
})

test('fastify-supabase should throw if registered without a Supabase project URL', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(fastifySupabase, { supabaseKey: process.env.SUPABASE_API_KEY })

  try {
    await fastify.ready()
  } catch (err) {
    t.ok(err)
    t.equal(err.message, 'You must provide a Supabase Project URL')
  }
})

test('fastify-supabase should throw with duplicate instance names', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  const namespace = 'test'

  fastify
    .register(fastifySupabase, {
      namespace,
      supabaseKey: process.env.SUPABASE_API_KEY,
      supabaseUrl: process.env.SUPABASE_PROJECT_URL
    })
    .register(fastifySupabase, {
      namespace,
      supabaseKey: process.env.SUPABASE_API_KEY,
      supabaseUrl: process.env.SUPABASE_PROJECT_URL
    })

  try {
    await fastify.ready()
  } catch (err) {
    t.ok(err)
    t.equal(err.message, `Supabase client '${namespace}' instance name has already been registered`)
  }
})

test('fastify-supabase should throw when trying to register an instance with a reserved `namespace` keyword', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  const namespace = 'auth'

  fastify.register(fastifySupabase, {
    namespace,
    supabaseKey: process.env.SUPABASE_API_KEY,
    supabaseUrl: process.env.SUPABASE_PROJECT_URL
  })

  try {
    await fastify.ready()
  } catch (err) {
    t.ok(err)
    t.equal(err.message, `fastify-supabase '${namespace}' is a reserved keyword`)
  }
})

test('fastify-supabase should throw when trying to register multiple instances without giving a name', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify
    .register(fastifySupabase, {
      supabaseKey: process.env.SUPABASE_API_KEY,
      supabaseUrl: process.env.SUPABASE_PROJECT_URL
    })
    .register(fastifySupabase, {
      supabaseKey: process.env.SUPABASE_API_KEY,
      supabaseUrl: process.env.SUPABASE_PROJECT_URL
    })

  try {
    await fastify.ready()
  } catch (err) {
    t.ok(err)
    t.equal(err.message, 'fastify-supabase has already been registered')
  }
})

test('fastify-supabase should not throw if registered within different scopes (with and without namespaced instances)', (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(function scopeOne (instance, opts, next) {
    instance.register(fastifySupabase, {
      supabaseKey: process.env.SUPABASE_API_KEY,
      supabaseUrl: process.env.SUPABASE_PROJECT_URL
    })

    next()
  })

  fastify.register(function scopeTwo (instance, opts, next) {
    instance.register(fastifySupabase, {
      namespace: 'test',
      supabaseKey: process.env.SUPABASE_API_KEY,
      supabaseUrl: process.env.SUPABASE_PROJECT_URL
    })

    instance.register(fastifySupabase, {
      namespace: 'anotherTest',
      supabaseKey: process.env.SUPABASE_API_KEY,
      supabaseUrl: process.env.SUPABASE_PROJECT_URL
    })

    next()
  })

  fastify.ready((err) => {
    t.error(err)
    t.equal(err, undefined)
  })
})

test('fastify-supabase should be able to register multiple instances (with and without namespaced instances)', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify.register(fastifySupabase, {
    supabaseKey: process.env.SUPABASE_API_KEY,
    supabaseUrl: process.env.SUPABASE_PROJECT_URL
  })

  await fastify.register(fastifySupabase, {
    namespace: 'one',
    supabaseKey: process.env.SUPABASE_API_KEY,
    supabaseUrl: process.env.SUPABASE_PROJECT_URL
  })

  await fastify.ready()

  t.ok(fastify.supabase)
  t.ok(fastify.supabase.one)
})
