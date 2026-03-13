import type { DbObject } from "@/shared/types/object";
import { OBJECTS_URL } from "@/shared/api/endpoints";
import { requestJson } from "@/shared/api/requestJson";

import objectsMock from "@/mocks/objects.json";

export async function getObjects(
  url: string = OBJECTS_URL
): Promise<DbObject[]> {
  if (url.startsWith("mock://")) {
    return objectsMock as DbObject[];
  }

  return requestJson<DbObject[]>(url, {
    headers: {
      Accept: "application/json",
    },
  });
}

