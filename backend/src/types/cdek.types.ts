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
