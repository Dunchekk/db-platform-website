export type CdekTokenResponse = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  scope?: string;
};

export type CdekSuggestedCityDto = {
  city_uuid: string;
  code: number;
  full_name: string;
  country_code: string;
};

export type NormalizedCdekSuggestedCityDto = {
  uuid: string;
  code: number;
  label: string;
  countryCode: string;
}[];

export type CdekPhoneDto = {
  number: string;
  additional: string;
};

export type CdekOfficeWorkTimeDto = {
  day: number; // Порядковый номер дня начиная с единицы. Понедельник = 1, воскресенье = 7.
  time: string; // Период работы в эти дни. Если в этот день не работают, то не отображается.
};

export type CdekOfficeWorkTimeExceptionDto = {
  date_start: string;
  date_end: string;
  time_start: string;
  time_end: string;
  is_working: boolean;
};

export type CdekOfficeImageDto = {
  number: null;
  url: string;
};

export type CdekOfficeCellDimensionsDto = {
  width: number;
  height: number;
  depth: number;
};

export type CdekErrorDto = {
  code: number;
  additional_code: number;
  message: string;
};

export type CdekWarningDto = {
  code: number;
  message: string;
};

export type CdekOfficeLocationDto = {
  // Информация об офисе
  country_code: string;
  region_code: number;
  region: string;
  city_code: number;
  city: string;
  fias_guid?: unknown;
  postal_code?: string;
  longitude: unknown; // Долгота
  latitude: unknown; // Широта
  address: string; // Строка адреса
  address_full: string; // Полный адрес с указанием страны, региона, города, и т.д.
  city_uuid: unknown; // Идентификатор города в ИС СДЭК
};

export type CdekSuggestedOfficesDto = {
  code: string; // Код ПВЗ
  uuid: string; // Идентификатор офиса в ИС СДЭК
  address_comment?: string; // Описание местоположения
  nearest_station?: string;
  nearest_metro_station?: string;
  work_time: string; // Режим работы, строка вида «пн-пт 9-18, сб 9-16»
  phones: CdekPhoneDto[];
  email?: string;
  note?: string;
  type: null | "PVZ" | "POSTAMAT" | "ALL"; // PVZ — склад СДЭК, POSTAMAT — постамат СДЭК
  owner_code: string; // Принадлежность офиса компании
  take_only: boolean; // Является ли офис только пунктом выдачи или также осуществляет приём грузов
  is_handout: boolean; // Является пунктом выдачи
  is_reception: boolean; // Является пунктом приёма
  is_dressing_room: boolean; // Есть ли примерочная
  is_marketplace?: boolean;
  is_ltl?: boolean;
  have_cashless: boolean; // Есть безналичный расчет
  have_cash: boolean; // Есть приём наличных
  have_fast_payment_system: boolean; // Есть безналичный расчёт по СБП
  allowed_cod: boolean; // Разрешен наложенный платеж в ПВЗ
  site?: string; // Ссылка на данный офис на сайте СДЭК
  office_image_list?: CdekOfficeImageDto[];
  work_time_list: CdekOfficeWorkTimeDto[];
  work_time_exception_list?: CdekOfficeWorkTimeExceptionDto[];
  weight_min?: number; // Минимальный вес (в кг.), принимаемый в ПВЗ (> WeightMin)
  weight_max?: number; // Максимальный вес (в кг.), принимаемый в ПВЗ (<=WeightMax)
  dimensions?: CdekOfficeCellDimensionsDto[];
  errors: CdekErrorDto[];
  warnings: CdekWarningDto[];
  location: CdekOfficeLocationDto;
  distance: unknown; // Расстояние до точки, от которой производился поиск ближайшего ПВЗ
  ltl_acceptance_partners: unknown; // Принимает заказы LTL, которые будут доставляться партнерами
  ltl_issuance_partners: unknown; // Выдает заказы LTL, которые были доставлены партнерами
  fulfillment: unknown; // Работает ли офис с "Фулфилмент. Приход": «1», «true» - да; «0», «false» - нет.
  length_max: number; // Максимальная длина грузоместа в см, которую может принять офис
  width_max: number; // Максимальная ширина грузоместа в см, которую может принять офис
  height_max: number; // Максимальная высота грузоместа в см, которую может принять офис
};

