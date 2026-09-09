import { isAllowedTable } from "@/lib/api/constants";
import { handleCreate, handleList } from "@/lib/api/handlers";
import { jsonError } from "@/lib/api/response";

export async function GET(request, { params }) {
  const { table } = await params;

  if (!isAllowedTable(table)) {
    return jsonError("Table not found", 404);
  }

  return handleList(table, request);
}

export async function POST(request, { params }) {
  const { table } = await params;

  if (!isAllowedTable(table)) {
    return jsonError("Table not found", 404);
  }

  return handleCreate(table, request);
}
