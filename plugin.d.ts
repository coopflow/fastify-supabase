import { SupabaseClient, SupabaseClientOptions } from "@supabase/supabase-js";
import { FastifyPluginCallback } from "fastify";

export interface FastifySupabasePluginOptions {
  /**
   * fastify-supabase name of the instance
   */
  namespace?: string;
  supabaseClientOptions?: SupabaseClientOptions;

  /**
   * The unique Supabase Key which is supplied when you create a new project in your project dashboard
   */
  supabaseKey: string;

  /**
   * The unique Supabase URL which is supplied when you create a new project in your project dashboard
   */
  supabaseUrl: string;
}

export interface FastifySupabaseNamedInstance {
  [namespace: string]: SupabaseClient;
}

export type FastifySupabase = FastifySupabaseNamedInstance & SupabaseClient;

declare module "fastify" {
  interface FastifyInstance {
    supabase: FastifySupabase;
  }
}

export const FastifySupabasePlugin: FastifyPluginCallback<FastifySupabasePluginOptions>;
export default FastifySupabasePlugin;
