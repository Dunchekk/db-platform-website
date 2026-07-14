import React, { useState } from "react";
import M_Input from "../../molecules/M_Input/M_Input";
import type { ComponentPropsWithoutRef } from "react";
import cls from "@/components/organisms/O_CheckoutDeliveryFields/O_CheckoutDeliveryFields.module.css";
import A_Button from "../../atoms/A_Button/A_Button";
import { getCities, getOffices } from "@/shared/api/cdek";
import {
  CdekOffice,
  CdekPackageParams,
  CdekSuggestedCity,
} from "@/shared/types/cdek.types";
import { useCheckoutFormInputs } from "@/features/checkout/formData.store";
import { getDeliveryPrice } from "@/shared/api/cdek";

type Props = {
  cartPackageParams: CdekPackageParams;
  isCartEmpty: boolean;
  isSubmitting: boolean;
  showToast: (message: string, type: "default" | "success" | "error") => void;
} & ComponentPropsWithoutRef<"div">;

const O_CheckoutDeliveryFields = ({
  cartPackageParams,
  isCartEmpty,
  className,
  isSubmitting,
  showToast,
  ...props
}: Props) => {
  // зустанд
  const setField = useCheckoutFormInputs((state) => state.setField);
  const selectedCity = useCheckoutFormInputs((state) => state.form.city);
  const selectedOffice = useCheckoutFormInputs((state) => state.form.office);

  const [isCitiesOpen, setIsCitiesOpen] = useState<boolean>(false);
  const [cities, setCities] = useState<CdekSuggestedCity[]>([]);

  const [minPeriod, setMinPeriod] = useState<number>(null);
  const [maxPeriod, setMaxPeriod] = useState<number>(null);

  const [queryCities, setQueryCities] = useState<string>(
    selectedCity?.label || ""
  );

  const [offices, setOffices] = useState<CdekOffice[]>([]);
  const [isOfficesOpen, setIsOfficesOpen] = useState<boolean>(false);
  const [queryOffices, setQueryOffices] = useState<string>(
    selectedOffice?.location?.address || ""
  );

  const hasValidPackageParams =
    cartPackageParams.weight > 0 &&
    cartPackageParams.length > 0 &&
    cartPackageParams.width > 0 &&
    cartPackageParams.height > 0;

  const loadOffices = async (cityCode: number): Promise<CdekOffice[]> => {
    if (!hasValidPackageParams) {
      showToast("не удалось посчитать параметры упаковки заказа", "error");
      return [];
    }

    try {
      return await getOffices(cityCode, cartPackageParams);
    } catch (e) {
      if (e instanceof Error) {
        showToast(`ошибка при загрузке пунктов выдачи: ${e.message}`, "error");
      }

      console.log(e);
      return [];
    }
  };

  const handleCityInputChange = async (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>
  ) => {
    const value = e.target.value.trim();
    setQueryCities(e.target.value);

    if (value.length < 2) {
      setCities([]);
      return;
    }

    let newCities: CdekSuggestedCity[] = [];
    try {
      newCities = await getCities(value);
    } catch (e) {
      showToast(`Ошибка при загрузке городов: ${e.message}`, "error");
    }
    setCities(newCities);
    setField("city", null);
    setField("office", null);
    setField("deliveryPrice", null);
    setMinPeriod(null);
    setMaxPeriod(null);
  };

  const handleCityClick = async (city: CdekSuggestedCity) => {
    setField("city", city);
    setQueryCities(city.label);
    const newOffices = await loadOffices(city.code);
    setOffices(newOffices);
    setField("office", null);
    setQueryOffices("");
    setIsCitiesOpen(false);
  };

  const handleOfficeClick = async (office: CdekOffice) => {
    setField("office", office);

    if (!selectedCity) {
      showToast("укажите город для получения", "error");
      return;
    }

    if (!hasValidPackageParams) {
      showToast("не удалось посчитать параметры упаковки заказа", "error");
      return;
    }

    try {
      const priceResponse = await getDeliveryPrice(
        selectedCity.code,
        cartPackageParams.weight
      );
      setField("deliveryPrice", priceResponse.delivery_sum);
      setMinPeriod(priceResponse.period_min);
      setMaxPeriod(priceResponse.period_max);
      setQueryOffices(office.location.address);
      setIsOfficesOpen(false);
    } catch (e) {
      if (e instanceof Error) {
        showToast(`ошибка загрузки цены доставки: ${e.message}`, "error");
      }
      console.log(e);
    }
  };

  const handleOfficeInputChange = async (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>
  ) => {
    setQueryOffices(e.target.value);

    if (!selectedCity) {
      showToast("укажите город для получения", "error");
      return;
    }

    const query = e.target.value.toLowerCase().trim();
    if (e.target.value.trim() === "" && selectedCity) {
      const newOffices = await loadOffices(selectedCity.code);
      setOffices(newOffices);
      return;
    }
    const allOffices = await loadOffices(selectedCity.code);
    const newOffices = allOffices.filter(
      (office) =>
        office.location?.address?.toLowerCase().includes(query) ||
        office.nearest_metro_station?.toLowerCase().includes(query)
    );

    setOffices(newOffices);
  };

  return (
    <div className={className} {...props}>
      <p>доставка:</p>

      <div>
        <M_Input
          placeholder="город*"
          onChange={handleCityInputChange}
          value={queryCities}
          onFocus={() => setIsCitiesOpen(true)}
        />

        {isCitiesOpen && cities.length !== 0 && (
          <div className={cls.list}>
            <ul className={cls.ul}>
              {cities.map((city) => {
                return (
                  <li
                    key={city.code}
                    onClick={() => handleCityClick(city)}
                    className={cls.li}
                  >
                    {city.label}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div>
        <M_Input
          placeholder="пункт получения*"
          onChange={handleOfficeInputChange}
          value={queryOffices}
          onFocus={() => setIsOfficesOpen(true)}
        />

        {isOfficesOpen && offices.length !== 0 && (
          <div className={cls.list}>
            <ul className={cls.ul}>
              {offices.map((office) => {
                const officeAddress = office.location?.address;

                if (!officeAddress) {
                  return null;
                }

                return (
                  <li
                    key={office.code}
                    onClick={() => handleOfficeClick(office)}
                    className={cls.li}
                  >
                    {officeAddress}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {selectedOffice && !isOfficesOpen && (
          <div className={cls.office}>
            <span className={cls.dotted}>
              выбран {selectedOffice.type === "PVZ" ? "ПВЗ" : "Постомат"} ↓
            </span>
            <br /> <br />
            <span>
              адрес: {selectedOffice.location.address_full || "Адрес не указан"}
            </span>{" "}
            <br />
            <span>
              телефон:
              {selectedOffice.phones.map((phone) => phone.number).join(", ")}
            </span>
            <br />
            <span>
              время работы:{" "}
              {selectedOffice.work_time || "Расписание не указано"}
            </span>
            {selectedOffice.site && (
              <span>
                <br />
                сайт: {selectedOffice.site}
              </span>
            )}
          </div>
        )}
      </div>

      <span className={cls.comment}>
        В данное время доступна только доставка СДЕК до постомата или ПВЗ
      </span>

      {minPeriod && maxPeriod && (
        <span className={cls.dates}>
          сроки: ~от {minPeriod} до {maxPeriod} дней
        </span>
      )}

      <span
        onMouseEnter={() => {
          if (isCartEmpty) {
            showToast("добавте что-то в корзину", "default");
          }
        }}
      >
        <A_Button
          className={cls.submit}
          type="submit"
          disabled={isCartEmpty || isSubmitting}
        >
          {"————> оформить заказ"}
        </A_Button>
      </span>
    </div>
  );
};

export default O_CheckoutDeliveryFields;
