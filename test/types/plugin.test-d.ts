import { RealtimeSubscription, SupabaseClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import Fastify from "fastify"
import { expectAssignable, expectError, expectType } from "tsd"
import fastifySupabase, {
  FastifySupabase,
  FastifySupabaseNamedInstance
} from "../../plugin"

const { parsed: env } = config()

if (!env) {
  throw new Error("No environment variables defined")
}

const app = Fastify();

app
  .register(fastifySupabase, {
    supabaseKey: env.SUPABASE_API_KEY,
    supabaseUrl: env.SUPABASE_PROJECT_URL,
  })
  .register(fastifySupabase, {
    namespace: "one",
    supabaseKey: env.SUPABASE_API_KEY,
    supabaseUrl: env.SUPABASE_PROJECT_URL
  })

expectError(app.register(fastifySupabase, {
  namespace: "triggerTypescriptError",
  supabaseKey: env.SUPABASE_API_KEY,
  supabaseUrl: env.SUPABASE_PROJECT_URL,
  unknwonOption: 'this should trigger a typescript error'
}))

app.after(() => {
  expectAssignable<SupabaseClient>(app.supabase)
  expectType<FastifySupabase>(app.supabase)

  expectAssignable<FastifySupabaseNamedInstance>(app.supabase)
  expectType<SupabaseClient>(app.supabase.one)
  expectType<RealtimeSubscription[]>(app.supabase.one.getSubscriptions())
})
