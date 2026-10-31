import fs from 'node:fs';
/** @type {import('next').NextConfig} */
const config = {
  poweredByHeader: false,
  generateBuildId: async()=>JSON.parse(fs.readFileSync('config/run-binding.json','utf8')).buildId,
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {'/api/internal/qualification/read-only':['./qualification/**/*','./lib/server/purchases/creamery-transport.ts','./lib/purchases/reservation-v2.ts','./lib/server/purchases/creamery-reservations.ts',...JSON.parse(fs.readFileSync('config/worker-runtime-files.json','utf8')).map(p=>'./'+p)]},
  experimental: {cpus:1},
};
export default config;
