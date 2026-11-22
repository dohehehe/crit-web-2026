/** @type {import('next').NextConfig} */
const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;

const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : null;

const nextConfig = {
  reactCompiler: true,
  experimental: {
    // Middleware clones the request body. Next.js stops at 10MB unless this is raised.
    // 52MB leaves room for a 50MB PDF plus the multipart wrapper.
    proxyClientMaxBodySize: "52mb",
  },
  images: {
    // Uploads are already stored as WebP. The loader would resize each one
    // again per width, and those runs are Vercel Image Transformations.
    unoptimized: true,
    // Next.js 16 blocks upstream fetches when DNS resolves to NAT64/private IPs.
    dangerouslyAllowLocalIP: true,
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
