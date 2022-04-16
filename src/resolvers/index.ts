import { BlockValueResolver } from './BlockValueResolver'
import { StorageAssetResolver } from './StorageAssetResolver'

export const defaultResolvers = [
  BlockValueResolver,
  StorageAssetResolver,
] as const
