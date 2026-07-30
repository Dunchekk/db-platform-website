import { type FormEvent, useCallback, useEffect, useState } from "react";
import cls from "@/components/molecules/M_AdminOrdersWidget/M_AdminOrdersWidget.module.css";
import { useAuth } from "@/features/auth/auth.store";
import { getAdminOrders, retryOrderShipment } from "@/shared/api/adminOrders";
import M_Input from "@/components/molecules/M_Input/M_Input";
import A_Button from "@/components/atoms/A_Button/A_Button";
import A_Toast from "@/components/atoms/A_Toast/A_Toast";
import M_AdminOrdersTable from "@/components/molecules/M_AdminOrdersTable/M_AdminOrdersTable";
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
  const [totalPages, setTotalPages] = useState(0);
  const [limit] = useState(DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState<AdminOrderSortBy>("createdAt");
  const [sortDir, setSortDir] = useState<AdminOrderSortDir>("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [retryingShipmentOrderId, setRetryingShipmentOrderId] = useState<
    number | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"error" | "success" | "default">(
    "default"
  );

  const showToast = (
    message: string,
    type: "error" | "success" | "default"
  ) => {
    setToast(message);
    setToastType(type);
  };

  const applySort = (nextSortBy: AdminOrderSortBy) => {
    setPage(DEFAULT_PAGE);
    setSortBy(nextSortBy);
    setSortDir((prevSortDir) => {
      if (nextSortBy !== sortBy) {
        return "desc";
      }

      return prevSortDir === "desc" ? "asc" : "desc";
    });
  };

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
      setTotalPages(data.totalPages);
    } catch (e) {
      setOrders([]);
      setTotal(0);
      setTotalPages(0);
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
      setTotalPages(0);
      setSearch("");
      setSearchInput("");
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
  const canGoPrev = page > 1 && !isLoading;
  const canGoNext = page < totalPages && !isLoading;
  const sortDirLabel = sortDir === "asc" ? "(возр)" : "(уб)";

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(DEFAULT_PAGE);
    setSearch(searchInput.trim());
  };

  const resetSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(DEFAULT_PAGE);
  };

  const copyTrackingNumber = async (trackingNumber: string) => {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      showToast("Скопировано", "success");
    } catch {
      showToast("Не удалось скопировать", "error");
    }
  };

  const handleRetryShipment = async (orderId: number) => {
    setRetryingShipmentOrderId(orderId);

    try {
      await retryOrderShipment(orderId);
      showToast("Создание отправления запущено", "success");
      await loadOrders();
    } catch (e) {
      showToast("Не удалось перезапустить доставку", "error");
      console.error("не удалось перезапустить доставку:", e);
    } finally {
      setRetryingShipmentOrderId(null);
    }
  };

  return (
    <>
      {isOpen ? (
        <div className={cls.modal} onClick={() => setIsOpen(false)}>
          <section
            className={cls.panel}
            onClick={(event) => event.stopPropagation()}
            aria-label="Заказы"
          >
            <form className={cls.toolbar} onSubmit={handleSearchSubmit}>
              <M_Input
                placeholder="поиск по заказам"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className={cls.search}
              />
              <div className={cls.toolbarButtons}>
                <A_Button type="submit" disabled={isLoading}>
                  найти
                </A_Button>
                <A_Button
                  type="button"
                  disabled={isLoading && !search}
                  onClick={resetSearch}
                >
                  сбросить
                </A_Button>
              </div>
            </form>

            <div className={cls.meta}>
              <span>{title}</span>
              {search ? <span>поиск: {search}</span> : null}
            </div>

            <M_AdminOrdersTable
              orders={orders}
              isLoading={isLoading}
              sortBy={sortBy}
              sortDirLabel={sortDirLabel}
              retryingShipmentOrderId={retryingShipmentOrderId}
              onSort={applySort}
              onCopyTrackingNumber={copyTrackingNumber}
              onRetryShipment={handleRetryShipment}
            />

            <div className={cls.pagination}>
              <A_Button
                type="button"
                disabled={!canGoPrev}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                назад
              </A_Button>
              <span>
                {page} / {Math.max(totalPages, 1)}
              </span>
              <A_Button
                type="button"
                disabled={!canGoNext}
                onClick={() => setPage((prev) => prev + 1)}
              >
                вперед
              </A_Button>
            </div>
          </section>
        </div>
      ) : null}

      <div className={cls.controls}>
        <button
          type="button"
          className={[cls.orders, isOpen ? cls.open : ""].join(" ")}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Закрыть заказы" : "Открыть заказы"}
          aria-expanded={isOpen}
          title={title}
        >
          {isOpen ? "X " + buttonLabel : buttonLabel}
        </button>
      </div>

      {toast ? (
        <A_Toast
          type={toastType}
          message={toast}
          className={cls.toast}
          onClose={() => setToast(null)}
        />
      ) : null}
    </>
  );
}
