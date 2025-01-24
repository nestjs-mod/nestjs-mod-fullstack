import { HttpParameterCodec } from '@angular/common/http';
import { Param } from './param';
export interface RestClientConfigurationParameters {
  /**
   *  @deprecated Since 5.0. Use credentials instead
   */
  apiKeys?: {
    [key: string]: string;
  };
  username?: string;
  password?: string;
  /**
   *  @deprecated Since 5.0. Use credentials instead
   */
  accessToken?: string | (() => string);
  basePath?: string;
  withCredentials?: boolean;
  /**
   * Takes care of encoding query- and form-parameters.
   */
  encoder?: HttpParameterCodec;
  /**
   * Override the default method for encoding path parameters in various
   * <a href="https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#style-values">styles</a>.
   * <p>
   * See {@link README.md} for more details
   * </p>
   */
  encodeParam?: (param: Param) => string;
  /**
   * The keys are the names in the securitySchemes section of the OpenAPI
   * document. They should map to the value used for authentication
   * minus any standard prefixes such as 'Basic' or 'Bearer'.
   */
  credentials?: {
    [key: string]: string | (() => string | undefined);
  };
}
export declare class RestClientConfiguration {
  /**
   *  @deprecated Since 5.0. Use credentials instead
   */
  apiKeys?: {
    [key: string]: string;
  };
  username?: string;
  password?: string;
  /**
   *  @deprecated Since 5.0. Use credentials instead
   */
  accessToken?: string | (() => string);
  basePath?: string;
  withCredentials?: boolean;
  /**
   * Takes care of encoding query- and form-parameters.
   */
  encoder?: HttpParameterCodec;
  /**
   * Encoding of various path parameter
   * <a href="https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#style-values">styles</a>.
   * <p>
   * See {@link README.md} for more details
   * </p>
   */
  encodeParam: (param: Param) => string;
  /**
   * The keys are the names in the securitySchemes section of the OpenAPI
   * document. They should map to the value used for authentication
   * minus any standard prefixes such as 'Basic' or 'Bearer'.
   */
  credentials: {
    [key: string]: string | (() => string | undefined);
  };
  constructor(configurationParameters?: RestClientConfigurationParameters);
  /**
   * Select the correct content-type to use for a request.
   * Uses {@link RestClientConfiguration#isJsonMime} to determine the correct content-type.
   * If no content type is found return the first found type if the contentTypes is not empty
   * @param contentTypes - the array of content types that are available for selection
   * @returns the selected content-type or <code>undefined</code> if no selection could be made.
   */
  selectHeaderContentType(contentTypes: string[]): string | undefined;
  /**
   * Select the correct accept content-type to use for a request.
   * Uses {@link RestClientConfiguration#isJsonMime} to determine the correct accept content-type.
   * If no content type is found return the first found type if the contentTypes is not empty
   * @param accepts - the array of content types that are available for selection.
   * @returns the selected content-type or <code>undefined</code> if no selection could be made.
   */
  selectHeaderAccept(accepts: string[]): string | undefined;
  /**
   * Check if the given MIME is a JSON MIME.
   * JSON MIME examples:
   *   application/json
   *   application/json; charset=UTF8
   *   APPLICATION/JSON
   *   application/vnd.company+json
   * @param mime - MIME (Multipurpose Internet Mail Extensions)
   * @return True if the given MIME is JSON, false otherwise.
   */
  isJsonMime(mime: string): boolean;
  lookupCredential(key: string): string | undefined;
  private defaultEncodeParam;
}