export type CdekPackageDto = {
  weight: number;
  length?: number;
  width?: number;
  height?: number;
};

export type CdekOfficeLookupPackageParams = {
  weight: number;
  length: number;
  width: number;
  height: number;
};

/**
 * Запрос на получение цены доставки
 */
export type CdekSuggestDeliveryPriceBodySchema = {
  date?: string;
  type?: 1 | 2;
  currency?: 1;
  lang?: string;
  tariff_code: number;
  from_location: {
    code: number;
  };
  to_location: {
    code: number;
  };
  packages: CdekPackageDto[];
};

/**
 * Результат расчета стоимости доставки
 */
export type DeliveryCalculationResponse = {
  /** Стоимость доставки */
  delivery_sum: number;

  /** Минимальное время доставки (в рабочих днях) */
  period_min: number;

  /** Максимальное время доставки (в рабочих днях) */
  period_max: number;

  /** Минимальное время доставки (в календарных днях) */
  calendar_min?: number;

  /** Максимальное время доставки (в календарных днях) */
  calendar_max?: number;

  /** Расчетный вес (в граммах) */
  weight_calc: number;

  /** Дополнительные услуги */
  services?: CalcResponseAdditionalServiceDto[];

  /** Стоимость доставки с учетом дополнительных услуг */
  total_sum: number;

  /** Валюта, в которой рассчитана стоимость доставки (код СДЭК) */
  currency: string;

  /** Список ошибок */
  errors?: ErrorDto[];

  /** Список предупреждений */
  warnings?: WarningDto[];

  /** Прогнозируемый диапазон дат доставки */
  delivery_date_range?: DeliveryDateRangeDto;
};

/** Дополнительные услуги */
interface CalcResponseAdditionalServiceDto {
  code: string;
  sum: number;
  [key: string]: any;
}

/** Ошибка */
interface ErrorDto {
  code: string;
  message: string;
}

/** Предупреждение */
interface WarningDto {
  code: string;
  message: string;
}

/** Диапазон дат доставки */
interface DeliveryDateRangeDto {
  date_min?: string;
  date_max?: string;
}

export type normalizedDeliveryInfo = {
  delivery_sum: number;
  period_min: number;
  period_max: number;
  currency: string;
};

// from frontend
export type CdekOfficeFromFront = {
  code: string;
  uuid: string;
  address_comment?: string;
  nearest_metro_station?: string;
  work_time: string;
  phones: CdekPhoneDto[];
  type: null | "PVZ" | "POSTAMAT" | "ALL";
  site?: string;
  work_time_list: CdekOfficeWorkTimeDto[];
  work_time_exception_list?: CdekOfficeWorkTimeExceptionDto[];
  location: CdekOfficeLocationDto;
};

export type CdekSuggestedCityFromFront = {
  uuid: string;
  code: number;
  label: string;
  countryCode: string;
};

