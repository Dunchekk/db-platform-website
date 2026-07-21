import { type FormEvent, useCallback, useEffect, useState } from "react";
import cls from "@/components/molecules/M_AdminOrdersWidget/M_AdminOrdersWidget.module.css";
import { useAuth } from "@/features/auth/auth.store";
import { getAdminOrders } from "@/shared/api/adminOrders";
import M_Input from "@/components/molecules/M_Input/M_Input";
import A_Button from "@/components/atoms/A_Button/A_Button";
import A_Toast from "@/components/atoms/A_Toast/A_Toast";
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
      showToast("скопировано!", "success");
    } catch {
      showToast("не удалось скопировать", "error");
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

            <div className={cls.tableScroll}>
              <table className={cls.table}>
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        onClick={() => applySort("createdAt")}
                      >
                        дата {sortBy === "createdAt" ? sortDirLabel : ""}
                      </button>
                    </th>
                    <th>статус</th>
                    <th>клиент</th>
                    <th className={cls.unlimitedCell}>контакты</th>
                    <th className={cls.unlimitedCell}>состав</th>
                    <th>доставка</th>
                    <th>оплата</th>
                    <th>трек-номер</th>
                    <th className={cls.unlimitedCell}>
                      <button type="button" onClick={() => applySort("total")}>
                        сумма {sortBy === "total" ? sortDirLabel : ""}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span title="внутренний номер заказа">#{order.id}</span>
                        <span title="дата создания заказа">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td title="статус заказа">{order.status}</td>
                      <td>
                        <span title="клиент">
                          {order.lastName} {order.firstName}{" "}
                          {order.patronymic ?? ""}
                        </span>
                        {order.comment ? (
                          <span
                            className={cls.muted}
                            title="комментарий клиента"
                          >
                            {order.comment}
                          </span>
                        ) : null}
                      </td>
                      <td className={cls.unlimitedCell}>
                        <span title="email клиента">{order.email}</span>
                        <span title="телефон клиента">{order.phone}</span>
                        {order.telegram ? (
                          <span className={cls.muted} title="Telegram клиента">
                            {order.telegram} (tg)
                          </span>
                        ) : null}
                      </td>
                      <td className={cls.unlimitedCell}>
                        {order.items.map((item) => (
                          <span
                            key={item.id}
                            title="товар из корзины, его количество)"
                          >
                            -- {item.title} ({item.quantity})
                          </span>
                        ))}
                      </td>
                      <td>
                        <span title="город доставки">
                          {order.deliveryCityLabel}
                        </span>
                        <span title="адрес пункта выдачи">
                          {order.deliveryOfficeAddress}
                        </span>
                        <span title="способ доставки">
                          {order.deliveryMethod}
                        </span>
                      </td>
                      <td>
                        <span title="статус оплаты">
                          {order.currentPayment?.status ?? "нет"}
                        </span>
                        {order.currentPayment?.providerPaymentId ? (
                          <span title="id платежа в ЮKassa">
                            {order.currentPayment.providerPaymentId}
                          </span>
                        ) : null}
                      </td>
                      <td>
                        <span title="статус доставки">
                          {order.shipment?.status ?? "нет"}
                        </span>
                        {order.shipment?.trackingNumber ? (
                          <button
                            type="button"
                            className={cls.copyValue}
                            onClick={() =>
                              copyTrackingNumber(
                                order.shipment!.trackingNumber!
                              )
                            }
                            title="скопировать трек-номер"
                          >
                            {order.shipment.trackingNumber}
                          </button>
                        ) : null}
                        {order.shipment?.providerShipmentId ? (
                          <span
                            className={cls.muted}
                            title="внутренний id доставки"
                          >
                            {order.shipment.providerShipmentId}
                          </span>
                        ) : null}
                      </td>
                      <td className={cls.unlimitedCell}>
                        <span title="итоговая сумма заказа">
                          {formatMoney(order.total)}
                        </span>
                        <span title="стоимость товаров из корзины">
                          товары: {formatMoney(order.subtotal)}
                        </span>
                        <span title="стоимость доставки">
                          доставка: {formatMoney(order.deliveryPrice)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} title="результаты таблицы заказов">
                        заказы не найдены
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return `${value}\u00A0₽`;
}
