


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";






CREATE TYPE "public"."message_role" AS ENUM (
    'user',
    'system',
    'tool'
);


ALTER TYPE "public"."message_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_embeddings"("query_embedding" "extensions"."vector", "match_threshold" double precision DEFAULT 0.5, "match_count" integer DEFAULT 20, "filter_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" "text", "entity_type" "text", "entity_id" "text", "content" "text", "metadata" "jsonb", "similarity" double precision)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.entity_type,
    e.entity_id,
    e.content,
    e.metadata,
    1 - (e.embedding <=> query_embedding) as similarity
  FROM embeddings e
  WHERE (filter_user_id IS NULL OR e.user_id = filter_user_id)
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


ALTER FUNCTION "public"."match_embeddings"("query_embedding" "extensions"."vector", "match_threshold" double precision, "match_count" integer, "filter_user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."chat_message_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message_id" "uuid" NOT NULL,
    "kind" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "mime_type" "text",
    "bytes" integer,
    "width" integer,
    "height" integer,
    "duration_ms" integer,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chat_message_attachments_kind_check" CHECK (("kind" = ANY (ARRAY['image'::"text", 'audio'::"text", 'file'::"text"])))
);


ALTER TABLE "public"."chat_message_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chat_id" "uuid" NOT NULL,
    "role" "public"."message_role" NOT NULL,
    "text" "text",
    "parts" "jsonb" DEFAULT '[]'::"jsonb",
    "text_tsv" "tsvector" GENERATED ALWAYS AS (("setweight"("to_tsvector"('"simple"'::"regconfig", COALESCE("text", ''::"text")), 'A'::"char") || "setweight"("to_tsvector"('"simple"'::"regconfig", COALESCE(("jsonb_path_query_array"("parts", '$[*]?(@."type" == "text")."text"'::"jsonpath"))::"text", ''::"text")), 'B'::"char"))) STORED,
    "status" "text" DEFAULT 'final'::"text",
    "reply_to" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chat_messages_status_check" CHECK (("status" = ANY (ARRAY['final'::"text", 'streaming'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "archived_at" timestamp with time zone
);


ALTER TABLE "public"."chats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."commitment_contacts" (
    "commitment_id" "uuid" NOT NULL,
    "contact_id" "uuid" NOT NULL
);


ALTER TABLE "public"."commitment_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."commitments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "text" "text" NOT NULL,
    "time" "text" NOT NULL,
    "is_trashed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL
);

ALTER TABLE ONLY "public"."commitments" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."commitments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_notes" (
    "contact_id" "uuid" NOT NULL,
    "note_id" "uuid" NOT NULL
);


ALTER TABLE "public"."contact_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_relationships" (
    "contact_id" "uuid" NOT NULL,
    "relationship_id" "uuid" NOT NULL
);


ALTER TABLE "public"."contact_relationships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_subjects" (
    "contact_id" "uuid" NOT NULL,
    "subject_id" "uuid" NOT NULL
);


ALTER TABLE "public"."contact_subjects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "occupation_id" "uuid",
    "organization_id" "uuid",
    "birth_year" integer,
    "birth_month" integer,
    "birth_day" integer,
    "is_trashed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL,
    CONSTRAINT "contacts_birth_day_check" CHECK ((("birth_day" >= 1) AND ("birth_day" <= 31))),
    CONSTRAINT "contacts_birth_month_check" CHECK ((("birth_month" >= 1) AND ("birth_month" <= 12)))
);

ALTER TABLE ONLY "public"."contacts" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."embeddings" (
    "id" "text" NOT NULL,
    "user_id" "uuid",
    "entity_type" "text" NOT NULL,
    "entity_id" "text" NOT NULL,
    "embedding" "extensions"."vector"(1536),
    "content" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."embeddings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."note_sentiments" (
    "note_id" "uuid" NOT NULL,
    "sentiment_id" "uuid" NOT NULL
);


ALTER TABLE "public"."note_sentiments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "text" "text" NOT NULL,
    "note_year" integer,
    "note_month" integer,
    "note_day" integer,
    "time_hour" integer,
    "time_minute" integer,
    "is_trashed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL,
    CONSTRAINT "notes_note_day_check" CHECK ((("note_day" >= 1) AND ("note_day" <= 31))),
    CONSTRAINT "notes_note_month_check" CHECK ((("note_month" >= 1) AND ("note_month" <= 12))),
    CONSTRAINT "notes_time_hour_check" CHECK ((("time_hour" >= 0) AND ("time_hour" <= 23))),
    CONSTRAINT "notes_time_minute_check" CHECK ((("time_minute" >= 0) AND ("time_minute" <= 59)))
);

ALTER TABLE ONLY "public"."notes" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."occupations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL
);

ALTER TABLE ONLY "public"."occupations" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."occupations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL
);

ALTER TABLE ONLY "public"."organizations" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."relationships" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "label" "text" NOT NULL,
    "category" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL
);