export type CdekCreatingOrderBody = {
  type?: 1 | 2; // 1 -- ИМ, 2 -- доставка
  additional_order_types?: []; // могут быть другие
  number?: string; // внутренний для ИС номер заказа
  accompanying_number?: string; // номер СНТ
  tariff_code: number; // код тарифа
  comment?: string;
  shipment_point?: string;
  delivery_point?: string;
  date_invoice?: null;
  shipper_name?: string;
  shipper_address?: string;
  delivery_recipient_cost?: {
    value?: number; // доп. сбор за доставку с получателя
    vat_sum?: number;
    vat_rate?: number;
  };
  delivery_recipient_cost_adv?: [
    {
      threshold?: number; // порог стоимости заказа
      sum?: number; // доп. сбор при достижении порога
      vat_sum?: number;
      vat_rate?: number;
    },
  ];
  sender?: {
    company?: string;
    name?: string;
    contragent_type?: "LEGAL_ENTITY";
    passport_series?: string;
    passport_number?: string;
    passport_date_of_issue?: null;
    passport_organization?: string;
    tin?: string;
    passport_date_of_birth?: null;
    email?: string;
    phones?: [
      {
        number?: string;
        additional?: string;
      },
    ];
  };
  seller?: {
    name?: string;
    inn?: string;
    phone?: string;
    ownership_form?: null;
    address?: string;
  };
  recipient: {
    company?: string;
    name: string;
    contragent_type?: string;
    passport_series?: string;
    passport_number?: string;
    passport_date_of_issue?: null;
    passport_organization?: string;
    tin?: string;
    passport_date_of_birth?: null;
    email?: string;
    phones: [
      {
        number: string;
        additional?: string;
      },
    ];
  };
  from_location?: {
    code?: number; // код населенного пункта СДЭК
    city_uuid?: null;
    city?: string;
    fias_guid?: null;
    kladr_code?: string;
    country_code?: string;
    country?: null;
    region?: string;
    region_code?: number;
    fias_region_guid?: null;
    sub_region?: string;
    longitude?: number;
    latitude?: number;
    time_zone?: number;
    payment_limit?: number;
    address: string;
    postal_code?: string;
  };
  to_location?: {
    code?: number; // код населенного пункта СДЭК
    city_uuid?: null;
    city?: string;
    fias_guid?: null;
    kladr_code?: string;
    country_code?: string;
    country?: null;
    region?: string;
    region_code?: number;
    fias_region_guid?: null;
    sub_region?: string;
    longitude?: number;
    latitude?: number;
    time_zone?: number;
    payment_limit?: number;
    address: string;
    postal_code?: string;
  };
  services?: [
    {
      code?: string;
      parameter?: number;
    },
  ];
  packages: [
    {
      number: string;
      weight: number; // общий вес упаковки в граммах
      length?: number;
      width?: number;
      height?: number;
      comment?: string;
      items: [
        {
          name: string;
          ware_key: string;
          marking: null;
          payment: {
            value: number; // стоимость единицы товарного вложения
            vat_sum?: number;
            vat_rate?: number;
          };
          weight: number; // вес единицы товара в граммах
          weight_gross?: number;
          amount: number; // количество единиц товара
          name_i18n?: string;
          brand?: string;
          country_code?: string;
          material?: null;
          wifi_gsm?: null;
          url?: string;
          seller?: {
            name?: string;
            inn?: string;
            phone?: string;
            ownership_form?: null;
            address?: string;
            giis_subdivision_id?: null;
          };
          cost: number; // объявленная стоимость товара
          feacn_code?: string;
          jewel_uin?: null;
          used?: null;
        },
      ];
      package_id: null;
    },
  ];
  delivery_types?: [null];
  print?: "WAYBILL" | "BARCODE";
  widgetToken?: null;
  is_client_return?: null;
  has_reverse_order?: null;
  developer_key?: null;
};

export type CdekOrderStatusCode =
  | "ACCEPTED"
  | "CREATED"
  | "REMOVED"
  | "RECEIVED_AT_SHIPMENT_WAREHOUSE"
  | "DELIVERED"
  | "NOT_DELIVERED"
  | "READY_FOR_SHIPMENT_IN_SENDER_CITY"
  | "TAKEN_BY_TRANSPORTER_FROM_SENDER_CITY"
  | "SENT_TO_RECIPIENT_CITY"
  | "ACCEPTED_IN_RECIPIENT_CITY"
  | "ACCEPTED_AT_RECIPIENT_CITY_WAREHOUSE"
  | "TAKEN_BY_COURIER"
  | "ACCEPTED_AT_PICK_UP_POINT"
  | "ACCEPTED_AT_TRANSIT_WAREHOUSE"
  | "RETURNED_TO_SENDER_CITY_WAREHOUSE"
  | "RETURNED_TO_TRANSIT_WAREHOUSE"
  | "RETURNED_TO_RECIPIENT_CITY_WAREHOUSE"
  | "READY_FOR_SHIPMENT_IN_TRANSIT_CITY"
  | "TAKEN_BY_TRANSPORTER_FROM_TRANSIT_CITY"
  | "SENT_TO_TRANSIT_CITY"
  | "ACCEPTED_IN_TRANSIT_CITY"
  | "SENT_TO_SENDER_CITY"
  | "ACCEPTED_IN_SENDER_CITY"
  | "ENTERED_TO_TRANSIT_WAREHOUSE"
  | "ENTERED_TO_RECIPIENT_CITY_WAREHOUSE"
  | "ENTERED_TO_PICK_UP_POINT"
  | "IN_CUSTOMS_INTERNATIONAL"
  | "SHIPPED_TO_DESTINATION"
  | "PASSED_TO_TRANSIT_CARRIER"
  | "IN_CUSTOMS_LOCAL"
  | "CUSTOMS_COMPLETE"
  | "POSTOMAT_POSTED"
  | "POSTOMAT_SEIZED"
  | "POSTOMAT_RECEIVED"
  | "INVALID";

