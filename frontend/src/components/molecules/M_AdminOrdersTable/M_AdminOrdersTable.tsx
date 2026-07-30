import A_Button from "@/components/atoms/A_Button/A_Button";
import cls from "@/components/molecules/M_AdminOrdersTable/M_AdminOrdersTable.module.css";
import {
  canRetryAdminOrderShipment,
  formatAdminOrderDate,
  formatAdminOrderMoney,
} from "@/shared/helpers/adminOrdersView";
import type {
  AdminOrder,
  AdminOrderSortBy,
} from "@/shared/types/admin-orders.types";

type Props = {
  orders: AdminOrder[];
  isLoading: boolean;
  sortBy: AdminOrderSortBy;
  sortDirLabel: string;
  retryingShipmentOrderId: number | null;
  onSort: (sortBy: AdminOrderSortBy) => void;
  onCopyTrackingNumber: (trackingNumber: string) => void;
  onRetryShipment: (orderId: number) => void;
};

export default function M_AdminOrdersTable({
  orders,
  isLoading,
  sortBy,
  sortDirLabel,
  retryingShipmentOrderId,
  onSort,
  onCopyTrackingNumber,
  onRetryShipment,
}: Props) {
  return (
    <div className={cls.tableScroll}>
      <table className={cls.table}>
        <thead>
          <tr>
            <th>
              <button type="button" onClick={() => onSort("createdAt")}>
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
              <button type="button" onClick={() => onSort("total")}>
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
                  {formatAdminOrderDate(order.createdAt)}
                </span>
              </td>
              <td title="статус заказа">{order.status}</td>
              <td>
                <span title="клиент">
                  {order.lastName} {order.firstName} {order.patronymic ?? ""}
                </span>
                {order.comment ? (
                  <span className={cls.muted} title="комментарий клиента">
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
                  <span key={item.id} title="товар из корзины, его количество)">
                    -- {item.title} ({item.quantity})
                  </span>
                ))}
              </td>
              <td>
                <span title="город доставки">{order.deliveryCityLabel}</span>
                <span title="адрес пункта выдачи">
                  {order.deliveryOfficeAddress}
                </span>
                <span title="способ доставки">{order.deliveryMethod}</span>
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
                      onCopyTrackingNumber(order.shipment!.trackingNumber!)
                    }
                    title="скопировать трек-номер"
                  >
                    {order.shipment.trackingNumber}
                  </button>
                ) : null}
                {order.shipment?.providerShipmentId ? (
                  <span className={cls.muted} title="внутренний id доставки">
                    {order.shipment.providerShipmentId}
                  </span>
                ) : null}
                {canRetryAdminOrderShipment(order) ? (
                  <A_Button
                    type="button"
                    disabled={retryingShipmentOrderId === order.id}
                    onClick={() => onRetryShipment(order.id)}
                  >
                    {retryingShipmentOrderId === order.id
                      ? "запуск..."
                      : "повторить"}
                  </A_Button>
                ) : null}
              </td>
              <td className={cls.unlimitedCell}>
                <span title="итоговая сумма заказа">
                  {formatAdminOrderMoney(order.total)}
                </span>
                <span title="стоимость товаров из корзины">
                  товары: {formatAdminOrderMoney(order.subtotal)}
                </span>
                <span title="стоимость доставки">
                  доставка: {formatAdminOrderMoney(order.deliveryPrice)}
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
  );
}
