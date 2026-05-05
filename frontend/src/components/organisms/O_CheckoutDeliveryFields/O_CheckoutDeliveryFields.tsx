import React, { useState } from "react";
import M_Input from "../../molecules/M_Input/M_Input";
import type { ComponentPropsWithoutRef } from "react";
import cls from "@/components/organisms/O_CheckoutDeliveryFields/O_CheckoutDeliveryFields.module.css";
import A_Button from "../../atoms/A_Button/A_Button";
import { getCities, getOffices } from "@/shared/api/cdek";
import { CdekOffice, CdekSuggestedCity } from "@/shared/types/cdek.types";

type Props = {
  isCartEmpty: boolean;
  showToast: (message: string, type: "default" | "success" | "error") => void;
} & ComponentPropsWithoutRef<"div">;

const O_CheckoutDeliveryFields = ({
  isCartEmpty,
  className,
  showToast,
  ...props
}: Props) => {
  const [isCitiesOpen, setIsCitiesOpen] = useState<boolean>(false);
  const [cities, setCities] = useState<CdekSuggestedCity[]>([]);

  const [selectedCity, setSelectedCity] = useState<CdekSuggestedCity | null>(
    null
  );
  const [queryCities, setQueryCities] = useState<string>("");

  const [offices, setOffices] = useState<CdekOffice[]>([]);
  const [isOfficesOpen, setIsOfficesOpen] = useState<boolean>(false);
  const [selectedOffice, setSelectedOffice] = useState<CdekOffice | null>(null);
  const [queryOffices, setQueryOffices] = useState<string>("");

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
  };

  const handleCityClick = async (city: CdekSuggestedCity) => {
    setSelectedCity(city);
    setQueryCities(city.label);
    const newOffices = await getOffices(city.code);
    setOffices(newOffices);
    setIsCitiesOpen(false);
  };

  const handleOfficeClick = async (office: CdekOffice) => {
    setSelectedOffice(office);
    setQueryOffices(office.location.address);
    setIsOfficesOpen(false);
  };

  const handleOfficeInputChange = async (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>
  ) => {
    setQueryOffices(e.target.value);
    const query = e.target.value.toLowerCase().trim();
    if (e.target.value.trim() === "" && selectedCity) {
      const newOffices = await getOffices(selectedCity.code);
      setOffices(newOffices);
      return;
    }

    const newOffices = offices.filter(
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
                return (
                  <li
                    key={office.code}
                    onClick={() => handleOfficeClick(office)}
                    className={cls.li}
                  >
                    {office.location.address}
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
            <span>адрес: {selectedOffice.location.address_full}</span> <br />
            <span>
              телефон:
              {selectedOffice.phones.map((phone) => phone.number).join(", ")}
            </span>
            <br />
            <span>время работы: {selectedOffice.work_time}</span>
            {selectedOffice.site && <span>сайт: {selectedOffice.site}</span>}
          </div>
        )}
      </div>

      <span className={cls.comment}>
        В данное время доступна только доставка СДЕК до постомата или ПВЗ
      </span>

      <span className={cls.dates}>сроки: ~от 2 до 5 дней</span>

      <span
        onMouseEnter={() => {
          if (isCartEmpty) {
            showToast("добавте что-то в корзину", "default");
          }
        }}
      >
        <A_Button className={cls.submit} type="submit" disabled={isCartEmpty}>
          {"————> оформить заказ"}
        </A_Button>
      </span>
    </div>
  );
};

export default O_CheckoutDeliveryFields;
