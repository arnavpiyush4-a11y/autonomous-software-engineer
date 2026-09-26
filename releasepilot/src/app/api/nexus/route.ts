/**
 * GET /api/nexus
 * Returns the Nexus state for the E-Commerce Platform (architecture graph,
 * impact analyses, and latest confidence score).
 */

import { NextResponse } from 'next/server';
import type { NexusState } from '@/lib/db/types';
import { DEMO_POST_RUN_CONFIDENCE } from '@/lib/confidence/engine';

// ─── Static Nexus state for the demo repository ───────────────────────────────

const ECOMMERCE_NEXUS: NexusState = {
  repositoryId: 'repo_ecommerce',
  lastUpdated: '2024-03-18T14:15:08Z',
  nodes: [
    {
      id: 'node_frontend',
      label: 'React Storefront',
      type: 'frontend',
      technology: 'React · TypeScript',
      status: 'HEALTHY',
      issues: 0,
      x: 120,
      y: 80,
      description: 'Customer-facing shopping UI — product catalog, cart, checkout flow',
    },
    {
      id: 'node_api',
      label: 'Express API',
      type: 'api',
      technology: 'Node.js · Express',
      status: 'HEALTHY',
      issues: 0,
      x: 340,
      y: 80,
      description: 'REST API layer — products, orders, auth, cart management',
    },
    {
      id: 'node_auth',
      label: 'Auth Service',
      type: 'auth',
      technology: 'JWT · Password Reset',
      status: 'HEALTHY',
      issues: 0,
      x: 340,
      y: 220,
      description: 'Authentication and authorization — JWT tokens, password reset, sessions',
    },
    {
      id: 'node_db',
      label: 'PostgreSQL',
      type: 'database',
      technology: 'PostgreSQL 15',
      status: 'HEALTHY',
      issues: 0,
      x: 560,
      y: 150,
      description: 'Primary datastore — users, orders, products, inventory',
    },
    {
      id: 'node_cache',
      label: 'Redis Cache',
      type: 'cache',
      technology: 'Redis 7',
      status: 'HEALTHY',
      issues: 0,
      x: 560,
      y: 50,
      description: 'Session storage, rate limiting, frequently-accessed product cache',
    },
    {
      id: 'node_tests',
      label: 'Test Suite',
      type: 'test',
      technology: 'Jest · 145 tests',
      status: 'HEALTHY',
      issues: 0,
      x: 120,
      y: 220,
      description: 'Unit and integration tests — 85.6% coverage after fix',
    },
    {
      id: 'node_deps',
      label: 'Dependencies',
      type: 'deps',
      technology: 'npm · package.json',
      status: 'HEALTHY',
      issues: 0,
      x: 560,
      y: 270,
      description: 'jsonwebtoken@9.0.2 (patched), lodash@4.17.21 (patched)',
    },
  ],
  edges: [
    { from: 'node_frontend', to: 'node_api',    label: 'REST/HTTPS', protocol: 'HTTP/2', risk: 'LOW' },
    { from: 'node_api',      to: 'node_auth',   label: 'Validates JWT', protocol: 'internal', risk: 'LOW' },
    { from: 'node_api',      to: 'node_db',     label: 'Reads/Writes', protocol: 'TCP', risk: 'LOW' },
    { from: 'node_api',      to: 'node_cache',  label: 'Session lookup', protocol: 'TCP', risk: 'LOW' },
    { from: 'node_auth',     to: 'node_db',     label: 'Token store', protocol: 'TCP', risk: 'LOW' },
    { from: 'node_tests',    to: 'node_auth',   label: 'Tests auth', risk: 'LOW' },
    { from: 'node_deps',     to: 'node_auth',   label: 'jsonwebtoken', risk: 'LOW' },
  ],
  impactAnalyses: [
    {
      sourceId: 'src/auth/password-reset.ts',
      sourceLabel: 'Password Reset Bug Fix',
      affectedNodes: [
        {
          nodeId: 'node_auth',
          reason: 'Token invalidation logic added to this service',
          risk: 'HIGH',
          suggestedVerification: ['Re-run password reset regression tests', 'Audit all token lookup paths'],
        },
        {
          nodeId: 'node_db',
          reason: 'New usedAt column written on token consumption',
          risk: 'MEDIUM',
          suggestedVerification: ['Verify DB migration applied', 'Check index on usedAt'],
        },
        {
          nodeId: 'node_tests',
          reason: 'New regression test added for token invalidation',
          risk: 'LOW',
          suggestedVerification: ['Confirm test covers replay scenario'],
        },
      ],
      affectedTests: [
        'src/auth/__tests__/password-reset.test.ts',
        'src/auth/__tests__/session.test.ts',
      ],
      riskLevel: 'HIGH',
      summary: 'Critical auth path changed — replay attack vector closed. Token store now marks tokens as used on first consumption. 2 related test files must pass.',
    },
    {
      sourceId: 'package.json',
      sourceLabel: 'jsonwebtoken 8.5.1 → 9.0.2',
      affectedNodes: [
        {
          nodeId: 'node_deps',
          reason: 'Direct dependency upgraded to patch CVE-2022-23529',
          risk: 'MEDIUM',
          suggestedVerification: ['Verify JWT signing still works', 'Check algorithm option is explicit'],
        },
        {
          nodeId: 'node_auth',
          reason: 'Auth service uses jsonwebtoken for all token operations',
          risk: 'MEDIUM',
          suggestedVerification: ['Run full auth test suite', 'Test token verification with upgraded library'],
        },
      ],
      affectedTests: ['src/auth/__tests__/jwt.test.ts'],
      riskLevel: 'MEDIUM',
      summary: 'Dependency upgrade patches CVSS 7.6 vulnerability. Breaking change in v9 requires explicit algorithm option — verify existing calls.',
    },
  ],
  confidence: DEMO_POST_RUN_CONFIDENCE,
};

export async function GET() {
  return NextResponse.json(ECOMMERCE_NEXUS);
}
