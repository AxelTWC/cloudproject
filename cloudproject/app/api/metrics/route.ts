import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    
    const [userCount, fileCount] = await Promise.all([
      prisma.user.count(),
      prisma.file.count(),
    ]);

    
    const metrics = `
# HELP app_users_total Total number of users
# TYPE app_users_total gauge
app_users_total ${userCount}

# HELP app_files_total Total number of files
# TYPE app_files_total gauge
app_files_total ${fileCount}

# HELP nodejs_memory_heap_used_bytes Node.js heap memory used
# TYPE nodejs_memory_heap_used_bytes gauge
nodejs_memory_heap_used_bytes ${process.memoryUsage().heapUsed}

# HELP nodejs_memory_heap_total_bytes Node.js heap memory total
# TYPE nodejs_memory_heap_total_bytes gauge
nodejs_memory_heap_total_bytes ${process.memoryUsage().heapTotal}

# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds counter
process_uptime_seconds ${process.uptime()}
`.trim();

    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to collect metrics" }, { status: 500 });
  }
}