import { isAllowedTable } from "@/lib/api/constants";
import {
  handleDelete,
  handleGetOne,
  handleUpdate,
} from "@/lib/api/handlers";
import { jsonError } from "@/lib/api/response";

export async function GET(request, { params }) {
  const { table, id } = await params;

  if (!isAllowedTable(table)) {
    return jsonError("Table not found", 404);
  }

  return handleGetOne(table, id, request);
}

export async function PATCH(request, { params }) {
  const { table, id } = await params;

  if (!isAllowedTable(table)) {
    return jsonError("Table not found", 404);
  }

  return handleUpdate(table, id, request);
}

export async function DELETE(_request, { params }) {
  const { table, id } = await params;

  if (!isAllowedTable(table)) {
    return jsonError("Table not found", 404);
  }

  return handleDelete(table, id);
}
