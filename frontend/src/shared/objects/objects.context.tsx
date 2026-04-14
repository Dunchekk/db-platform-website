// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import { getObjects } from "@/shared/api/objects";
// import type { DbObject } from "@/shared/types/object.types";

// type ObjectsContextValue = {
//   objects: DbObject[];
//   objectsById: Record<string, DbObject>;
//   isLoading: boolean;
//   error: string | null;
//   refetch: () => Promise<void>;
// };

// const ObjectsContext = createContext<ObjectsContextValue | null>(null);

// export function ObjectsProvider({ children }: { children: React.ReactNode }) {
//   const [objects, setObjects] = useState<DbObject[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const objectsById = useMemo(() => {
//     const map: Record<string, DbObject> = {};
//     for (const object of objects) {
//       map[object.id] = object;
//     }
//     return map;
//   }, [objects]);

//   const refetch = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const nextObjects = await getObjects();
//       setObjects(nextObjects);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : String(e));
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     let isActive = true;

//     const run = async () => {
//       setIsLoading(true);
//       setError(null);

//       try {
//         const nextObjects = await getObjects();
//         if (isActive) setObjects(nextObjects);
//       } catch (e) {
//         if (isActive) {
//           setError(e instanceof Error ? e.message : String(e));
//         }
//       } finally {
//         if (isActive) setIsLoading(false);
//       }
//     };

//     void run();

//     return () => {
//       isActive = false;
//     };
//   }, []);

//   const value = useMemo<ObjectsContextValue>(() => {
//     return {
//       objects,
//       objectsById,
//       isLoading,
//       error,
//       refetch,
//     };
//   }, [objects, objectsById, isLoading, error, refetch]);

//   return (
//     <ObjectsContext.Provider value={value}>{children}</ObjectsContext.Provider>
//   );
// }

// export function useObjects(): ObjectsContextValue {
//   const ctx = useContext(ObjectsContext);
//   if (!ctx) {
//     throw new Error("useObjects must be used within <ObjectsProvider>");
//   }
//   return ctx;
// }