ALTER TABLE ONLY "public"."relationships" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."relationships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sentiments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "label" "text" NOT NULL,
    "category" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL
);

ALTER TABLE ONLY "public"."sentiments" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."sentiments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "label" "text" NOT NULL,
    "category" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL
);

ALTER TABLE ONLY "public"."subjects" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."subjects" OWNER TO "postgres";


ALTER TABLE ONLY "public"."chat_message_attachments"
    ADD CONSTRAINT "chat_message_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."commitment_contacts"
    ADD CONSTRAINT "commitment_contacts_pkey" PRIMARY KEY ("commitment_id", "contact_id");



ALTER TABLE ONLY "public"."commitments"
    ADD CONSTRAINT "commitments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_notes"
    ADD CONSTRAINT "contact_notes_pkey" PRIMARY KEY ("contact_id", "note_id");



ALTER TABLE ONLY "public"."contact_relationships"
    ADD CONSTRAINT "contact_relationships_pkey" PRIMARY KEY ("contact_id", "relationship_id");



ALTER TABLE ONLY "public"."contact_subjects"
    ADD CONSTRAINT "contact_subjects_pkey" PRIMARY KEY ("contact_id", "subject_id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."embeddings"
    ADD CONSTRAINT "embeddings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."note_sentiments"
    ADD CONSTRAINT "note_sentiments_pkey" PRIMARY KEY ("note_id", "sentiment_id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."occupations"
    ADD CONSTRAINT "occupations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."relationships"
    ADD CONSTRAINT "relationships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sentiments"
    ADD CONSTRAINT "sentiments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");



CREATE INDEX "chat_message_attachments_message_idx" ON "public"."chat_message_attachments" USING "btree" ("message_id");



CREATE INDEX "chat_messages_chat_id_created_at_idx" ON "public"."chat_messages" USING "btree" ("chat_id", "created_at");



CREATE INDEX "chat_messages_parts_gin" ON "public"."chat_messages" USING "gin" ("parts");



CREATE INDEX "chat_messages_text_tsv_idx" ON "public"."chat_messages" USING "gin" ("text_tsv");



CREATE INDEX "chats_updated_at_idx" ON "public"."chats" USING "btree" ("updated_at");



CREATE INDEX "chats_user_id_idx" ON "public"."chats" USING "btree" ("user_id");



CREATE INDEX "commitments_user_idx" ON "public"."commitments" USING "btree" ("user_id");



CREATE INDEX "contacts_user_idx" ON "public"."contacts" USING "btree" ("user_id");



CREATE INDEX "embeddings_user_entity_idx" ON "public"."embeddings" USING "btree" ("user_id", "entity_type");



CREATE INDEX "embeddings_vector_idx" ON "public"."embeddings" USING "ivfflat" ("embedding" "extensions"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "idx_commitments_time" ON "public"."commitments" USING "btree" ("time");



CREATE INDEX "idx_contacts_name" ON "public"."contacts" USING "btree" ("name");



CREATE INDEX "idx_notes_created_at" ON "public"."notes" USING "btree" ("created_at");



CREATE INDEX "idx_notes_title" ON "public"."notes" USING "btree" ("title");



CREATE INDEX "notes_user_idx" ON "public"."notes" USING "btree" ("user_id");



CREATE INDEX "occupations_user_idx" ON "public"."occupations" USING "btree" ("user_id");



CREATE INDEX "organizations_user_idx" ON "public"."organizations" USING "btree" ("user_id");



CREATE INDEX "relationships_user_idx" ON "public"."relationships" USING "btree" ("user_id");



CREATE INDEX "sentiments_user_idx" ON "public"."sentiments" USING "btree" ("user_id");



CREATE INDEX "subjects_user_idx" ON "public"."subjects" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."chat_message_attachments"
    ADD CONSTRAINT "chat_message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_reply_to_fkey" FOREIGN KEY ("reply_to") REFERENCES "public"."chat_messages"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."commitment_contacts"
    ADD CONSTRAINT "commitment_contacts_commitment_id_fkey" FOREIGN KEY ("commitment_id") REFERENCES "public"."commitments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."commitment_contacts"
    ADD CONSTRAINT "commitment_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."commitments"
    ADD CONSTRAINT "commitments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_notes"
    ADD CONSTRAINT "contact_notes_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_notes"
    ADD CONSTRAINT "contact_notes_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_relationships"
    ADD CONSTRAINT "contact_relationships_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_relationships"
    ADD CONSTRAINT "contact_relationships_relationship_id_fkey" FOREIGN KEY ("relationship_id") REFERENCES "public"."relationships"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_subjects"
    ADD CONSTRAINT "contact_subjects_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_subjects"
    ADD CONSTRAINT "contact_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_occupation_id_fkey" FOREIGN KEY ("occupation_id") REFERENCES "public"."occupations"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."embeddings"
    ADD CONSTRAINT "embeddings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."note_sentiments"
    ADD CONSTRAINT "note_sentiments_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."note_sentiments"
    ADD CONSTRAINT "note_sentiments_sentiment_id_fkey" FOREIGN KEY ("sentiment_id") REFERENCES "public"."sentiments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."occupations"
    ADD CONSTRAINT "occupations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."relationships"
    ADD CONSTRAINT "relationships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sentiments"
    ADD CONSTRAINT "sentiments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow all operations on commitment_contacts" ON "public"."commitment_contacts" USING (true);



CREATE POLICY "Allow all operations on contact_notes" ON "public"."contact_notes" USING (true);



CREATE POLICY "Allow all operations on contact_relationships" ON "public"."contact_relationships" USING (true);



CREATE POLICY "Allow all operations on contact_subjects" ON "public"."contact_subjects" USING (true);



CREATE POLICY "Allow all operations on note_sentiments" ON "public"."note_sentiments" USING (true);



CREATE POLICY "attachments_in_own_chat" ON "public"."chat_message_attachments" USING ((EXISTS ( SELECT 1
   FROM ("public"."chat_messages" "m"
     JOIN "public"."chats" "c" ON (("c"."id" = "m"."chat_id")))
  WHERE (("m"."id" = "chat_message_attachments"."message_id") AND ("c"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."chat_messages" "m"
     JOIN "public"."chats" "c" ON (("c"."id" = "m"."chat_id")))
  WHERE (("m"."id" = "chat_message_attachments"."message_id") AND ("c"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."chat_message_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chats" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "chats_is_owner" ON "public"."chats" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."commitment_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."commitments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "commitments_is_owner" ON "public"."commitments" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."contact_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_relationships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_subjects" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "contacts_is_owner" ON "public"."contacts" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "messages_in_own_chat" ON "public"."chat_messages" USING ((EXISTS ( SELECT 1
   FROM "public"."chats" "c"
  WHERE (("c"."id" = "chat_messages"."chat_id") AND ("c"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."chats" "c"
  WHERE (("c"."id" = "chat_messages"."chat_id") AND ("c"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."note_sentiments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notes_is_owner" ON "public"."notes" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."occupations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "occupations_is_owner" ON "public"."occupations" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organizations_is_owner" ON "public"."organizations" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."relationships" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "relationships_is_owner" ON "public"."relationships" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."sentiments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sentiments_is_owner" ON "public"."sentiments" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subjects_is_owner" ON "public"."subjects" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chat_messages";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chats";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";













































































































































































































































































































































































































































































































































GRANT ALL ON TABLE "public"."chat_message_attachments" TO "anon";
GRANT ALL ON TABLE "public"."chat_message_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_message_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."chats" TO "anon";
GRANT ALL ON TABLE "public"."chats" TO "authenticated";
GRANT ALL ON TABLE "public"."chats" TO "service_role";



GRANT ALL ON TABLE "public"."commitment_contacts" TO "anon";
GRANT ALL ON TABLE "public"."commitment_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."commitment_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."commitments" TO "anon";
GRANT ALL ON TABLE "public"."commitments" TO "authenticated";
GRANT ALL ON TABLE "public"."commitments" TO "service_role";



GRANT ALL ON TABLE "public"."contact_notes" TO "anon";
GRANT ALL ON TABLE "public"."contact_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_notes" TO "service_role";



GRANT ALL ON TABLE "public"."contact_relationships" TO "anon";
GRANT ALL ON TABLE "public"."contact_relationships" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_relationships" TO "service_role";



GRANT ALL ON TABLE "public"."contact_subjects" TO "anon";
GRANT ALL ON TABLE "public"."contact_subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_subjects" TO "service_role";



GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";



GRANT ALL ON TABLE "public"."embeddings" TO "anon";
GRANT ALL ON TABLE "public"."embeddings" TO "authenticated";
GRANT ALL ON TABLE "public"."embeddings" TO "service_role";



GRANT ALL ON TABLE "public"."note_sentiments" TO "anon";
GRANT ALL ON TABLE "public"."note_sentiments" TO "authenticated";
GRANT ALL ON TABLE "public"."note_sentiments" TO "service_role";



GRANT ALL ON TABLE "public"."notes" TO "anon";
GRANT ALL ON TABLE "public"."notes" TO "authenticated";
GRANT ALL ON TABLE "public"."notes" TO "service_role";



GRANT ALL ON TABLE "public"."occupations" TO "anon";
GRANT ALL ON TABLE "public"."occupations" TO "authenticated";
GRANT ALL ON TABLE "public"."occupations" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."relationships" TO "anon";
GRANT ALL ON TABLE "public"."relationships" TO "authenticated";
GRANT ALL ON TABLE "public"."relationships" TO "service_role";



GRANT ALL ON TABLE "public"."sentiments" TO "anon";
GRANT ALL ON TABLE "public"."sentiments" TO "authenticated";
GRANT ALL ON TABLE "public"."sentiments" TO "service_role";



GRANT ALL ON TABLE "public"."subjects" TO "anon";
GRANT ALL ON TABLE "public"."subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."subjects" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;
