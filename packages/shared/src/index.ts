export const isString = (val: unknown): val is string => typeof val === 'string'
export const isArray = Array.isArray
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'
export const isIntegerKey = (key: unknown) =>
  isString(key)
  && key !== 'NaN'
  && key[0] !== '-'
  && `${parseInt(key, 10)}` === key

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val: object,
  key: string | symbol,
): key is keyof typeof val => hasOwnProperty.call(val, key)

export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string =>
  objectToString.call(value)

export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}

export const extend = Object.assign
