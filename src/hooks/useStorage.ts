import type { CommonStatus } from "@shared/model";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";

type Selector<T, Args extends any[] = []> = (...args: Args) => Promise<T> | T;

const isDev = () => import.meta.env.DEV;

const isValidQuery = <T>(query: Selector<T>) => {
  const isValid = query.name.startsWith("get");
  if (!isValid && isDev()) {
    console.warn(`Функция [${query.name}] должна начинаться на get и не должен мутировать данные`);
  }
  return isValid;
};

export function useStorageQuery<T, Args extends any[]>(query: Selector<T, Args>, args: Args, deps: Array<any> = []) {
  const [status, setStatus] = useState<CommonStatus>("idle");
  const data = useLiveQuery(async () => {
    try {
      setStatus("loading");
      isValidQuery(query);
      const res = await query(...args);
      setStatus("success");
      return res;
    } catch (err) {
      setStatus("error");
      throw err;
    }
  }, [...args, ...deps]);

  const isLoading = status === "loading";
  const isError = status === "error";
  const isSuccess = status === "success" && data !== undefined;

  return {
    data,
    isLoading,
    isError,
    isSuccess,
  };
}

const isValidMutation = <T>(mutation: Selector<T>) => {
  const isValid =
    mutation.name.startsWith("set") || mutation.name.startsWith("update") || mutation.name.startsWith("delete") || mutation.name.startsWith("save");
  if (!isValid && isDev()) {
    console.warn(`Функция [${mutation.name}] должна начинаться на set, update, save или delete и должна мутировать данные`);
  }
};

export function useStorageMutation<T, Args extends any[] = []>(mutation: Selector<T, Args>) {
  const [status, setStatus] = useState<CommonStatus>("idle");

  const handleMutation = async (...args: Args) => {
    try {
      setStatus("loading");
      isValidMutation(mutation);
      await mutation(...args);
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  const isLoading = status === "loading";
  const isError = status === "error";
  const isSuccess = status === "success";

  return [
    handleMutation,
    {
      isLoading,
      isError,
      isSuccess,
    },
  ] as const;
}
