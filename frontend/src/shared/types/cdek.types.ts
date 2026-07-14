export type CdekSuggestedCity = {
  uuid: string;
  code: number;
  label: string;
  countryCode: string;
};

export type CdekPackageParams = {
  weight: number;
  length: number;
  width: number;
  height: number;
};

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

export type CdekOffice = {
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