export type cdekShipmentResponce = {
  entity?: {
    uuid: string; // (! required !) идентификатор заказа в ИС СДЭК
    type: 1 | 2; // (! required !) тип заказа: 1 -- ИМ, 2 -- доставка
    additional_order_types?: number[]; // дополнительные типы заказа
    is_return: boolean; // (! required !) признак возвратного заказа
    is_reverse: boolean; // (! required !) признак реверсного заказа
    cdek_number?: number; // номер заказа СДЭК
    number?: string; // номер заказа в ИС клиента
    accompanying_number?: string; // номер сопроводительной накладной на товар
    accompanying_waybill?: {
      client_name?: string;
      flight_number?: string;
      air_waybill_numbers?: string[];
      vehicle_numbers?: string[];
      vehicle_driver?: string;
      planned_departure_date_time?: string;
    };
    tariff_code: number; // (! required !) код тарифа
    comment?: string;
    shipment_point?: string;
    delivery_point?: string;
    date_invoice?: string;
    keep_free_until?: string;
    shipper_name?: string;
    shipper_address?: string;
    delivery_recipient_cost?: {
      value?: number; // доп. сбор за доставку с получателя
      vat_sum?: number;
      vat_rate?: number;
    };
    delivery_recipient_cost_adv?: [
      {
        threshold?: number; // порог стоимости заказа
        sum?: number; // доп. сбор при достижении порога
        vat_sum?: number;
        vat_rate?: number;
      },
    ];
    sender: {
      // (! required !) объект отправителя
      company?: string;
      name: string; // (! required !) ФИО контактного лица отправителя
      contragent_type?: "LEGAL_ENTITY" | "INDIVIDUAL";
      passport_series?: string;
      passport_number?: string;
      passport_date_of_issue?: string;
      passport_organization?: string;
      tin?: string;
      passport_date_of_birth?: string;
      email?: string;
      phones?: [
        {
          number?: string;
          additional?: string;
        },
      ];
      passport_requirements_satisfied?: boolean;
    };
    seller?: {
      name?: string;
      inn?: string;
      phone?: string;
      ownership_form?: string;
      address?: string;
    };
    recipient: {
      // (! required !) объект получателя
      company?: string;
      name: string; // (! required !) ФИО контактного лица получателя
      contragent_type?: "LEGAL_ENTITY" | "INDIVIDUAL";
      passport_series?: string;
      passport_number?: string;
      passport_date_of_issue?: string;
      passport_organization?: string;
      tin?: string;
      passport_date_of_birth?: string;
      email?: string;
      phones?: [
        {
          number?: string;
          additional?: string;
        },
      ];
      passport_requirements_satisfied?: boolean;
    };
    from_location: {
      // (! required !) локация отправления
      code: number; // (! required !) код населенного пункта СДЭК
      city_uuid?: string;
      city: string; // (! required !) город отправления
      fias_guid?: string;
      kladr_code?: string;
      country_code?: string;
      country?: string;
      region?: string;
      region_code?: number;
      fias_region_guid?: string;
      kladr_region_code?: string;
      sub_region?: string;
      longitude?: number;
      latitude?: number;
      time_zone?: string;
      payment_limit?: number;
      address?: string;
      postal_code?: string;
    };
    to_location?: {
      code?: number; // код населенного пункта СДЭК
      city_uuid?: string;
      city?: string;
      fias_guid?: string;
      kladr_code?: string;
      country_code?: string;
      country?: string;
      region?: string;
      region_code?: number;
      fias_region_guid?: string;
      kladr_region_code?: string;
      sub_region?: string;
      longitude?: number;
      latitude?: number;
      time_zone?: string;
      payment_limit?: number;
      address?: string;
      postal_code?: string;
    };
    services?: [
      {
        code?: string;
        parameter?: string | number;
      },
    ];
    delivery_mode?: 1 | 2 | 3 | 4 | 6 | 7 | 8 | 9 | 10 | 11;
    has_reverse_order?: boolean;
    delay_reasons?: [
      {
        date?: string;
        reason?: string;
      },
    ];
    delivery_types?: number[];
    planned_delivery_date?: string;
    delivery_detail?: {
      delivery_sum?: number;
      total_sum?: number;
      payment_sum?: number;
      vat_rate?: number;
      vat_sum?: number;
    };
    delivery_problem?: [
      {
        code?: string;
        create_date?: string;
        message?: string;
      },
    ];
    calls?: {
      failed_calls?: [
        {
          date_time?: string;
          reason_code?: string;
        },
      ];
      rescheduled_calls?: [
        {
          date_time?: string;
          date_next?: string;
          time_next?: string;
          comment?: string;
        },
      ];
    };
    packages: [
      {
        // (! required !) упаковка заказа
        number: string; // (! required !) номер упаковки
        weight: number; // (! required !) общий вес упаковки в граммах
        length?: number;
        width?: number;
        height?: number;
        comment?: string;
        items?: [
          {
            name?: string;
            ware_key?: string;
            marking?: string;
            payment?: {
              value?: number; // стоимость единицы товарного вложения
              vat_sum?: number;
              vat_rate?: number;
            };
            weight?: number; // вес единицы товара в граммах
            weight_gross?: number;
            amount?: number; // количество единиц товара
            name_i18n?: string;
            brand?: string;
            country_code?: string;
            material?: string;
            wifi_gsm?: string;
            url?: string;
            seller?: {
              name?: string;
              inn?: string;
              phone?: string;
              ownership_form?: string;
              address?: string;
              giis_subdivision_id?: string;
            };
            cost?: number; // объявленная стоимость товара
            feacn_code?: string;
            item_id?: string;
            itemId?: string;
            jewel_uin?: string;
            used?: boolean;
          },
        ];
        package_id?: string;
      },
    ];
    statuses?: [
      {
        code?: CdekOrderStatusCode;
        name?: string;
        date_time?: string;
        reason_code?: string;
        city?: string;
        city_uuid?: string;
        deleted?: boolean;
      },
    ];
    is_client_return: boolean; // (! required !) признак клиентского возврата
    developer_key?: string;
  };
  requests: [
    // (! required !) список запросов к API по заказу
    {
      request_uuid?: string;
      type: string; // (! required !) тип запроса к API
      date_time: string; // (! required !) дата и время создания запроса
      state: string; // (! required !) состояние обработки запроса
      errors?: CdekErrorDto[];
      warnings?: CdekWarningDto[];
    },
  ];
  related_entities?: [
    {
      uuid: string; // (! required !) идентификатор связанной сущности
      type:
        | "return_order"
        | "direct_order"
        | "client_return_order"
        | "client_direct_order"
        | "waybill"
        | "barcode"
        | "reverse_order"
        | "delivery"; // (! required !) тип связанной сущности
      url?: string;
      create_time?: string;
      cdek_number?: number;
      date?: string;
      time_from?: string;
      time_to?: string;
    },
  ];
};

export type CdekEntityResponse = {
  entity?: {
    uuid: string;
  };
  requests: {
    request_uuid?: string;
    type:
      | "CREATE"
      | "UPDATE"
      | "DELETE"
      | "AUTH"
      | "GET"
      | "CREATE_CLIENT_RETURN";
    date_time: string;
    state: "ACCEPTED" | "WAITING" | "SUCCESSFUL" | "INVALID";
    errors?: {
      code?: string;
      message?: string;
    }[];
    warnings?: {
      code?: string;
      message?: string;
    }[];
  }[];
  related_entities?: {
    uuid?: string;
    type?: string;
  }[];
};
