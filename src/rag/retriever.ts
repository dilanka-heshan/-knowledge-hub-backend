
// ChromaDB query + seed
/**
 * rag/retriever.ts — Pinecone vector store retriever
 *
 * Pinecone setup (one-time, in the console at app.pinecone.io):
 *   1. Create an index named "knowledge-hub"
 *   2. Dimensions: 1024  (matches Anthropic voyage-3 embeddings)
 *   3. Metric: cosine
 *
 * Namespaces: each company gets its own namespace (companyId).
 * This means one index, fully isolated data per company.
 *
 * Embeddings: use Anthropic's built-in embed endpoint
 * (no separate embedding library needed).
 */

import { Pinecone } from "@pinecone-database/pinecone";
import Anthropic from "@anthropic-ai/sdk";
import type { RagChunk } from "../types";
import { SEED_CHUNKS } from "./seedData";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const INDEX_NAME = process.env.PINECONE_INDEX ?? "knowledge-hub";

// ── Embed helper ─────────────────────────────────────────────────
// Uses Anthropic's embedding API — keeps dependencies minimal.
async function embed(text: string): Promise<number[]> {
  const response = await anthropic.embeddings.create({
    model: "voyage-3",
    input: text,
  });
  return response.data[0].embedding;
}

// ── Public retriever ─────────────────────────────────────────────
export const ragRetriever = {

  /**
   * Query Pinecone for the top-k chunks most relevant to the query.
   * namespace = companyId keeps each company's data isolated.
   */
  async query(query: string, companyId: string, topK = 5): Promise<RagChunk[]> {
    const index = pinecone.index(INDEX_NAME).namespace(companyId);
    const queryEmbedding = await embed(query);

    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return (results.matches ?? []).map((match) => ({
      id: match.id,
      content: (match.metadata?.content as string) ?? "",
      metadata: (match.metadata as Record<string, string>) ?? {},
      score: match.score ?? 0,
    }));
  },

  /**
   * Seed the index with company knowledge base chunks.
   * Call once via: GET /admin/seed?companyId=xxx
   * (or run as a one-off script during onboarding)
   */
  async seed(companyId: string): Promise<void> {
    const index = pinecone.index(INDEX_NAME).namespace(companyId);

    const vectors = await Promise.all(
      SEED_CHUNKS.map(async (chunk) => ({
        id: chunk.id,
        values: await embed(chunk.content),
        metadata: {
          ...chunk.metadata,
          content: chunk.content,   // store raw text so query() can return it
        },
      }))
    );

    // Pinecone recommends batches of 100
    await index.upsert(vectors);

    console.log(`Seeded ${vectors.length} chunks for company: ${companyId}`);
  },
};