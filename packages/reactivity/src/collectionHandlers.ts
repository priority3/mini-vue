import { hasOwn } from '@mini-vue/shared'
import { ReactiveFlags } from './reactive'

export type CollectionTypes = IterableCollections | WeakCollections

type IterableCollections = Map<any, any> | Set<any>
type WeakCollections = WeakMap<any, any> | WeakSet<any>

function createInstrumentations() {
  const mutableInstrumentations: Record<string, Function> = {

  }
  const readonlyInstrumentations: Record<string, Function> = {

  }
  const shallowInstrumentations: Record<string, Function> = {

  }
  const shallowReadonlyInstrumentations: Record<string, Function> = {

  }

  return [
    mutableInstrumentations,
    readonlyInstrumentations,
    shallowInstrumentations,
    shallowReadonlyInstrumentations,
  ]
}

const [
  mutableInstrumentations,
  readonlyInstrumentations,
  shallowInstrumentations,
  shallowReadonlyInstrumentations,
] = createInstrumentations()

function createInstrumentationGetter(isReadonly, shallow) {
  const instrumentations
  = shallow
    ? isReadonly ? shallowReadonlyInstrumentations : shallowInstrumentations
    : isReadonly ? readonlyInstrumentations : mutableInstrumentations

  return (
    target: CollectionTypes,
    key: string | symbol,
    receiver: CollectionTypes,
  ) => {
    if (key === ReactiveFlags.IS_REACTIVE)
      return !isReadonly

    else if (key === ReactiveFlags.IS_READONLY)
      return isReadonly

    else if (key === ReactiveFlags.RAW)
      return target

    return Reflect.get(
      hasOwn(instrumentations, key) && key in target
        ? instrumentations
        : target,
      key,
      receiver,
    )
  }
}

export const mutableCollectionHandlers: ProxyHandler<CollectionTypes> = {
  get: createInstrumentationGetter(false, false),
}
