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
