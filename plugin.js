'use strict'

const fp = require('fastify-plugin')
const { createClient } = require('@supabase/supabase-js')

function fastifySupabase (fastify, options, next) {
  const { namespace, supabaseKey, supabaseUrl, ...supabaseOptions } = options

  if (!supabaseKey) {
    return next(new Error('You must provide a Supabase API key'))
  }

  if (!supabaseUrl) {
    return next(new Error('You must provide a Supabase Project URL'))
  }

  const supabase = createClient(supabaseUrl, supabaseKey, supabaseOptions)

  if (namespace) {
    if (supabase[namespace]) {
      return next(new Error(`fastify-supabase '${namespace}' is a reserved keyword`))
    } else if (!fastify.supabase) {
      fastify.decorate('supabase', Object.create(null))
    } else if (Object.prototype.hasOwnProperty.call(fastify.supabase, namespace)) {
      return next(new Error(`Supabase client '${namespace}' instance name has already been registered`))
    }

    fastify.supabase[namespace] = supabase
  } else {
    if (fastify.supabase) {
      return next(new Error('fastify-supabase has already been registered'))
    } else {
      fastify.decorate('supabase', supabase)
    }
  }

  next()
}

module.exports = fp(fastifySupabase, {
  fastify: '>=3.0.0',
  name: 'fastify-supabase'
})
