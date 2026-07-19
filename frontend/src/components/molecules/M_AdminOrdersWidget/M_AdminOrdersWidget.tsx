import { useCallback, useEffect, useState } from "react";
import cls from "@/components/molecules/M_AdminOrdersWidget/M_AdminOrdersWidget.module.css";
import { useAuth } from "@/features/auth/auth.store";
import { getAdminOrders } from "@/shared/api/adminOrders";
import {
  AdminOrder,
  AdminOrderSortBy,
  AdminOrderSortDir,
} from "@/shared/types/admin-orders.types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export default function M_AdminOrdersWidget() {
  const isAuth = useAuth((state) => state.isAuth);

  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit] = useState(DEFAULT_LIMIT);
  const [search] = useState("");
  const [sortBy] = useState<AdminOrderSortBy>("createdAt");
  const [sortDir] = useState<AdminOrderSortDir>("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAdminOrders({
        page,
        limit,
        search,
        sortBy,
        sortDir,
      });

      setOrders(data.items);
      setTotal(data.total);
      setPage(data.page);
    } catch (e) {
      setOrders([]);
      setTotal(0);
      setError(e instanceof Error ? e.message : "не удалось загрузить заказы");
    } finally {
      setIsLoading(false);
    }
  }, [limit, page, search, sortBy, sortDir]);

  useEffect(() => {
    if (!isAuth) {
      setIsOpen(false);
      setOrders([]);
      setTotal(0);
      setError(null);
      setPage(DEFAULT_PAGE);
      return;
    }

    loadOrders();
  }, [isAuth, loadOrders]);

  if (!isAuth) {
    return null;
  }

  const buttonLabel = isLoading ? "заказы(...)" : `заказы(${total})`;
  const loadedCount = orders.length;
  const title = error
    ? `ошибка: ${error}`
    : `загружено ${loadedCount} из ${total}`;

  return (
    <div className={cls.controls}>
      {isOpen ? (
        <button
          type="button"
          className={cls.close}
          onClick={() => setIsOpen(false)}
          aria-label="Закрыть заказы"
        >
          X
        </button>
      ) : null}
      <button
        type="button"
        className={[cls.orders, isOpen ? cls.open : ""].join(" ")}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Открыть заказы"
        aria-expanded={isOpen}
        title={title}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
